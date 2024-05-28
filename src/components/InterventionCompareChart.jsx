import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { get_area_change, get_control_village } from '../services/api'; // Assuming get_control_village is the function to fetch control village data

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
    
            Promise.all([
                get_area_change(stateName, districtValue, subdistrictName, villageName),
                get_area_change(stateName, districtValue, subdistrictName, controllVillage)
            ])
            .then(([dataVillage, dataControlVillage]) => {
                const labels = Object.keys(dataVillage);
                const datasets = [{
                    label: `Single Cropland - ${villageName}`,
                    data: labels.map(label => dataVillage[label]['Single cropping cropland']),
                    borderColor: '#8b9dc3',
                    backgroundColor: 'rgba(139, 157, 195, 0.5)',
                }, {
                    label: `Double Cropland - ${villageName}`,
                    data: labels.map(label => dataVillage[label]['Double cropping cropland']),
                    borderColor: '#222f5b',
                    backgroundColor: 'rgba(34, 47, 91, 0.5)',
                }, {
                    label: `Single Cropland - ${controllVillage}`,
                    data: labels.map(label => dataControlVillage[label]['Single cropping cropland']),
                    borderColor: '#e9c46a',
                    backgroundColor: 'rgba(233, 196, 106, 0.5)',
                }, {
                    label: `Double Cropland - ${controllVillage}`,
                    data: labels.map(label => dataControlVillage[label]['Double cropping cropland']),
                    borderColor: '#f4a261',
                    backgroundColor: 'rgba(244, 162, 97, 0.5)',
                }];
                setChartData({ labels, datasets });
            })
            .catch(error => {
                console.error('Error fetching area change data:', error);
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
