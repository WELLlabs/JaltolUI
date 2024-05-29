import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { get_area_change, get_control_village, get_rainfall_data } from '../services/api'; // Assuming get_control_village is the function to fetch control village data

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const InterventionCompareChart = ({ stateName, districtName, subdistrictName, villageName }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });
    const [controllVillage, setControllVillage] = useState(null);

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

            get_control_village(stateName, districtValue, subdistrictName, villageName)
                .then(response => {
                    const controlVillageName = response.properties?.village_na;
                    console.log('Control Village:', controlVillageName);
                    setControllVillage(controlVillageName);  // Update state, triggers re-render
                })
                .catch(error => {
                    console.error('Error fetching control village data:', error);
                });
        }
    }, [stateName, districtName, subdistrictName, villageName]);  // Dependency array for the first effect

    useEffect(() => {
        // This effect runs only when controllVillage is set
        if (controllVillage && stateName && districtName && subdistrictName && villageName) {
            const districtValue = districtName.value;
            console.log('Making API call with:', stateName, districtName, subdistrictName, villageName);
            const fetchLandCover = get_area_change(stateName, districtValue, subdistrictName, villageName);
            const fetchRainfall = get_rainfall_data(stateName, districtValue, subdistrictName, villageName);

            const fetchControlLandCover = get_area_change(stateName, districtValue, subdistrictName, controllVillage);
            const fetchControlRainfall = get_rainfall_data(stateName, districtValue, subdistrictName, controllVillage);

            Promise.all([fetchLandCover, fetchRainfall, fetchControlLandCover, fetchControlRainfall])
                .then(([landCoverData, rainfallData, controlLandCoverData, controlRainfallData]) => {
                    const labels = Object.keys(landCoverData);
                    const datasets = [{
                        label: `Single Cropland - ${villageName}`,
                        data: labels.map(label => landCoverData[label]['Single cropping cropland']),
                        borderColor: '#FF5733', // New color
                        backgroundColor: 'rgba(255, 87, 51, 0.5)', // New color
                        yAxisID: 'y',
                    }, {
                        label: `Double Cropland - ${villageName}`,
                        data: labels.map(label => landCoverData[label]['Double cropping cropland']),
                        borderColor: '#C70039', // New color
                        backgroundColor: 'rgba(199, 0, 57, 0.5)', // New color
                        yAxisID: 'y',
                    }, {
                        label: `Rainfall - ${villageName}`,
                        data: rainfallData.rainfall_data.map(entry => entry[1]),
                        borderColor: '#900C3F', // New color
                        backgroundColor: 'rgba(144, 12, 63, 0.5)', // New color
                        yAxisID: 'y1',
                    },
                    {
                        label: `Single Cropland - ${controllVillage}`,
                        data: labels.map(label => controlLandCoverData[label]['Single cropping cropland']),
                        borderColor: '#FFC300', // New color
                        backgroundColor: 'rgba(255, 195, 0, 0.5)', // New color
                        yAxisID: 'y',
                    }, {
                        label: `Double Cropland - ${controllVillage}`,
                        data: labels.map(label => controlLandCoverData[label]['Double cropping cropland']),
                        borderColor: '#DAF7A6', // New color
                        backgroundColor: 'rgba(218, 247, 166, 0.5)', // New color
                        yAxisID: 'y',
                    }, {
                        label: `Rainfall - ${controllVillage}`,
                        data: controlRainfallData.rainfall_data.map(entry => entry[1]),
                        borderColor: '#581845', // New color
                        backgroundColor: 'rgba(88, 24, 69, 0.5)', // New color
                        yAxisID: 'y1',
                    }
                    ];
                    setChartData({ labels, datasets });
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });

        }
    }, [controllVillage, stateName, districtName, subdistrictName, villageName]);


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
    districtName: PropTypes.string.isRequired,
    subdistrictName: PropTypes.string.isRequired,
    villageName: PropTypes.string.isRequired,
};

export default InterventionCompareChart;
