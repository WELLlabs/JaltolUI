import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { get_area_change, get_control_village, get_rainfall_data } from '../services/api';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
    selectedStateAtom, selectedDistrictAtom,
    selectedSubdistrictAtom, selectedVillageAtom,
    interventionChartDataAtom
} from '../recoil/selectAtoms';
import Spinner from './Spinner'; // Import Spinner

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const InterventionCompareChart = ({ onDataChange }) => {
    const stateName = useRecoilValue(selectedStateAtom);
    const districtName = useRecoilValue(selectedDistrictAtom);
    const subdistrictName = useRecoilValue(selectedSubdistrictAtom);
    const villageName = useRecoilValue(selectedVillageAtom);
    const [isLoading, setLoading] = useState(false);
    const chartData = useRecoilValue(interventionChartDataAtom);
    const setChartData = useSetRecoilState(interventionChartDataAtom);
    const [controlVillage, setControlVillage] = useState(null);
    const [controlSubdistrict, setSubdistrictName] = useState(null);
    const [datasetVisibility, setDatasetVisibility] = useState({});
    const chartRef = useRef(null);

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
        setLoading(true);
        if (stateName && districtName && subdistrictName && villageName) {
            console.log('Fetching control village data');
            const districtValue = districtName.value;

            get_control_village(stateName, districtValue, subdistrictName.label, villageName)
                .then(response => {
                    const controlVillageName = response.properties?.village_na;
                    const controlSubdistrict = response.properties?.subdistric;
                    console.log('Control Village:', controlVillageName);
                    setSubdistrictName(controlSubdistrict);
                    setControlVillage(controlVillageName);  // Update state, triggers re-render
                })
                .catch(error => {
                    console.error('Error fetching control village data:', error);
                });
        }
    }, [stateName, districtName, subdistrictName, villageName]);  // Dependency array for the first effect

    useEffect(() => {
        // This effect runs only when controlVillage is set
        if (controlVillage && controlSubdistrict && stateName && districtName && subdistrictName && villageName) {
            const districtValue = districtName.value;
            const subdistrictValue = subdistrictName.label;
            console.log('Making API call with:', stateName, districtName, subdistrictName, villageName);
            const fetchLandCover = get_area_change(stateName, districtValue, subdistrictValue, villageName);
            const fetchRainfall = get_rainfall_data(stateName, districtValue, subdistrictValue, villageName);

            const fetchControlLandCover = get_area_change(stateName, districtValue, controlSubdistrict, controlVillage);
            const fetchControlRainfall = get_rainfall_data(stateName, districtValue, controlSubdistrict, controlVillage);

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
                    setDatasetVisibility(datasets.reduce((acc, dataset, index) => {
                        acc[index] = true;
                        return acc;
                    }, {}));
                    onDataChange({ labels, datasets });
                    setLoading(false); // Pass data to the parent component
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setLoading(false);
                });

        }
    }, [controlVillage, stateName, districtName, subdistrictName, villageName, onDataChange, setChartData]);

    const toggleDatasetVisibility = (index) => {
        setDatasetVisibility(prev => {
            const newVisibility = { ...prev, [index]: !prev[index] };
            const newDatasets = chartData.datasets.map((dataset, i) => ({
                ...dataset,
                hidden: !newVisibility[i],
            }));
            setChartData({ ...chartData, datasets: newDatasets });
            return newVisibility;
        });
    };

    const renderLegend = () => {
        return (
            <ul className="flex flex-wrap justify-center mb-2">
                {chartData.datasets.map((dataset, index) => (
                    <li key={index} className="flex items-center mr-4 mb-2 cursor-pointer" onClick={() => toggleDatasetVisibility(index)}>
                        <span
                            style={{
                                display: 'inline-block',
                                width: '20px',
                                height: '10px',
                                borderTop: `3px ${dataset.borderDash ? 'dashed' : 'solid'} ${dataset.borderColor}`,
                                marginRight: '8px',
                                opacity: datasetVisibility[index] ? 1 : 0.5,
                            }}
                        ></span>
                        <span style={{ color: 'black', opacity: datasetVisibility[index] ? 1 : 0.5 }}>
                            {dataset.label}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="w-full bg-white flex flex-col items-center relative z-9999">
            <h2 className="text-center text-black text-2xl mt-4">Land Cover Change Over Time</h2>
            {isLoading ? (
                <div className="absolute inset-0 flex justify-center items-center">
                    <Spinner />
                </div>
            ) : chartData.datasets.length > 0 ? (
                <>
                    <div className="w-full mt-4">{renderLegend()}</div>
                    <div className="w-full h-64">
                        <Line ref={chartRef} data={chartData} options={options} />
                    </div>
                </>
            ) : (
                <p className="text-center">No data available to display the chart.</p>
            )}
        </div>
    );
};

InterventionCompareChart.propTypes = {
    onDataChange: PropTypes.func.isRequired,
};

export default InterventionCompareChart;
