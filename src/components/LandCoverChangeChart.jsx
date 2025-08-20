// src/components/LandCoverChangeChart.jsx
import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
    selectedStateAtom, selectedDistrictAtom,
    selectedSubdistrictAtom, selectedVillageAtom,
    landCoverChartDataAtom
} from '../recoil/selectAtoms';
import { get_area_change, get_rainfall_data } from '../services/api';
import Spinner from './Spinner'; // Import Spinner

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

const LandCoverChangeChart = ({ onDataChange, interventionStartYear, interventionEndYear }) => {
    const stateName = useRecoilValue(selectedStateAtom);
    const districtName = useRecoilValue(selectedDistrictAtom);
    const subdistrictName = useRecoilValue(selectedSubdistrictAtom);
    const villageName = useRecoilValue(selectedVillageAtom);
    const setChartData = useSetRecoilState(landCoverChartDataAtom);
    const chartRef = useRef(null);
    const [isLoading, setLoading] = useState(false);
    const chartData = useRecoilValue(landCoverChartDataAtom);

    // Calculate water access from land cover data
    const calculateWaterAccess = (landCoverData) => {
        const waterAccessData = {};
        
        Object.keys(landCoverData).forEach(year => {
            const singleCrop = landCoverData[year]['Single cropping cropland'] || 0;
            const doubleCrop = landCoverData[year]['Double cropping cropland'] || 0;
            
            // Calculate water access: (single + double) / single
            let waterAccess = 1; // Default value
            if (singleCrop > 0) {
                waterAccess = (singleCrop + doubleCrop) / singleCrop;
            }
            
            waterAccessData[year] = Math.round(waterAccess * 100) / 100; // Round to 2 decimal places
        });
        
        return waterAccessData;
    };

    // Create chart options with intervention period highlighting
    const createChartOptions = () => {
        const baseOptions = {
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    ticks: {
                        color: 'black',
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                    },
                    title: {
                        display: true,
                        text: 'Cropping Area (Hectares)',
                        color: 'black',
                    },
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    ticks: {
                        color: 'blue',
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Rainfall (mm)',
                        color: 'blue',
                    },
                },
                x: {
                    ticks: {
                        color: 'black',
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'black',
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20
                    },
                    onClick: (e, legendItem, legend) => {
                        const chart = legend.chart;
                        const datasetIndex = legendItem.datasetIndex;
                        const datasets = chart.data.datasets;
                        const clicked = datasets[datasetIndex];

                        const label = clicked.label;
                        const isSingle = label === 'Single Cropland';
                        const isDouble = label === 'Double Cropland';
                        const isTree = label === 'Tree Cover';
                        const isWater = label === 'Water Access';
                        const isRain = label === 'Rainfall';

                        // Helper to set primary Y axis title
                        const setPrimaryAxisTitle = () => {
                            const visible = (l) => {
                                const ds = datasets.find(d => d.label === l);
                                return ds ? !ds.hidden : false;
                            };
                            if (visible('Water Access')) {
                                chart.options.scales.y.title.text = 'Water Access';
                                return;
                            }
                            if (visible('Tree Cover')) {
                                chart.options.scales.y.title.text = 'Tree Cover Area (Hectares)';
                                return;
                            }
                            if (visible('Single Cropland') || visible('Double Cropland')) {
                                chart.options.scales.y.title.text = 'Cropping Area (Hectares)';
                                return;
                            }
                            chart.options.scales.y.title.text = 'Cropping Area (Hectares)';
                        };

                        if (isRain) {
                            // Toggle rainfall independently
                            clicked.hidden = !clicked.hidden;
                            chart.update();
                            return;
                        }

                        if (isSingle || isDouble) {
                            // Toggle clicked cropland series
                            clicked.hidden = !clicked.hidden;
                            // Ensure Tree Cover and Water Access are off
                            const tree = datasets.find(d => d.label === 'Tree Cover');
                            const water = datasets.find(d => d.label === 'Water Access');
                            if (tree) tree.hidden = true;
                            if (water) water.hidden = true;
                            setPrimaryAxisTitle();
                            chart.update();
                            return;
                        }

                        if (isTree) {
                            // Toggle tree cover and turn off cropland and water
                            clicked.hidden = !clicked.hidden;
                            const single = datasets.find(d => d.label === 'Single Cropland');
                            const doubleC = datasets.find(d => d.label === 'Double Cropland');
                            const water = datasets.find(d => d.label === 'Water Access');
                            if (!clicked.hidden) {
                                if (single) single.hidden = true;
                                if (doubleC) doubleC.hidden = true;
                                if (water) water.hidden = true;
                            }
                            setPrimaryAxisTitle();
                            chart.update();
                            return;
                        }

                        if (isWater) {
                            // Toggle water access and turn off cropland and tree
                            clicked.hidden = !clicked.hidden;
                            const single = datasets.find(d => d.label === 'Single Cropland');
                            const doubleC = datasets.find(d => d.label === 'Double Cropland');
                            const tree = datasets.find(d => d.label === 'Tree Cover');
                            if (!clicked.hidden) {
                                if (single) single.hidden = true;
                                if (doubleC) doubleC.hidden = true;
                                if (tree) tree.hidden = true;
                            }
                            setPrimaryAxisTitle();
                            chart.update();
                            return;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Land Cover and Rainfall Change Over Time',
                    color: 'black',
                    font: {
                        size: 18,
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'white',
                    bodyColor: 'black',
                    titleColor: 'black',
                    borderColor: 'black',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            
                             // Round off the value to 2 decimal places and add an asterisk
                            let value = (Math.round(context.raw * 100) / 100).toFixed(2) + '*';
                
                            // Append units based on the dataset
                            if (context.dataset.label === 'Single Cropland' || context.dataset.label === 'Double Cropland' || context.dataset.label === 'Tree Cover' ) {
                                label += `${value} ha`; // hectares for cropland area
                            } else if (context.dataset.label === 'Rainfall') {
                                label += `${value} mm`; // millimeters for rainfall
                            } else if (context.dataset.label === 'Water Access') {
                                label += value; // ratio, no units
                            }
                            return label;
                        },
                        footer: function() {
                            return '*Values rounded off to 2 decimal points';
                        }
                    },
                    footerColor: 'black',
                    footerFont: {
                        size: 10,
                        style: 'italic',
                    }
                }
                
            },
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                point: {
                    radius: 5,
                },
                line: {
                    borderWidth: 3,
                }
            },
            backgroundColor: 'white',
        };

        // Add simple background highlighting for intervention period
        if (interventionStartYear && interventionEndYear) {
            baseOptions.plugins.annotation = {
                annotations: {
                    interventionPeriod: {
                        type: 'box',
                        xMin: interventionStartYear,
                        xMax: interventionEndYear,
                        backgroundColor: 'rgba(251, 146, 60, 0.2)', // Light orange background
                        borderWidth: 0,
                        drawTime: 'beforeDatasetsDraw'
                    }
                }
            };
        }

        return baseOptions;
    };

    const options = createChartOptions();

    useEffect(() => {
        setLoading(true); 
        
        const villageValue = villageName.label; 
        // Set loading to true when API call starts
        if (stateName && districtName && subdistrictName && villageValue) {
            const stateNameValue = stateName?.label || stateName;
            const districtNameValue = districtName.label;
            const fetchLandCover = get_area_change(stateNameValue, districtNameValue, subdistrictName.label, villageValue);
            const fetchRainfall = get_rainfall_data(stateNameValue, districtNameValue, subdistrictName.label, villageValue);

            // Handle land cover and rainfall separately to ensure resilience
            fetchLandCover
                .then(landCoverData => {
                    const labels = Object.keys(landCoverData);
                    
                    // Calculate and log water access
                    const waterAccess = calculateWaterAccess(landCoverData);
                    
                    console.log('=== WATER ACCESS CALCULATION (Single Village) ===');
                    console.log(`Village (${villageValue}) Water Access:`, waterAccess);
                    console.log('Water Access Formula: (Single Cropping + Double Cropping) / Single Cropping');
                    console.log('================================================');
                    const datasets = [{
                        label: 'Single Cropland',
                        type: 'line',
                        data: labels.map(label => landCoverData[label]['Single cropping cropland']),
                        borderColor: '#8b9dc3',
                        backgroundColor: 'rgba(139, 157, 195, 0.5)',
                        yAxisID: 'y',
                        hidden: false,
                    }, {
                        label: 'Double Cropland',
                        type: 'line',
                        data: labels.map(label => landCoverData[label]['Double cropping cropland']),
                        borderColor: '#222f5b',
                        backgroundColor: 'rgba(34, 47, 91, 0.5)',
                        yAxisID: 'y',
                        hidden: false,
                    },
                    {
                        label: 'Tree Cover',
                        type: 'line',
                        data: labels.map(label => landCoverData[label]['Tree Cover Area']),
                        borderColor: 'green',
                        backgroundColor: 'rgba(0, 128, 0, 0.5)',
                        yAxisID: 'y',
                        hidden: true,
                    },
                    {
                        label: 'Water Access',
                        type: 'line',
                        data: labels.map(label => waterAccess[label]),
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.5)',
                        yAxisID: 'y',
                        hidden: true
                    }];

                    // Try to fetch rainfall data, but don't let it block the chart
                    fetchRainfall
                        .then(rainfallData => {
                            if (rainfallData && rainfallData.rainfall_data && !rainfallData.error) {
                                // Add rainfall data if available
                                datasets.push({
                                    label: 'Rainfall',
                                    type: 'bar',
                                    data: rainfallData.rainfall_data.map(entry => entry[1]),
                                    borderColor: 'blue',
                                    backgroundColor: 'rgba(0, 0, 255, 0.5)',
                                    yAxisID: 'y1',
                                    hidden: false,
                                });
                            }
                        })
                        .catch(rainfallError => {
                            console.warn('Rainfall data unavailable:', rainfallError);
                            // Don't block the chart - just proceed without rainfall data
                        })
                        .finally(() => {
                            // Set chart data regardless of rainfall success/failure
                            setChartData({ labels, datasets });
                            // Ensure initial axis title for cropping area
                            // This will be respected by legend onClick handler updates
                            
                            if (onDataChange) {
                                onDataChange({ labels, datasets });
                            }
                            setLoading(false);
                        });
                })
                .catch(error => {
                    console.error('Error fetching land cover data:', error);
                    setLoading(false);  // Ensure loading is set to false on error
                });
        }
    }, [stateName, districtName, subdistrictName, villageName, onDataChange, setChartData]);

    return (
        <div className="w-full h-64 bg-white flex justify-center items-center relative">
            {isLoading ? (
              <div className="absolute inset-0 flex justify-center items-center">
              <Spinner />
          </div>
            ) : chartData.datasets.length > 0 ? (
                <Line data={chartData} options={options} />
            ) : (
                <p className="text-center">No data available to display the chart.</p>
            )}
        </div>
    );
};


LandCoverChangeChart.propTypes = {
    onDataChange: PropTypes.func,
    interventionStartYear: PropTypes.string,
    interventionEndYear: PropTypes.string,
};

LandCoverChangeChart.defaultProps = {
    onDataChange: null,
    interventionStartYear: null,
    interventionEndYear: null,
};

export default LandCoverChangeChart;
