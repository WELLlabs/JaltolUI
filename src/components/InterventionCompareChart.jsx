// src/components/InterventionCompareChart.jsx
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { get_area_change, get_control_village, get_rainfall_data } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const InterventionCompareChart = ({ stateName, districtName, subdistrictName, villageName, onDataChange }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });
    const [controlVillage, setControlVillage] = useState(null);

    const options = {
        scales: {
            y: {
                beginAtZero: true,
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
                text: 'Land Cover Change Over Time',
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
                borderWidth: 1
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
        if (stateName && districtName && subdistrictName && villageName) {
            console.log('Fetching control village data');
            const districtValue = districtName.value;

            get_control_village(stateName, districtValue, subdistrictName.value, villageName)
                .then(response => {
                    const controlVillageName = response.properties?.village_na;
                    console.log('Control Village:', controlVillageName);
                    setControlVillage(controlVillageName);  // Update state, triggers re-render
                })
                .catch(error => {
                    console.error('Error fetching control village data:', error);
                });
        }
    }, [stateName, districtName, subdistrictName, villageName]);  // Dependency array for the first effect

    useEffect(() => {
        // This effect runs only when controlVillage is set
        if (controlVillage && stateName && districtName && subdistrictName && villageName) {
            const districtValue = districtName.value;
            const subdistrictValue = subdistrictName.value
            console.log('Making API call with:', stateName, districtName, subdistrictName, villageName);
            const fetchLandCover = get_area_change(stateName, districtValue, subdistrictValue, villageName);
            const fetchRainfall = get_rainfall_data(stateName, districtValue, subdistrictValue, villageName);

            const fetchControlLandCover = get_area_change(stateName, districtValue, subdistrictValue, controlVillage);
            const fetchControlRainfall = get_rainfall_data(stateName, districtValue, subdistrictValue, controlVillage);

            Promise.all([fetchLandCover, fetchRainfall, fetchControlLandCover, fetchControlRainfall])
                .then(([landCoverData, rainfallData, controlLandCoverData, controlRainfallData]) => {
                    const labels = Object.keys(landCoverData);
                    const datasets = [
                        {
                            label: `Single Cropland - ${villageName}`,
                            type: 'line',  // Line chart for single cropland
                            data: labels.map(label => landCoverData[label]['Single cropping cropland']),
                            borderColor: '#8b9dc3',
                            backgroundColor: 'rgba(139, 157, 195, 0.2)',  // Lighter and more transparent
                            yAxisID: 'y',
                        },
                        {
                            label: `Double Cropland - ${villageName}`,
                            type: 'line',  // Line chart for double cropland
                            data: labels.map(label => landCoverData[label]['Double cropping cropland']),
                            borderColor: '#222f5b',
                            backgroundColor: 'rgba(34, 47, 91, 0.2)',  // Lighter and more transparent
                            yAxisID: 'y',
                        },
                        {
                            label: `Rainfall - ${villageName}`,
                            type: 'bar',  // Bar chart for rainfall
                            data: rainfallData.rainfall_data.map(entry => entry[1]),
                            borderColor: '#00BFFF',
                            backgroundColor: 'rgba(0, 191, 255, 0.5)',  // Matching light blue, more vivid
                            yAxisID: 'y1',
                        },
                        {
                            label: `Single Cropland - ${controlVillage}`,
                            type: 'line',  // Line chart for control village single cropland
                            data: labels.map(label => controlLandCoverData[label]['Single cropping cropland']),
                            borderColor: '#FFA07A',  // Salmon color
                            backgroundColor: 'rgba(255, 160, 122, 0.2)',  // Lighter salmon, transparent
                            yAxisID: 'y',
                            borderDash: [10, 5],  // Dotted line
                        },
                        {
                            label: `Double Cropland - ${controlVillage}`,
                            type: 'line',  // Line chart for control village double cropland
                            data: labels.map(label => controlLandCoverData[label]['Double cropping cropland']),
                            borderColor: '#20B2AA',  // Light Sea Green
                            backgroundColor: 'rgba(32, 178, 170, 0.2)',  // Matching color, more transparent
                            yAxisID: 'y',
                            borderDash: [10, 5],  // Dotted line
                        },
                        {
                            label: `Rainfall - ${controlVillage}`,
                            type: 'bar',  // Bar chart for control village rainfall
                            data: controlRainfallData.rainfall_data.map(entry => entry[1]),
                            borderColor: '#C71585',  // Medium Violet Red
                            backgroundColor: 'rgba(199, 21, 133, 0.5)',  // Matching color, more vivid
                            yAxisID: 'y1',
                            borderDash: [10, 5],  // Dotted line, though typically not noticeable on bars
                        }
                    ];                   
                    
                    setChartData({ labels, datasets });
                    onDataChange({ labels, datasets }); // Pass data to the parent component
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });

        }
    }, [controlVillage, stateName, districtName, subdistrictName, villageName, onDataChange]);

    return (
        <div className="w-full h-64">
            {chartData.datasets.length > 0 ? (
                <Line data={chartData} options={options} />
            ) : (
                <p className="text-center">No data available to display the chart.</p>
            )}
        </div>
    );
};

InterventionCompareChart.propTypes = {
    stateName: PropTypes.string.isRequired,
    districtName: PropTypes.object.isRequired,
    subdistrictName: PropTypes.string.isRequired,
    villageName: PropTypes.string.isRequired,
    onDataChange: PropTypes.func.isRequired,
};

export default InterventionCompareChart;
