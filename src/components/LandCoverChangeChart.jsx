// src/components/LandCoverChangeChart.jsx
import { useEffect, useState } from 'react';
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
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LandCoverChangeChart = ({ onDataChange }) => {
    const stateName = useRecoilValue(selectedStateAtom);
    const districtName = useRecoilValue(selectedDistrictAtom);
    const subdistrictName = useRecoilValue(selectedSubdistrictAtom);
    const villageName = useRecoilValue(selectedVillageAtom);
    const setChartData = useSetRecoilState(landCoverChartDataAtom);
    const [isLoading, setLoading] = useState(false);
    const chartData = useRecoilValue(landCoverChartDataAtom);


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
        setLoading(true);  // Set loading to true when API call starts
        if (stateName && districtName && subdistrictName && villageName) {
            const fetchLandCover = get_area_change(stateName, districtName.value, subdistrictName.value, villageName);
            const fetchRainfall = get_rainfall_data(stateName, districtName.value, subdistrictName.value, villageName);

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
                    onDataChange({ labels, datasets });
                    setLoading(false);  // Set loading to false once data is fetched
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setLoading(false);  // Ensure loading is set to false on error
                });
        }
    }, [stateName, districtName, subdistrictName, villageName, onDataChange, setChartData]);

    return (
        <div className="w-full h-64 bg-white ">
            {isLoading ? (
                <div className="flex justify-center items-center" style={{ width: 100, height: 100 }}>
                    <CircularProgressbar value={100} text={`Loading...`} />
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
    onDataChange: PropTypes.func.isRequired,
};

export default LandCoverChangeChart;
