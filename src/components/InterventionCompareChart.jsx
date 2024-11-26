import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { get_area_change, get_control_village, get_rainfall_data } from '../services/api';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import {
    selectedStateAtom, selectedDistrictAtom,
    selectedSubdistrictAtom, selectedVillageAtom,
    interventionChartDataAtom, selectedControlSubdistrictAtom, 
    selectedControlVillageAtom
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
    const [controlSubdistrict, setControlSubdistrict] = useRecoilState(selectedControlSubdistrictAtom);
    const [controlVillage, setControlVillage] = useRecoilState(selectedControlVillageAtom);
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
                borderWidth: 1,
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
            const villageValue = villageName.label;

            get_control_village(stateName, districtValue, subdistrictName.label, villageValue)
                .then(response => {
                    const controlVillageName = response.properties?.village_na;
                    const controlSubdistrict = response.properties?.subdistric;
                    console.log('Control Village:', controlVillageName);
                    setControlSubdistrict({ label: controlSubdistrict, value: controlSubdistrict });
                    setControlVillage({ label: controlVillageName, value: controlVillageName });
  // Update state, triggers re-render
                })
                .catch(error => {
                    console.error('Error fetching control village data:', error);
                });
        }
    }, [stateName, districtName, subdistrictName, villageName]);  // Dependency array for the first effect

    useEffect(() => {
        // This effect runs only when controlVillage is set
        if (controlVillage?.value && controlSubdistrict && stateName && districtName && subdistrictName && villageName) {
            setLoading(true)
            const districtValue = districtName.value;
            const subdistrictValue = subdistrictName.label;
            const villageValue = villageName.label;
            const controlSubdistrictName = controlSubdistrict.label;
            const controlVillageName = controlVillage.label;
            console.log('Making API call with:', stateName, districtName, subdistrictName, villageValue);
            const fetchLandCover = get_area_change(stateName, districtValue, subdistrictValue, villageValue);
            const fetchRainfall = get_rainfall_data(stateName, districtValue, subdistrictValue, villageValue);

            const fetchControlLandCover = get_area_change(stateName, districtValue, controlSubdistrictName, controlVillageName);
            const fetchControlRainfall = get_rainfall_data(stateName, districtValue, controlSubdistrictName, controlVillageName);

            Promise.all([fetchLandCover, fetchRainfall, fetchControlLandCover, fetchControlRainfall])
                .then(([landCoverData, rainfallData, controlLandCoverData, controlRainfallData]) => {
                    const labels = Object.keys(landCoverData);
                    const datasets = [
                        {
                            label: `Single Cropland - ${villageValue}`,
                            type: 'line',  // Line chart for single cropland
                            data: labels.map(label => landCoverData[label]['Single cropping cropland']),
                            borderColor: '#8b9dc3',
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
                            label: `Rainfall - ${villageValue}`,
                            type: 'bar',  // Bar chart for rainfall
                            data: rainfallData.rainfall_data.map(entry => entry[1]),
                            borderColor: '#00BFFF',
                            backgroundColor: 'rgba(0, 191, 255, 0.5)',  // Matching light blue, more vivid
                            yAxisID: 'y1',
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
                        },
                        {
                            label: `Rainfall - ${controlVillageName}`,
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
                    <li
                        key={index}
                        className="flex items-center mr-4 mb-2 cursor-pointer"
                        onClick={() => toggleDatasetVisibility(index)}
                        style={{
                            textDecoration: datasetVisibility[index] ? 'none' : 'line-through',
                            opacity: datasetVisibility[index] ? 1 : 0.5,
                            color: 'black', // Ensure the color of the text is always black
                        }}
                    >
                        <span
                            style={{
                                display: 'inline-block',
                                width: '20px',
                                height: '10px',
                                borderTop: `3px solid ${dataset.borderColor}`,
                                marginRight: '8px',
                            }}
                        ></span>
                        {dataset.label}
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
