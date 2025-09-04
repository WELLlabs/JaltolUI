import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { get_area_change, get_control_village, get_rainfall_data } from '../services/api';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import {
    selectedStateAtom, selectedDistrictAtom,
    selectedSubdistrictAtom, selectedVillageAtom,
    interventionChartDataAtom, selectedControlSubdistrictAtom, 
    selectedControlVillageAtom, customPolygonDataAtom,
    showPolygonDataAtom, polygonChartDataAtom
} from '../recoil/selectAtoms';
import Spinner from './Spinner';
import DataToggle from './DataToggle';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

const InterventionCompareChart = ({ onDataChange, interventionStartYear, interventionEndYear }) => {
    const stateName = useRecoilValue(selectedStateAtom);
    const districtName = useRecoilValue(selectedDistrictAtom);
    const subdistrictName = useRecoilValue(selectedSubdistrictAtom);
    const villageName = useRecoilValue(selectedVillageAtom);
    const [isLoading, setLoading] = useState(false);
    const chartData = useRecoilValue(interventionChartDataAtom);
    const setChartData = useSetRecoilState(interventionChartDataAtom);
    const [controlSubdistrict, setControlSubdistrict] = useRecoilState(selectedControlSubdistrictAtom);
    const [controlVillage, setControlVillage] = useRecoilState(selectedControlVillageAtom);
    const [datasetVisibility, setDatasetVisibility] = useState({});
    const chartRef = useRef(null);
    
    // Add new state for custom polygon data
    const customPolygonData = useRecoilValue(customPolygonDataAtom);
    const showPolygonData = useRecoilValue(showPolygonDataAtom);
    const [polygonChartData, setPolygonChartData] = useRecoilState(polygonChartDataAtom);

    // Create chart options with intervention period highlighting
    const createChartOptions = () => {
        const baseOptions = {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'black',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    },
                    title: {
                        display: true,
                        text: 'Area (ha)',
                        color: 'black',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    position: 'left'
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for y1 axis
                    },
                    ticks: {
                        color: '#00BFFF',
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: true,
                        text: 'Rainfall (mm)',
                        color: '#00BFFF',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                },
                x: {
                    ticks: {
                        color: 'black',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    }
                }
            },
            plugins: {
                legend: {
                    display: false, // Hide the default legend
                },
                title: {
                    display: false, // Hide the default title
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
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                
                            // Use context.parsed.y to access the displayed value and round it off
                            let value = (Math.round(context.parsed.y * 100) / 100).toFixed(2) + '*';
                
                            // Append units based on the dataset
                            if (context.dataset.label.includes('Single Cropland') || context.dataset.label.includes('Double Cropland')) {
                                label += `${value} ha`; // hectares for cropland area
                            } else if (context.dataset.label.includes('Rainfall')) {
                                label += `${value} mm`; // millimeters for rainfall
                            }
                            return label;
                        },
                        footer: function() {
                            return '*Values rounded off to 2 decimal points';
                        }
                    },
                    footerColor: 'black', // Set footer text color to black
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
                    radius: 4,
                    hoverRadius: 6
                },
                line: {
                    borderWidth: 2,
                    tension: 0.1
                }
            },
            backgroundColor: 'white',
        };

        // Add intervention period highlighting if both start and end years are provided
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

    // Effect for fetching control village data
    useEffect(() => {
        setLoading(true);
        if (stateName && districtName && subdistrictName && villageName) {
            console.log('Fetching control village data');
            const stateNameValue = stateName?.label || stateName;
            const districtNameValue = districtName.label;
            const villageValue = villageName.label;

            get_control_village(stateNameValue, districtNameValue, subdistrictName.label, villageValue)
                .then(response => {
                    const controlVillageName = response.properties?.village_na;
                    const controlSubdistrict = response.properties?.subdistric;
                    console.log('Control Village:', controlVillageName);
                    setControlSubdistrict({ label: controlSubdistrict, value: controlSubdistrict });
                    setControlVillage({ label: controlVillageName, value: controlVillageName });
                })
                .catch(error => {
                    console.error('Error fetching control village data:', error);
                });
        }
    }, [stateName, districtName, subdistrictName, villageName]);

    // Effect for fetching village-level chart data
    useEffect(() => {
        // This effect runs only when controlVillage is set
        if (controlVillage?.value && controlSubdistrict && stateName && districtName && subdistrictName && villageName) {
            setLoading(true)
            const stateNameValue = stateName?.label || stateName;
            const districtNameValue = districtName.label;
            const subdistrictValue = subdistrictName.label;
            const villageValue = villageName.label;
            const controlSubdistrictName = controlSubdistrict.label;
            const controlVillageName = controlVillage.label;
            console.log('Making API call with:', stateNameValue, districtNameValue, subdistrictName, villageValue);
            const fetchLandCover = get_area_change(stateNameValue, districtNameValue, subdistrictValue, villageValue);
            const fetchRainfall = get_rainfall_data(stateNameValue, districtNameValue, subdistrictValue, villageValue);

            const fetchControlLandCover = get_area_change(stateNameValue, districtNameValue, controlSubdistrictName, controlVillageName);
            const fetchControlRainfall = get_rainfall_data(stateNameValue, districtNameValue, controlSubdistrictName, controlVillageName);

            // Handle land cover and rainfall separately to ensure resilience
            Promise.all([fetchLandCover, fetchControlLandCover])
                .then(([landCoverData, controlLandCoverData]) => {
                    const labels = Object.keys(landCoverData);
                    const datasets = [
                        {
                            label: `Single Cropland - ${villageValue}`,
                            type: 'line',  // Line chart for single cropland
                            data: labels.map(label => landCoverData[label]['Single cropping cropland']),
                            borderColor: '#0096FF',
                            backgroundColor: 'rgba(139, 157, 195, 0.2)',  // Lighter and more transparent
                            yAxisID: 'y',
                        },
                        {
                            label: `Double Cropland - ${villageValue}`,
                            type: 'line',  // Line chart for double cropland
                            data: labels.map(label => landCoverData[label]['Double cropping cropland']),
                            borderColor: '#222f5b',
                            backgroundColor: 'rgba(34, 47, 91, 0.2)',  // Lighter and more transparent
                            yAxisID: 'y',
                        },
                        {
                            label: `Tree Cover - ${villageValue}`,
                            type: 'line',  // Line chart for double cropland
                            data: labels.map(label => landCoverData[label]['Tree Cover Area']),
                            borderColor: 'green',
                            backgroundColor: 'rgba(0, 128, 0, 0.2)',  // Lighter and more transparent
                            yAxisID: 'y',
                            hidden: true,
                        },
                        {
                            label: `Single Cropland - ${controlVillageName}`,
                            type: 'line',  // Line chart for control village single cropland
                            data: labels.map(label => controlLandCoverData[label]['Single cropping cropland']),
                            borderColor: '#FFA07A',  // Salmon color
                            backgroundColor: 'rgba(255, 160, 122, 0.2)',  // Lighter salmon, transparent
                            yAxisID: 'y',
                            borderDash: [10, 5],  // Dotted line
                        },
                        {
                            label: `Double Cropland - ${controlVillageName}`,
                            type: 'line',  // Line chart for control village double cropland
                            data: labels.map(label => controlLandCoverData[label]['Double cropping cropland']),
                            borderColor: '#20B2AA',  // Light Sea Green
                            backgroundColor: 'rgba(32, 178, 170, 0.2)',  // Matching color, more transparent
                            yAxisID: 'y',
                            borderDash: [10, 5],  // Dotted line
                        },
                        {
                            label: `Tree Cover - ${controlVillageName}`,
                            type: 'line',  // Line chart for control village double cropland
                            data: labels.map(label => controlLandCoverData[label]['Tree Cover Area']),
                            borderColor: 'green',  // Light Sea Green
                            backgroundColor: 'rgba(0, 128, 0, 0.2)',  // Matching color, more transparent
                            yAxisID: 'y',
                            borderDash: [10, 5],  // Dotted line
                            hidden: true,
                        }
                    ];

                    // Try to fetch rainfall data, but don't let it block the chart
                    const rainfallPromises = [fetchRainfall, fetchControlRainfall];
                    Promise.allSettled(rainfallPromises)
                        .then(rainfallResults => {
                            // Handle intervention village rainfall
                            if (rainfallResults[0].status === 'fulfilled' && 
                                rainfallResults[0].value && 
                                rainfallResults[0].value.rainfall_data && 
                                !rainfallResults[0].value.error) {
                                datasets.push({
                                    label: `Rainfall - ${villageValue}`,
                                    type: 'bar',  // Bar chart for rainfall
                                    data: rainfallResults[0].value.rainfall_data.map(entry => entry[1]),
                                    borderColor: '#00BFFF',
                                    backgroundColor: 'rgba(0, 191, 255, 0.5)',  // Matching light blue, more vivid
                                    yAxisID: 'y1',
                                });
                            }

                            // Handle control village rainfall
                            if (rainfallResults[1].status === 'fulfilled' && 
                                rainfallResults[1].value && 
                                rainfallResults[1].value.rainfall_data && 
                                !rainfallResults[1].value.error) {
                                datasets.push({
                                    label: `Rainfall - ${controlVillageName}`,
                                    type: 'bar',  // Bar chart for control village rainfall
                                    data: rainfallResults[1].value.rainfall_data.map(entry => entry[1]),
                                    borderColor: '#C71585',  // Medium Violet Red
                                    backgroundColor: 'rgba(199, 21, 133, 0.5)',  // Matching color, more vivid
                                    yAxisID: 'y1',
                                    borderDash: [10, 5],  // Dotted line, though typically not noticeable on bars
                                });
                            }
                        })
                        .catch(rainfallError => {
                            console.warn('Rainfall data unavailable:', rainfallError);
                        })
                        .finally(() => {
                            // Set chart data regardless of rainfall success/failure
                            setChartData({ labels, datasets });

                            // Initialize dataset visibility state
                            setDatasetVisibility(
                                datasets.reduce((acc, dataset, index) => {
                                    acc[index] = !dataset.hidden; // Reflect hidden status
                                    return acc;
                                }, {})
                            );

                            // Only call onDataChange if it's a valid function
                            if (typeof onDataChange === 'function') {
                                onDataChange({ labels, datasets });
                            }
                            setLoading(false); // Pass data to the parent component
                        });
                })
                .catch(error => {
                    console.error('Error fetching land cover data:', error);
                    setLoading(false);
                });
        }
    }, [controlVillage, stateName, districtName, subdistrictName, villageName, setChartData]);

    // New effect to create polygon chart data when custom polygon data changes
    useEffect(() => {
        if (customPolygonData && controlVillage?.value && stateName && districtName) {
            const villageValue = villageName.label;
            const controlVillageName = controlVillage.label;
            
            // Extract the multi-year data from customPolygonData
            const { interventionStats, controlStats } = customPolygonData;
            
            // Get all available years from both intervention and control stats
            const years = Object.keys(interventionStats || {}).sort();
            
            if (years.length === 0) {
                console.error("No yearly data found in the polygon stats");
                return;
            }
            
            // Create datasets for each year's data - only for land cover, no rainfall
            const datasets = [
                {
                    label: `Single Cropland (Polygon) - ${villageValue}`,
                    type: 'line',
                    data: years.map(year => interventionStats[year]?.single_crop || 0),
                    borderColor: '#0096FF',
                    backgroundColor: 'rgba(139, 157, 195, 0.2)',
                    yAxisID: 'y',
                },
                {
                    label: `Double Cropland (Polygon) - ${villageValue}`,
                    type: 'line',
                    data: years.map(year => interventionStats[year]?.double_crop || 0),
                    borderColor: '#222f5b',
                    backgroundColor: 'rgba(34, 47, 91, 0.2)',
                    yAxisID: 'y',
                },
                {
                    label: `Tree Cover (Polygon) - ${villageValue}`,
                    type: 'line',
                    data: years.map(year => interventionStats[year]?.tree_cover || 0),
                    borderColor: 'green',
                    backgroundColor: 'rgba(0, 128, 0, 0.2)',
                    yAxisID: 'y',
                    hidden: true,
                },
                {
                    label: `Single Cropland (Circles) - ${controlVillageName}`,
                    type: 'line',
                    data: years.map(year => controlStats[year]?.single_crop || 0),
                    borderColor: '#FFA07A',
                    backgroundColor: 'rgba(255, 160, 122, 0.2)',
                    yAxisID: 'y',
                    borderDash: [10, 5],
                },
                {
                    label: `Double Cropland (Circles) - ${controlVillageName}`,
                    type: 'line',
                    data: years.map(year => controlStats[year]?.double_crop || 0),
                    borderColor: '#20B2AA',
                    backgroundColor: 'rgba(32, 178, 170, 0.2)',
                    yAxisID: 'y',
                    borderDash: [10, 5],
                },
                {
                    label: `Tree Cover (Circles) - ${controlVillageName}`,
                    type: 'line',
                    data: years.map(year => controlStats[year]?.tree_cover || 0),
                    borderColor: 'green',
                    backgroundColor: 'rgba(0, 128, 0, 0.2)',
                    yAxisID: 'y',
                    borderDash: [10, 5],
                    hidden: true,
                }
                // Note: Rainfall bars are intentionally excluded for polygon view
            ];
            
            setPolygonChartData({ labels: years, datasets });
            
            // Initialize visibility for polygon datasets
            setDatasetVisibility(
                datasets.reduce((acc, dataset, index) => {
                    acc[index] = !dataset.hidden;
                    return acc;
                }, {})
            );
        }
    }, [customPolygonData, villageName, controlVillage, stateName, districtName]);

    const toggleDatasetVisibility = (index) => {
        const currentData = showPolygonData ? polygonChartData : chartData;
        
        setDatasetVisibility(prev => {
            const newVisibility = { ...prev, [index]: !prev[index] };
            const newDatasets = currentData.datasets.map((dataset, i) => ({
                ...dataset,
                hidden: !newVisibility[i],
            }));
            
            if (showPolygonData) {
                setPolygonChartData({ ...currentData, datasets: newDatasets });
            } else {
                setChartData({ ...currentData, datasets: newDatasets });
            }
            
            return newVisibility;
        });
    };

    const renderLegend = () => {
        const currentData = showPolygonData ? polygonChartData : chartData;
        
        if (!currentData || !currentData.datasets || currentData.datasets.length === 0) {
            return null;
        }
        
        return (
            <div className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm font-medium mb-2 text-gray-700">Legend</div>
                <ul className="flex flex-wrap justify-start gap-x-6 gap-y-2">
                    {currentData.datasets.map((dataset, index) => (
                        <li
                            key={index}
                            className="flex items-center cursor-pointer transition-all hover:bg-gray-100 px-2 py-1 rounded"
                            onClick={() => toggleDatasetVisibility(index)}
                            style={{
                                textDecoration: datasetVisibility[index] ? 'none' : 'line-through',
                                opacity: datasetVisibility[index] ? 1 : 0.5,
                                color: 'black', // Ensure legend text is always black
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: '20px',
                                    height: '10px',
                                    borderTop: `3px ${dataset.borderDash ? 'dashed' : 'solid'} ${dataset.borderColor}`,
                                    marginRight: '8px',
                                }}
                            ></span>
                            <span className="text-sm">{dataset.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    // Determine which data to display based on toggle
    const displayData = showPolygonData && customPolygonData ? polygonChartData : chartData;
    const hasData = displayData && displayData.datasets && displayData.datasets.length > 0;

    return (
        <div className="w-full bg-white flex flex-col items-center relative z-9999 p-4">
            <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-center text-black text-2xl font-semibold">Land Cover Change Over Time</h2>
                {customPolygonData && (
                    <DataToggle />
                )}
            </div>
            
            {isLoading ? (
                <div className="absolute inset-0 flex justify-center items-center">
                    <Spinner />
                </div>
            ) : hasData ? (
                <>
                    <div className="w-full mt-2 mb-4">{renderLegend()}</div>
                    <div className="w-full h-96 mt-2">
                        <Line ref={chartRef} data={displayData} options={options} />
                    </div>
                </>
            ) : (
                <p className="text-center py-10">No data available to display the chart.</p>
            )}
            
            {showPolygonData && !customPolygonData && (
                <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
                    Please upload a polygon using the Polygon button on the intervention map to view polygon-specific data.
                </div>
            )}
        </div>
    );
};

InterventionCompareChart.propTypes = {
    onDataChange: PropTypes.func, // Made optional since parent might not always pass it
    interventionStartYear: PropTypes.string,
    interventionEndYear: PropTypes.string,
};

export default InterventionCompareChart;