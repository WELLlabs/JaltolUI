import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
    selectedStateAtom, selectedDistrictAtom,
    selectedSubdistrictAtom, selectedVillageAtom,
    groundwaterDataAtom
} from '../recoil/selectAtoms';
import { get_groundwater_data } from '../services/api';
import Spinner from './Spinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GroundwaterLevelChart = ({ onDataChange, onDataLoaded }) => {
    const stateName = useRecoilValue(selectedStateAtom);
    const districtName = useRecoilValue(selectedDistrictAtom);
    const subdistrictName = useRecoilValue(selectedSubdistrictAtom);
    const villageName = useRecoilValue(selectedVillageAtom);
    const setGroundwaterData = useSetRecoilState(groundwaterDataAtom);
    const groundwaterData = useRecoilValue(groundwaterDataAtom);
    const [isLoading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'data'
    
    // Track the last loaded village to prevent redundant API calls
    const lastLoadedVillage = useRef(null);

    // Format data for chart display
    const formatChartData = (data) => {
        const years = Object.keys(data).sort();
        const minValues = [];
        const maxValues = [];
        const ranges = [];

        years.forEach(year => {
            const yearData = data[year];
            if (yearData.min !== null && yearData.max !== null) {
                minValues.push(yearData.min);
                maxValues.push(yearData.max);
                ranges.push(yearData.max - yearData.min);
            } else {
                minValues.push(null);
                maxValues.push(null);
                ranges.push(null);
            }
        });

        // Format years for x-axis (academic year format)
        const formattedYears = years.map(year => {
            const nextYear = parseInt(year) + 1;
            return `${year}-${nextYear.toString().slice(2)}`;
        });

        return {
            years: formattedYears,
            minValues,
            maxValues,
            ranges
        };
    };

    // Configure chart options with inverted y-axis
    const options = {
        indexAxis: 'x',
        scales: {
            y: {
                beginAtZero: true,
                reverse: true, // Invert the y-axis to show depth going down
                position: 'left',
                ticks: {
                    color: 'black',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                title: {
                    display: true,
                    text: 'Depth below ground (m)',
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
                    pointStyle: 'rect',
                    padding: 20
                }
            },
            title: {
                display: true,
                text: 'Groundwater Level Depth (m)',
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
                        
                        let value = (Math.round(context.raw * 100) / 100).toFixed(2);
                        
                        // Append units
                        if (context.dataset.label === 'Min Value') {
                            label += `${value} m (min depth)`;
                        } else if (context.dataset.label === 'Range (Max - Min)') {
                            label += `${value} m (variation range)`;
                        }
                        
                        return label;
                    },
                    footer: function(tooltipItems) {
                        const item = tooltipItems[0];
                        if (item.datasetIndex === 1) { // For the Range dataset
                            const rawMinValue = groundwaterData.minValues[item.dataIndex];
                            const range = (Math.round(item.raw * 100) / 100).toFixed(2);
                            const maxValue = (Math.round((rawMinValue + parseFloat(range)) * 100) / 100).toFixed(2);
                            return [`Max depth: ${maxValue} m`];
                        }
                        return null;
                    }
                },
                footerColor: 'black',
                footerFont: {
                    size: 12,
                    style: 'normal',
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            bar: {
                borderWidth: 0 // Remove borders from bars
            }
        },
        backgroundColor: 'white',
    };

    // Fetch groundwater data from API
    useEffect(() => {
        // Only fetch data if we have all required information and haven't loaded this village yet
        if (stateName && districtName && subdistrictName && villageName &&
            (lastLoadedVillage.current !== villageName.label)) {
                
            setLoading(true);
            
            const village = villageName.label;
            const villageId = villageName.villageId;
            
            // Update the last loaded village
            lastLoadedVillage.current = village;
            
            get_groundwater_data(
                stateName, 
                districtName.value, 
                subdistrictName.label, 
                village, 
                villageId
            )
            .then(data => {
                const formattedData = formatChartData(data.groundwater_levels);
                
                setGroundwaterData(formattedData);
                if (onDataChange) {
                    onDataChange(formattedData);
                }
                setLoading(false);
                if (onDataLoaded) {
                    onDataLoaded(true);
                }
            })
            .catch(error => {
                console.error('Error fetching groundwater data:', error);
                setLoading(false);
                if (onDataLoaded) {
                    onDataLoaded(false);
                }
            });
        } else if (groundwaterData.years.length > 0 && onDataLoaded) {
            // If we already have data and just switched tabs, notify that data is loaded
            setLoading(false);
            onDataLoaded(true);
        }
    // Only re-run if village or state info changes, not on every render or callback change
    }, [stateName, districtName, subdistrictName, villageName?.label]);

    // Prepare chart data in the proper format for Chart.js
    const chartJsData = {
        labels: groundwaterData.years,
        datasets: [
            {
                label: 'Min Value',
                data: groundwaterData.minValues,
                backgroundColor: 'rgba(211, 211, 211, 0.8)', // Light gray for min values
                stack: 'Stack 0',
            },
            {
                label: 'Range (Max - Min)',
                data: groundwaterData.ranges,
                backgroundColor: 'rgba(54, 162, 235, 0.8)', // Blue for the range
                stack: 'Stack 0',
            }
        ]
    };

    // Toggle between chart and data views
    const toggleView = () => {
        setViewMode(viewMode === 'chart' ? 'data' : 'chart');
    };

    // Render the data table for the "Data" view
    const renderDataTable = () => {
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Depth (m)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Depth (m)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range (m)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {groundwaterData.years.map((year, idx) => (
                            <tr key={year}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{year}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {groundwaterData.minValues[idx] !== null 
                                        ? groundwaterData.minValues[idx].toFixed(2) 
                                        : 'No data'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {groundwaterData.maxValues[idx] !== null 
                                        ? groundwaterData.maxValues[idx].toFixed(2) 
                                        : 'No data'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {groundwaterData.ranges[idx] !== null 
                                        ? groundwaterData.ranges[idx].toFixed(2) 
                                        : 'No data'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Render main component
    return (
        <div className="w-full h-80 bg-white flex flex-col justify-start items-center relative overflow-hidden">
            {isLoading ? (
                <div className="absolute inset-0 flex justify-center items-center">
                    <Spinner />
                </div>
            ) : groundwaterData.years.length > 0 ? (
                <>
                    <div className="flex justify-end w-full mb-1">
                        <button 
                            onClick={toggleView}
                            className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                        >
                            View as {viewMode === 'chart' ? 'Data' : 'Chart'}
                        </button>
                    </div>
                    <div className="w-full h-[calc(100%-30px)]">
                        {viewMode === 'chart' ? (
                            <Bar 
                                data={chartJsData} 
                                options={options} 
                                className="w-full h-full"
                            />
                        ) : (
                            renderDataTable()
                        )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 w-full text-center">
                        <p>Values show groundwater depth below surface (zero at top). Lower values indicate higher water levels.</p>
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">
                        {(stateName && districtName && subdistrictName && villageName) 
                            ? "No groundwater data available for this location" 
                            : "Select all fields to see groundwater data"}
                    </p>
                </div>
            )}
        </div>
    );
};

GroundwaterLevelChart.propTypes = {
    onDataChange: PropTypes.func,
    onDataLoaded: PropTypes.func
};

GroundwaterLevelChart.defaultProps = {
    onDataChange: () => {},
    onDataLoaded: () => {}
};

export default GroundwaterLevelChart; 