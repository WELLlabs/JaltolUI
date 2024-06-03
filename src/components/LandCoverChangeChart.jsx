// src/components/LandCoverChangeChart.jsx
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { get_area_change, get_rainfall_data } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LandCoverChangeChart = ({ stateName, districtName, subdistrictName, villageName, onDataChange }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    const options = {
        scales: {
            y: { // Left y-axis for cropland data
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
            y1: { // Right y-axis for rainfall data
                beginAtZero: true,
                position: 'right',
                ticks: {
                    color: 'blue',
                },
                grid: {
                    drawOnChartArea: false, // Only draw grid for this axis on the right
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
        if (stateName && districtName) {
            console.log('Making API call with:', stateName, districtName, subdistrictName, villageName);
            const fetchLandCover = get_area_change(stateName, districtName.value, subdistrictName, villageName);
            const fetchRainfall = get_rainfall_data(stateName, districtName.value, subdistrictName, villageName);

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
                    }, {
                        label: 'Rainfall',
                        type: 'bar',
                        data: rainfallData.rainfall_data.map(entry => entry[1]),
                        borderColor: 'blue',
                        backgroundColor: 'rgba(0, 0, 255, 0.5)',
                        yAxisID: 'y1',
                    }];
                    setChartData({ labels, datasets });
                    onDataChange({ labels, datasets }); // Pass data to the parent component
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [stateName, districtName, subdistrictName, villageName, onDataChange]);

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

LandCoverChangeChart.propTypes = {
    stateName: PropTypes.string.isRequired,
    districtName: PropTypes.object.isRequired,
    subdistrictName: PropTypes.string.isRequired,
    villageName: PropTypes.string.isRequired,
    onDataChange: PropTypes.func.isRequired,
};

export default LandCoverChangeChart;
