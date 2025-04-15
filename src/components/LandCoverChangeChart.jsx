// src/components/LandCoverChangeChart.jsx
import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
    selectedStateAtom, selectedDistrictAtom,
    selectedSubdistrictAtom, selectedVillageAtom,
    landCoverChartDataAtom
} from '../recoil/selectAtoms';
import { get_area_change, get_rainfall_data } from '../services/api';
import Spinner from './Spinner'; // Import Spinner

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LandCoverChangeChart = ({ onDataChange, onDataLoaded }) => {
    const stateName = useRecoilValue(selectedStateAtom);
    const districtName = useRecoilValue(selectedDistrictAtom);
    const subdistrictName = useRecoilValue(selectedSubdistrictAtom);
    const villageName = useRecoilValue(selectedVillageAtom);
    const setChartData = useSetRecoilState(landCoverChartDataAtom);
    const [isLoading, setLoading] = useState(false);
    const chartData = useRecoilValue(landCoverChartDataAtom);
    
    // Track the last loaded village to prevent redundant API calls
    const lastLoadedVillage = useRef(null);

    const options = {
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
                    text: 'Area (ha)',
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

    useEffect(() => {
        // Only fetch data if we have all required information and haven't loaded this village yet
        if (stateName && districtName && subdistrictName && villageName &&
            (lastLoadedVillage.current !== villageName.label)) {
            
            setLoading(true);
            
            const villageValue = villageName.label;
            
            // Update the last loaded village
            lastLoadedVillage.current = villageValue;
            
            const fetchLandCover = get_area_change(stateName, districtName.value, subdistrictName.label, villageValue);
            const fetchRainfall = get_rainfall_data(stateName, districtName.value, subdistrictName.label, villageValue);

            Promise.all([fetchLandCover, fetchRainfall])
                .then(([landCoverData, rainfallData]) => {
                    const labels = Object.keys(landCoverData);
                    const datasets = [{
                        label: 'Single Cropland',
                        type: 'line',
                        data: labels.map(label => landCoverData[label]['Single cropping cropland']),
                        borderColor: '#8b9dc3',
                        backgroundColor: 'rgba(139, 157, 195, 0.5)',
                        yAxisID: 'y',
                    }, {
                        label: 'Double Cropland',
                        type: 'line',
                        data: labels.map(label => landCoverData[label]['Double cropping cropland']),
                        borderColor: '#222f5b',
                        backgroundColor: 'rgba(34, 47, 91, 0.5)',
                        yAxisID: 'y',
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
                        label: 'Rainfall',
                        type: 'bar',
                        data: rainfallData.rainfall_data.map(entry => entry[1]),
                        borderColor: 'blue',
                        backgroundColor: 'rgba(0, 0, 255, 0.5)',
                        yAxisID: 'y1',
                        borderWidth: 0,
                    }];
                    setChartData({ labels, datasets });
                    if (onDataChange) {
                        onDataChange({ labels, datasets });
                    }
                    setLoading(false);
                    if (onDataLoaded) {
                        onDataLoaded(true);
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setLoading(false);
                    if (onDataLoaded) {
                        onDataLoaded(false);
                    }
                });
        } else if (chartData.datasets.length > 0 && onDataLoaded) {
            // If we already have data and just switched tabs, notify that data is loaded
            setLoading(false);
            onDataLoaded(true);
        }
    // Only re-run if village or state info changes, not on every render or callback change
    }, [stateName, districtName, subdistrictName, villageName?.label]);

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
    onDataLoaded: PropTypes.func
};

LandCoverChangeChart.defaultProps = {
    onDataChange: () => {},
    onDataLoaded: () => {}
};

export default LandCoverChangeChart;
