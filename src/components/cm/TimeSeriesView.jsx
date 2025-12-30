import { useState, useMemo, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import PropTypes from 'prop-types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TimeSeriesView = ({ data, allData, idField, dateField, columnTypes, selectedValue }) => {
  const [selectedId, setSelectedId] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');

  // Get unique ID values from the data
  const uniqueIds = useMemo(() => {
    if (!data || !idField) return [];
    
    const ids = data
      .map(row => row[idField])
      .filter(id => id !== null && id !== undefined && id !== '')
      .map(id => String(id).trim());
    
    return [...new Set(ids)].sort();
  }, [data, idField]);

  // Get numeric columns (float/integer) for Y-axis options - derived from actual data rows
  const numericColumns = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Get all column names from the first row
    const allColumns = Object.keys(data[0]);
    
    // Filter to columns that have numeric values (check first 10 rows)
    const numericCols = allColumns.filter(colName => {
      // Skip ID and date fields
      if (colName === idField || colName === dateField) return false;
      
      // Check if at least some values in this column are numeric
      const sampleRows = data.slice(0, Math.min(10, data.length));
      const hasNumericValue = sampleRows.some(row => {
        const val = row[colName];
        if (val === null || val === undefined || val === '') return false;
        const parsed = parseFloat(val);
        return !isNaN(parsed);
      });
      
      return hasNumericValue;
    });
    
    console.log('Numeric columns derived from data:', numericCols);
    return numericCols;
  }, [data, idField, dateField]);

  // Set initial selections using useEffect (not useMemo)
  useEffect(() => {
    if (uniqueIds.length > 0 && !selectedId) {
      console.log('Setting initial ID to:', uniqueIds[0]);
      setSelectedId(uniqueIds[0]);
    }
  }, [uniqueIds, selectedId]);

  useEffect(() => {
    if (numericColumns.length > 0 && !selectedMetric) {
      console.log('Setting initial metric to:', numericColumns[0]);
      setSelectedMetric(numericColumns[0]);
    }
  }, [numericColumns, selectedMetric]);

  // Filter data for selected ID and prepare chart data
  const chartData = useMemo(() => {
    console.log('=== chartData Debug ===');
    console.log('selectedId:', selectedId);
    console.log('selectedMetric:', selectedMetric);
    console.log('dateField:', dateField);
    console.log('idField:', idField);
    console.log('data length:', data?.length);
    
    if (data && data.length > 0) {
      console.log('First row keys:', Object.keys(data[0]));
      console.log('First row:', data[0]);
      console.log('First row idField value:', data[0][idField]);
      console.log('Type of first row idField value:', typeof data[0][idField]);
    }
    
    if (!data || !selectedId || !selectedMetric || !dateField) {
      console.log('Missing required data, returning empty');
      return { labels: [], datasets: [] };
    }

    // Debug: Count how many rows match the selectedId EXACTLY
    const exactMatchCount = data.filter(row => String(row[idField] || '').trim() === selectedId).length;
    console.log(`Rows matching "${selectedId}" exactly: ${exactMatchCount}`);
    
    // Debug: Show all unique values found in the idField to compare
    const allIdValues = [...new Set(data.map(row => String(row[idField] || '').trim()))];
    console.log('All unique ID values in data:', allIdValues);
    
    // Check if selectedId exists in allIdValues (case-sensitive)
    const existsInData = allIdValues.includes(selectedId);
    console.log(`"${selectedId}" exists in data:`, existsInData);

    // Filter rows for selected ID
    const matchingRows = data.filter(row => {
      const rowId = String(row[idField] || '').trim();
      return rowId === selectedId;
    });
    
    console.log(`Found ${matchingRows.length} rows matching "${selectedId}"`);
    if (matchingRows.length > 0) {
      // Show what values the first matching row has for date and metric
      const sampleRow = matchingRows[0];
      console.log('Sample matching row dateField value:', sampleRow[dateField], 'type:', typeof sampleRow[dateField]);
      console.log('Sample matching row metricField value:', sampleRow[selectedMetric], 'type:', typeof sampleRow[selectedMetric]);
    }

    const filteredData = matchingRows
      .map(row => {
        const dateValue = row[dateField];
        const metricRaw = row[selectedMetric];
        const metricValue = parseFloat(metricRaw);
        return {
          date: dateValue,
          value: metricValue,
          rawMetric: metricRaw
        };
      })
      .filter(item => {
        const hasDate = item.date && String(item.date).trim() !== '';
        const hasValue = !isNaN(item.value);
        if (!hasDate || !hasValue) {
          console.log('Filtered out item - date:', item.date, 'hasDate:', hasDate, 'rawMetric:', item.rawMetric, 'value:', item.value, 'hasValue:', hasValue);
        }
        return hasDate && hasValue;
      })
      .sort((a, b) => {
        // Try to parse dates for sorting
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateA - dateB;
        }
        return String(a.date).localeCompare(String(b.date));
      });

    console.log('chartData - filteredData length:', filteredData.length);
    if (filteredData.length > 0) {
      console.log('chartData - sample data point:', filteredData[0]);
    }

    const labels = filteredData.map(item => String(item.date));
    const values = filteredData.map(item => item.value);

    return {
      labels,
      datasets: [
        {
          label: `${selectedMetric} for ${selectedId}`,
          data: values,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    };
  }, [data, selectedId, selectedMetric, dateField, idField]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: `Time Series: ${selectedMetric || 'Select a metric'}`,
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${selectedMetric}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          maxTicksLimit: 10,
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        title: {
          display: true,
          text: selectedMetric || 'Value',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        beginAtZero: false
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const dataPointCount = chartData.labels.length;

  return (
    <div className="p-6 bg-gray-50 min-h-[600px]">
      {/* Header with selected value info */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900">Time Series Analysis</h2>
          <p className="text-sm text-blue-700 mt-1">
            <span className="font-medium">Viewing:</span> {selectedValue}
          </p>
        </div>
      </div>

      {/* Dropdowns */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* ID Selection Dropdown */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {idField || 'ID'}
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Choose an ID...</option>
            {uniqueIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">{uniqueIds.length} unique values</p>
        </div>

        {/* Metric Selection Dropdown */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Metric (Y-Axis)
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Choose a metric...</option>
            {numericColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">{numericColumns.length} numeric columns available</p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {dataPointCount > 0 ? (
          <>
            <div className="h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {dataPointCount} data points for {selectedId}
            </div>
          </>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium">No data to display</p>
              <p className="mt-1">Select an ID and metric to view the time series chart</p>
            </div>
          </div>
        )}
      </div>

      {/* Data Summary */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Data Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Records:</span>
            <span className="ml-2 font-medium">{data?.length || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">Unique IDs:</span>
            <span className="ml-2 font-medium">{uniqueIds.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Selected ID:</span>
            <span className="ml-2 font-medium">{selectedId || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">Data Points:</span>
            <span className="ml-2 font-medium">{dataPointCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

TimeSeriesView.propTypes = {
  data: PropTypes.array.isRequired,
  allData: PropTypes.object,
  idField: PropTypes.string.isRequired,
  dateField: PropTypes.string.isRequired,
  columnTypes: PropTypes.object.isRequired,
  selectedValue: PropTypes.string
};

export default TimeSeriesView;
