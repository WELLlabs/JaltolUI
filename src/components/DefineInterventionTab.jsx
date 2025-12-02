import React, { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import axios from 'axios';
import { createCMProject, uploadDataset, analyzeDataset, getDatasets, getDataset, deleteDataset } from '../services/continuousMonitoringApi';
import { getAuthHeaders } from '../services/api';

// Chart type flow configuration - defines which objectives are included and any special conditions
const CHART_TYPE_CONFIG = {
  'snapshot': {
    objectives: [0, 1, 2, 3, 4, 5], // All objectives: chart type, upload, intervention, ID, date, lat/lng
    idFieldUsesFilteredRows: true, // ID field selection uses filtered rows (after intervention value selection)
    idFieldRequiresUniqueness: true, // ID field must have unique, non-null values
  },
  'time-series': {
    objectives: [0, 1, 2, 3, 4], // Objectives: chart type, upload, intervention, ID, date (no lat/lng)
    idFieldUsesFilteredRows: true, // ID field selection uses filtered rows (after intervention value selection)
    idFieldRequiresUniqueness: false, // ID field does not require uniqueness/non-null check
  },
};

// Helper function to get chart type configuration
const getChartConfig = (chartType) => {
  return CHART_TYPE_CONFIG[chartType] || CHART_TYPE_CONFIG['snapshot']; // Default to snapshot
};

// Helper function to check if an objective should be shown for the current chart type
const shouldShowObjective = (objectiveNumber, chartType) => {
  const config = getChartConfig(chartType);
  return config.objectives.includes(objectiveNumber);
};

const DefineInterventionTab = () => {
  const [projectId, setProjectId] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [columns, setColumns] = useState(null);
  const [selectedInterventionField, setSelectedInterventionField] = useState(null);
  const [uniqueValues, setUniqueValues] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [filteredColumns, setFilteredColumns] = useState([]);
  const [validIdColumns, setValidIdColumns] = useState([]);
  const [selectedIdFields, setSelectedIdFields] = useState([]);
  const [selectedDateField, setSelectedDateField] = useState(null);
  const [selectedLatitudeField, setSelectedLatitudeField] = useState(null);
  const [selectedLongitudeField, setSelectedLongitudeField] = useState(null);
  const [selectedChartType, setSelectedChartType] = useState(null);
  const [filteredRows, setFilteredRows] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
  const [csvData, setCsvData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedObjective, setConfirmedObjective] = useState(0); // Track which objective has been confirmed via Proceed button
  const [editingObjective, setEditingObjective] = useState(null); // Track which objective is being edited (null if none)
  const [datasets, setDatasets] = useState([]); // Previously uploaded datasets
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null); // Selected dataset from previous uploads
  const fileInputRef = useRef(null);

  // Function to fetch previously uploaded datasets
  const fetchDatasets = async () => {
    try {
      setLoadingDatasets(true);
      const response = await getDatasets();
      console.log('Fetched datasets response:', response);
      
      // Handle both direct array and paginated response (with 'results' field)
      let allDatasets = [];
      if (Array.isArray(response)) {
        allDatasets = response;
      } else if (response && Array.isArray(response.results)) {
        allDatasets = response.results;
      } else if (response && response.data && Array.isArray(response.data)) {
        allDatasets = response.data;
      }
      
      console.log('Setting datasets:', allDatasets);
      setDatasets(allDatasets);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setDatasets([]);
    } finally {
      setLoadingDatasets(false);
    }
  };

  // Fetch previously uploaded datasets on mount
  useEffect(() => {
    fetchDatasets();
  }, []);

  // Handler to delete a dataset
  const handleDeleteDataset = async (datasetId, event) => {
    event.stopPropagation(); // Prevent selecting the dataset when clicking delete
    
    if (!window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDataset(datasetId);
      
      // If this was the selected dataset, clear the selection
      if (selectedDatasetId === datasetId) {
        setSelectedDatasetId(null);
        setColumns(null);
        setCsvData(null);
        setConfirmedObjective(0);
      }
      
      // Refresh the datasets list
      await fetchDatasets();
    } catch (error) {
      console.error('Error deleting dataset:', error);
      setError(`Failed to delete dataset: ${error.message}`);
    }
  };

  // Handler to select a previously uploaded dataset
  const handleDatasetSelection = async (datasetId) => {
    try {
      setIsUploading(true);
      setError(null);
      setSelectedDatasetId(datasetId);
      
      // Reset all previous selections
      setColumns(null);
      setSelectedInterventionField(null);
      setUniqueValues([]);
      setSelectedValue(null);
      setFilteredColumns([]);
      setValidIdColumns([]);
      setSelectedIdFields([]);
      setSelectedDateField(null);
      setSelectedLatitudeField(null);
      setSelectedLongitudeField(null);
      setFilteredRows([]);
      setColumnTypes({});
      setCsvData(null);
      // Keep confirmedObjective at 1 (CSV upload section) so it remains visible
      // We're selecting a dataset, so we've already passed Objective 0 (chart type)
      setConfirmedObjective(1);
      setEditingObjective(null);

      // Get dataset info
      const datasetInfo = await getDataset(datasetId);
      
      // Create or get project (reuse existing project if dataset already has one)
      let currentProjectId = datasetInfo.project;
      if (!currentProjectId) {
        // Create a new project for this dataset
        const projectData = {
          name: `Project for ${datasetInfo.original_filename}`,
          description: `Project created from ${datasetInfo.original_filename}`
        };
        const project = await createCMProject(projectData);
        currentProjectId = project.id;
      }
      setProjectId(currentProjectId);
      setDatasetId(datasetId);

      // Fetch the CSV file
      const API_URL = import.meta.env.VITE_API_URL;
      const fileUrl = datasetInfo.file;
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_URL}${fileUrl}`;
      
      const response = await axios.get(fullUrl, {
        headers: getAuthHeaders(),
        responseType: 'text'
      });
      
      const csvText = response.data;
      
      // Parse CSV
      const parsed = parseCSV(csvText);
      setCsvData(parsed);
      
      // Infer column types
      const types = {};
      parsed.headers.forEach(header => {
        const values = parsed.rows.map(row => row[header]);
        types[header] = inferColumnType(values);
      });
      setColumnTypes(types);
      
      // Get column analysis from backend
      const analysisResult = await analyzeDataset(datasetId);
      if (analysisResult && analysisResult.columns) {
        setColumns(analysisResult.columns);
      }
    } catch (error) {
      console.error('Error loading dataset:', error);
      setError(`Failed to load dataset: ${error.message}`);
      setSelectedDatasetId(null);
    } finally {
      setIsUploading(false);
    }
  };

  const inferColumnType = (values) => {
    // Filter out empty/null values
    const nonEmptyValues = values.filter(val => {
      const str = val?.toString().trim();
      return str !== null && str !== undefined && str !== '';
    });
    
    if (nonEmptyValues.length === 0) {
      return 'string'; // Default to string if all empty
    }
    
    // Sample up to 100 values for type inference
    const sampleSize = Math.min(100, nonEmptyValues.length);
    const sample = nonEmptyValues.slice(0, sampleSize);
    
    // For numeric types, require ALL values to match (strict check)
    let allIntegers = true;
    let allFloats = true;
    let allBooleans = true;
    let allDates = true;
    
    sample.forEach(val => {
      const str = val.toString().trim();
      
      // Check for integer - must be purely numeric (no letters, no decimals)
      if (!/^-?\d+$/.test(str)) {
        allIntegers = false;
      }
      
      // Check for float - must be numeric (integers are also valid floats)
      // Accepts: pure integers (123), floats with decimal (123.45), or floats ending in decimal (123.)
      if (!(/^-?\d+$/.test(str) || /^-?\d*\.\d+$/.test(str) || /^-?\d+\.\d*$/.test(str))) {
        allFloats = false;
      }
      
      // Check for boolean
      const isBool = str.toLowerCase() === 'true' || str.toLowerCase() === 'false' || 
                     str === '1' || str === '0' || str === 'yes' || str === 'no';
      if (!isBool) {
        allBooleans = false;
      }
      
      // Check for date (various formats)
      const isDate = /^\d{4}-\d{2}-\d{2}/.test(str) || // YYYY-MM-DD
                     /^\d{2}\/\d{2}\/\d{4}/.test(str) || // MM/DD/YYYY
                     /^\d{2}-\d{2}-\d{4}/.test(str) || // MM-DD-YYYY
                     /^\d{4}\/\d{2}\/\d{2}/.test(str) || // YYYY/MM/DD
                     (!isNaN(Date.parse(str)) && str.length > 5); // Any parseable date (but not just numbers)
      if (!isDate) {
        allDates = false;
      }
    });
    
    // Return type only if ALL values match that pattern
    if (allBooleans && sample.length > 0) return 'boolean';
    if (allIntegers && sample.length > 0) return 'integer';
    if (allFloats && sample.length > 0) return 'float';
    if (allDates && sample.length > 0) return 'date';
    
    // Default to string if any value doesn't match a strict pattern
    return 'string';
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      rows.push(row);
    }
    
    // Infer types for each column
    const types = {};
    headers.forEach(header => {
      const columnValues = rows.map(row => row[header]);
      types[header] = inferColumnType(columnValues);
    });
    
    return { headers, rows, types };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setColumns(null);
    setSelectedInterventionField(null);
    setUniqueValues([]);
    setSelectedValue(null);
    setFilteredColumns([]);
    setValidIdColumns([]);
    setSelectedIdFields([]);
    setSelectedDateField(null);
    setSelectedLatitudeField(null);
    setSelectedLongitudeField(null);
    setFilteredRows([]);
    setColumnTypes({});
    setCsvData(null);
    setConfirmedObjective(0);
    setEditingObjective(null);
    setSelectedDatasetId(null); // Reset selected dataset when uploading new file

    try {
      // Read and parse CSV file
      const text = await file.text();
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setColumnTypes(parsed.types || {});

      let currentProjectId = projectId;

      // 1. Create Project if not exists
      if (!currentProjectId) {
        const projectData = {
          name: `New Project - ${new Date().toLocaleDateString()}`,
          description: 'Created via Define Intervention'
        };
        const project = await createCMProject(projectData);
        currentProjectId = project.id;
        setProjectId(currentProjectId);
      }

      // 2. Upload Dataset
      const dataset = await uploadDataset(currentProjectId, file);
      setDatasetId(dataset.id);

      // 3. Trigger Analysis
      const analysis = await analyzeDataset(dataset.id);
      
      // 4. Set columns
      setColumns(analysis.columns || []);
      
    } catch (err) {
      console.error('Error in file upload flow:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message;
      setError(errorMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isValidIdColumn = (columnName, rows, types) => {
    // Check if column type is string (only string columns can be ID fields)
    const columnType = types?.[columnName] || columnTypes[columnName];
    if (columnType !== 'string') {
      return false;
    }
    
    const values = rows.map(row => {
      const val = row[columnName];
      return val !== null && val !== undefined ? val.toString().trim() : null;
    });
    
    // Check for NULL/empty values
    if (values.some(val => val === null || val === '')) {
      return false;
    }
    
    // Check for uniqueness
    const uniqueValues = new Set(values);
    return uniqueValues.size === values.length;
  };

  const handleFieldSelection = (fieldName) => {
    if (selectedInterventionField === fieldName) {
      setSelectedInterventionField(null);
      setUniqueValues([]);
      setSelectedValue(null);
      setFilteredColumns([]);
      setValidIdColumns([]);
      setSelectedIdFields([]);
      setFilteredRows([]);
      setColumnTypes({});
    } else {
      setSelectedInterventionField(fieldName);
      setSelectedValue(null);
      setFilteredColumns([]);
      setValidIdColumns([]);
      setSelectedIdFields([]);
      setFilteredRows([]);
      
      // Extract unique values from the selected column
      if (csvData && csvData.rows) {
        const columnName = columns?.find(col => (col.variable || col.original) === fieldName)?.original || fieldName;
        const values = csvData.rows
          .map(row => row[columnName])
          .filter(val => val && val.trim() !== '')
          .map(val => val.trim());
        const unique = [...new Set(values)].sort();
        setUniqueValues(unique);
      }
    }
  };

  const handleValueSelection = (value) => {
    if (selectedValue === value) {
      setSelectedValue(null);
      setFilteredColumns([]);
      setValidIdColumns([]);
      setSelectedIdFields([]);
      setSelectedDateField(null);
      setFilteredRows([]);
      // Keep columnTypes - they're based on full CSV, not filtered
    } else {
      setSelectedValue(value);
      setSelectedIdFields([]);
      setSelectedDateField(null);
      
      // Filter rows by selected value
      if (csvData && csvData.rows && selectedInterventionField) {
        const columnName = columns?.find(col => (col.variable || col.original) === selectedInterventionField)?.original || selectedInterventionField;
        const filtered = csvData.rows.filter(row => {
          const rowValue = (row[columnName] || '').trim();
          return rowValue === value;
        });
        setFilteredRows(filtered);
        
        // Get chart type configuration
        const config = getChartConfig(selectedChartType);
        const rowsToUse = config.idFieldUsesFilteredRows ? filtered : csvData.rows;
        
        // Find columns with at least one non-NULL value in the rows to use
        const columnsWithValues = [];
        const validColumns = [];
        
        csvData.headers.forEach(header => {
          const hasNonNullValue = rowsToUse.some(row => {
            const val = row[header];
            return val !== null && val !== undefined && val.toString().trim() !== '';
          });
          if (hasNonNullValue) {
            columnsWithValues.push(header);
            // Check if this column is a valid ID column
            // For time-series: only check if it's a string type (no uniqueness/non-null requirement)
            // For snapshot: check full validity (string type + uniqueness + non-null)
            if (config.idFieldRequiresUniqueness) {
              // Snapshot: full validation
              if (isValidIdColumn(header, rowsToUse, csvData.types)) {
                validColumns.push(header);
              }
            } else {
              // Time-series: only check if it's a string type
              const columnType = csvData.types?.[header] || columnTypes[header];
              if (columnType === 'string') {
                validColumns.push(header);
              }
            }
          }
        });
        
        setFilteredColumns(columnsWithValues);
        setValidIdColumns(validColumns);
      }
    }
  };

  const handleIdFieldSelection = (fieldName) => {
    // Only allow selection of valid ID columns or _ID_
    if (fieldName !== '_ID_' && !validIdColumns.includes(fieldName)) {
      return; // Don't allow selection of invalid columns
    }
    
    // Only allow one selection at a time - toggle if same field, otherwise replace
    if (selectedIdFields.includes(fieldName)) {
      // Deselect if clicking the same field
      setSelectedIdFields([]);
    } else {
      // Replace any existing selection with the new one
      setSelectedIdFields([fieldName]);
    }
  };

  const handleDateFieldSelection = (fieldName) => {
    // Toggle selection - if same field, deselect; otherwise replace
    if (selectedDateField === fieldName) {
      setSelectedDateField(null);
    } else {
      setSelectedDateField(fieldName);
    }
  };

  const handleLatitudeFieldSelection = (fieldName) => {
    // Toggle selection - if same field, deselect; otherwise replace
    if (selectedLatitudeField === fieldName) {
      setSelectedLatitudeField(null);
    } else {
      setSelectedLatitudeField(fieldName);
    }
  };

  const handleLongitudeFieldSelection = (fieldName) => {
    // Toggle selection - if same field, deselect; otherwise replace
    if (selectedLongitudeField === fieldName) {
      setSelectedLongitudeField(null);
    } else {
      setSelectedLongitudeField(fieldName);
    }
  };

  // Handlers to go back and edit previous objectives
  const handleEditObjective0 = () => {
    // Reset chart type selection and all subsequent objectives
    setSelectedChartType(null);
    setColumns(null);
    setSelectedInterventionField(null);
    setSelectedValue(null);
    setUniqueValues([]);
    setFilteredColumns([]);
    setValidIdColumns([]);
    setSelectedIdFields([]);
    setSelectedDateField(null);
    setSelectedLatitudeField(null);
    setSelectedLongitudeField(null);
    setFilteredRows([]);
    setColumnTypes({});
    setCsvData(null);
    setConfirmedObjective(0); // Reset to objective 0
    setEditingObjective(0); // Mark objective 0 as being edited
  };

  const handleEditObjective1 = () => {
    // Reset CSV upload and all subsequent objectives
    setColumns(null);
    setSelectedInterventionField(null);
    setSelectedValue(null);
    setUniqueValues([]);
    setFilteredColumns([]);
    setValidIdColumns([]);
    setSelectedIdFields([]);
    setSelectedDateField(null);
    setSelectedLatitudeField(null);
    setSelectedLongitudeField(null);
    setFilteredRows([]);
    setColumnTypes({});
    setCsvData(null);
    setConfirmedObjective(1); // Reset to objective 1
    setEditingObjective(1); // Mark objective 1 as being edited
  };

  const handleEditObjective2 = () => {
    // Reset intervention type selection and all subsequent objectives
    setSelectedInterventionField(null);
    setSelectedValue(null);
    setUniqueValues([]);
    setFilteredColumns([]);
    setValidIdColumns([]);
    setSelectedIdFields([]);
    setSelectedDateField(null);
    setSelectedLatitudeField(null);
    setSelectedLongitudeField(null);
    setFilteredRows([]);
    setConfirmedObjective(2); // Reset to objective 2
    setEditingObjective(2); // Mark objective 2 as being edited
  };

  const handleEditObjective3 = () => {
    // Reset ID field selection and subsequent objectives
    setSelectedIdFields([]);
    setSelectedDateField(null);
    setSelectedLatitudeField(null);
    setSelectedLongitudeField(null);
    setConfirmedObjective(3); // Reset to objective 3
    setEditingObjective(3); // Mark objective 3 as being edited
  };

  const handleEditObjective4 = () => {
    // Reset date field selection and subsequent objectives
    setSelectedDateField(null);
    setSelectedLatitudeField(null);
    setSelectedLongitudeField(null);
    setConfirmedObjective(4); // Reset to objective 4
    setEditingObjective(4); // Mark objective 4 as being edited
  };

  const handleEditObjective5 = () => {
    // Reset latitude and longitude field selections
    setSelectedLatitudeField(null);
    setSelectedLongitudeField(null);
    setConfirmedObjective(5); // Reset to objective 5
    setEditingObjective(5); // Mark objective 5 as being edited
  };

  // Handler for chart type selection
  const handleChartTypeSelection = (chartType) => {
    setSelectedChartType(chartType);
  };

  // Handlers for Proceed buttons
  const handleProceedObjective0 = () => {
    if (selectedChartType) {
      setConfirmedObjective(1); // Set to 1 so Objective 1 appears
      setEditingObjective(null); // Clear editing state
    }
  };

  const handleProceedObjective1 = () => {
    if (columns && columns.length > 0) {
      setConfirmedObjective(2); // Set to 2 so Objective 2 appears
      setEditingObjective(null); // Clear editing state
    }
  };

  const handleProceedObjective2 = () => {
    if (selectedInterventionField && selectedValue) {
      setConfirmedObjective(3); // Set to 3 so Objective 3 appears
      setEditingObjective(null); // Clear editing state
    }
  };

  const handleProceedObjective3 = () => {
    if (selectedIdFields.length === 1) {
      setConfirmedObjective(4); // Set to 4 so Objective 4 appears
      setEditingObjective(null); // Clear editing state
    }
  };

  const handleProceedObjective4 = () => {
    if (selectedDateField) {
      const config = getChartConfig(selectedChartType);
      if (config.objectives.includes(5)) {
        // Snapshot: proceed to Objective 5 (lat/lng)
        setConfirmedObjective(5);
      } else {
        // Time-series: finish after Objective 4
        setConfirmedObjective(6);
      }
      setEditingObjective(null); // Clear editing state
    }
  };

  const handleProceedObjective5 = () => {
    if (selectedLatitudeField && selectedLongitudeField) {
      setConfirmedObjective(6); // Set to 6 (no more objectives after this)
      setEditingObjective(null); // Clear editing state
    }
  };

  // Determine completion status for each objective
  const objective0Complete = selectedChartType !== null; // Chart type selection
  const objective1Complete = columns && columns.length > 0; // CSV upload
  const objective2Complete = selectedInterventionField && selectedValue; // Intervention type
  const objective3Complete = selectedIdFields.length === 1; // ID field
  const objective4Complete = selectedDateField !== null; // Date field
  const objective5Complete = selectedLatitudeField !== null && selectedLongitudeField !== null; // Lat/Lng fields

  // Find date columns from filtered rows
  const dateColumns = filteredRows.length > 0 && csvData && csvData.types
    ? csvData.headers.filter(header => {
        const columnType = csvData.types[header];
        // Check if it's a date type and has non-null values in filtered rows
        if (columnType === 'date') {
          return filteredRows.some(row => {
            const val = row[header];
            return val !== null && val !== undefined && val.toString().trim() !== '';
          });
        }
        return false;
      })
    : [];

  // Helper function to check if a value is a valid latitude (-90 to 90)
  const isValidLatitude = (val) => {
    if (val === null || val === undefined || val === '') return false;
    const num = parseFloat(val);
    return !isNaN(num) && num >= -90 && num <= 90;
  };

  // Helper function to check if a value is a valid longitude (-180 to 180)
  const isValidLongitude = (val) => {
    if (val === null || val === undefined || val === '') return false;
    const num = parseFloat(val);
    return !isNaN(num) && num >= -180 && num <= 180;
  };

  // Find latitude candidate columns from filtered rows
  const latitudeColumns = filteredRows.length > 0 && csvData && csvData.types
    ? csvData.headers.filter(header => {
        const columnType = csvData.types[header];
        // Check if it's numeric (integer or float) and has valid latitude values
        if (columnType === 'integer' || columnType === 'float') {
          const hasValidLat = filteredRows.some(row => {
            const val = row[header];
            return isValidLatitude(val);
          });
          return hasValidLat;
        }
        return false;
      })
    : [];

  // Find longitude candidate columns from filtered rows
  const longitudeColumns = filteredRows.length > 0 && csvData && csvData.types
    ? csvData.headers.filter(header => {
        const columnType = csvData.types[header];
        // Check if it's numeric (integer or float) and has valid longitude values
        if (columnType === 'integer' || columnType === 'float') {
          const hasValidLng = filteredRows.some(row => {
            const val = row[header];
            return isValidLongitude(val);
          });
          return hasValidLng;
        }
        return false;
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Objective 0: Select a chart type */}
      {(confirmedObjective >= 0 || editingObjective === 0) && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              objective0Complete 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {objective0Complete ? '✓' : '0'}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Select a chart type
            </h3>
          </div>

          {!objective0Complete ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">Please select a chart type:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleChartTypeSelection('snapshot')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedChartType === 'snapshot'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Snapshot
                </button>
                <button
                  onClick={() => handleChartTypeSelection('time-series')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedChartType === 'time-series'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Time-series
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-green-800">
                  <span className="font-medium">✓ Chart type selected:</span>{' '}
                  <code className="px-2 py-0.5 bg-green-100 rounded text-green-900">{selectedChartType}</code>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditObjective0}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors"
                  >
                    Change
                  </button>
                  {confirmedObjective < 1 && (
                    <button
                      onClick={handleProceedObjective0}
                      disabled={!objective0Complete}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Proceed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Objective 1: Upload your CSV */}
      {(confirmedObjective >= 1 || editingObjective === 1) && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                objective1Complete 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {objective1Complete ? '✓' : '1'}
              </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Upload your CSV or Select one from previously uploaded
            </h3>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Upload size={18} />
            {isUploading ? 'Uploading...' : 'Upload CSV'}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Previously uploaded datasets */}
        {datasets.length > 0 && !objective1Complete && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-3">Or select from previously uploaded datasets:</p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {datasets.map((dataset) => {
                  const isSelected = selectedDatasetId === dataset.id;
                  return (
                    <div
                      key={dataset.id}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-2 border-blue-700'
                          : 'bg-white text-gray-800 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <button
                        onClick={() => handleDatasetSelection(dataset.id)}
                        disabled={isUploading}
                        className={`flex-1 text-left ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {dataset.original_filename || `Dataset ${dataset.id}`}
                      </button>
                      <button
                        onClick={(e) => handleDeleteDataset(dataset.id, e)}
                        disabled={isUploading}
                        className={`ml-1 p-0.5 rounded hover:bg-opacity-20 transition-colors ${
                          isSelected
                            ? 'hover:bg-white text-white'
                            : 'hover:bg-red-100 text-gray-600'
                        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Delete dataset"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {loadingDatasets && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">Loading previously uploaded datasets...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">Error: {error}</p>
          </div>
        )}

        {objective1Complete && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-800">
                <span className="font-medium">✓ CSV {selectedDatasetId ? 'selected' : 'uploaded'} successfully.</span> Detected {columns?.length || 0} columns.
              </p>
              {confirmedObjective < 2 && (
                <button
                  onClick={handleProceedObjective1}
                  disabled={!objective1Complete}
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Proceed
                </button>
              )}
            </div>
          </div>
        )}
        </div>
      )}

      {/* Objective 2: Select an intervention type field */}
      {(confirmedObjective >= 2 || editingObjective === 2) && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              objective2Complete 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {objective2Complete ? '✓' : '2'}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Select an intervention type field & value
            </h3>
          </div>

          {!objective2Complete ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">Please pick an Intervention Type Column:</p>
              {columns && columns.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-36 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {columns.map((col, idx) => {
                    const fieldName = col.variable || col.original;
                    const isSelected = selectedInterventionField === fieldName;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleFieldSelection(fieldName)}
                        className={`px-3 py-1.5 rounded text-sm font-mono transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-2 border-blue-700'
                            : 'bg-white text-gray-800 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {fieldName}
                      </button>
                    );
                  })}
                </div>
              </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">No columns available. Please upload a CSV file first.</p>
                </div>
              )}
              
              {selectedInterventionField && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    <span className="font-medium">Selected intervention type column:</span>{' '}
                    <code className="px-2 py-0.5 bg-blue-100 rounded text-blue-900">{selectedInterventionField}</code>
                  </p>
                  {uniqueValues.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-blue-800 mb-2">Select a unique value to filter by to produce your `{selectedChartType}` chart:</p>
                      <div className="flex flex-wrap gap-2">
                        {uniqueValues.map((value, idx) => {
                          const isSelected = selectedValue === value;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleValueSelection(value)}
                              className={`px-2 py-1 rounded text-sm transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-2 border-blue-700'
                                  : 'bg-white text-blue-900 border border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-green-800">
                  <span className="font-medium">✓ Intervention type selected:</span>{' '}
                  <code className="px-2 py-0.5 bg-green-100 rounded text-green-900">{selectedInterventionField}</code>
                  {' '}→ <code className="px-2 py-0.5 bg-green-100 rounded text-green-900">{selectedValue}</code>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditObjective2}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors"
                  >
                    Change
                  </button>
                  {confirmedObjective < 3 && (
                    <button
                      onClick={handleProceedObjective2}
                      disabled={!objective2Complete}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Proceed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Objective 3: Select an ID field */}
      {(confirmedObjective >= 3 || editingObjective === 3) && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              objective3Complete 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {objective3Complete ? '✓' : '3'}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Select an ID field
            </h3>
          </div>

          {!objective3Complete ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Columns with data for <code className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-900">{selectedValue}</code>. Please choose one of the yellow fields as your ID field:
              </p>
              {filteredColumns.length > 0 ? (
                <div className="bg-white rounded-lg p-3 border border-blue-200 max-h-48 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {/* Show _ID_ pill first if no valid columns exist */}
                    {validIdColumns.length === 0 && (
                      <button
                        onClick={() => handleIdFieldSelection('_ID_')}
                        className={`px-2 py-1 rounded text-sm font-mono transition-all ${
                          selectedIdFields.includes('_ID_')
                            ? 'bg-blue-600 text-white border-2 border-blue-700'
                            : 'bg-yellow-200 text-yellow-900 border border-yellow-400 hover:border-yellow-500 hover:bg-yellow-300'
                        }`}
                      >
                        _ID_
                      </button>
                    )}
                    
                    {filteredColumns.map((colName, idx) => {
                      const isValid = validIdColumns.includes(colName);
                      const isSelected = selectedIdFields.includes(colName);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleIdFieldSelection(colName)}
                          disabled={!isValid}
                          className={`px-2 py-1 rounded text-sm font-mono transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-2 border-blue-700'
                              : isValid
                              ? 'bg-yellow-200 text-yellow-900 border border-yellow-400 hover:border-yellow-500 hover:bg-yellow-300 cursor-pointer'
                              : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed opacity-60'
                          }`}
                        >
                          {colName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-600">No columns with data found for this value.</p>
                </div>
              )}
              
              {selectedIdFields.length === 0 && filteredColumns.length > 0 && (
                <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {(() => {
                      const config = getChartConfig(selectedChartType);
                      if (config.idFieldRequiresUniqueness) {
                        return 'Only yellow fields are valid ID fields (all values are unique and non-null)';
                      } else {
                        return 'Only yellow fields are valid ID fields (string type columns)';
                      }
                    })()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {(() => {
                    const selectedFieldName = selectedIdFields[0];
                    
                    // For custom _ID_ field, we don't have actual values to show
                    if (selectedFieldName === '_ID_') {
                      return (
                        <div>
                          <p className="text-sm text-green-800 mb-1">
                            <span className="font-medium">✓ Chosen ID field:</span>{' '}
                            <code className="px-1.5 py-0.5 bg-green-100 rounded text-green-900">{selectedFieldName}</code>
                          </p>
                          <p className="text-sm text-green-800">
                            <span className="font-medium">Sample ID values:</span>{' '}
                            <span className="text-green-600 italic">Custom ID field (will be generated)</span>
                          </p>
                        </div>
                      );
                    }
                    
                    // Get sample ID values - use chart type configuration to determine which rows to use
                    const config = getChartConfig(selectedChartType);
                    const rowsToUse = config.idFieldUsesFilteredRows 
                      ? (filteredRows.length > 0 ? filteredRows : (csvData?.rows || []))
                      : (csvData?.rows || []);
                    const sampleValues = rowsToUse
                      .map(row => {
                        const val = row[selectedFieldName];
                        return val !== null && val !== undefined ? val.toString().trim() : null;
                      })
                      .filter(val => val !== null && val !== '')
                      .slice(0, 5);
                    
                    return (
                      <div>
                        <p className="text-sm text-green-800 mb-1">
                          <span className="font-medium">✓ Chosen ID field:</span>{' '}
                          <code className="px-1.5 py-0.5 bg-green-100 rounded text-green-900">{selectedFieldName}</code>
                        </p>
                        <p className="text-sm text-green-800">
                          <span className="font-medium">Sample ID values:</span>{' '}
                          {sampleValues.length > 0 ? (
                            <span className="font-mono">
                              {sampleValues.map((val, idx) => (
                                <span key={idx}>
                                  <code className="px-1.5 py-0.5 bg-green-100 rounded text-green-900">{val}</code>
                                  {idx < sampleValues.length - 1 && ', '}
                                </span>
                              ))}
                              {filteredRows.length > 5 && ' ...'}
                            </span>
                          ) : (
                            <span className="text-green-600 italic">No values found</span>
                          )}
                        </p>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleEditObjective3}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors whitespace-nowrap"
                  >
                    Change
                  </button>
                  {confirmedObjective < 4 && (
                    <button
                      onClick={handleProceedObjective3}
                      disabled={!objective3Complete}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Proceed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Objective 4: Select a date field */}
      {(confirmedObjective >= 4 || editingObjective === 4) && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              objective4Complete 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {objective4Complete ? '✓' : '4'}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Select a date field
            </h3>
          </div>

          {!objective4Complete ? (
            <div>
              {dateColumns.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Select a date field from the detected date columns:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {dateColumns.map((colName, idx) => {
                        const isSelected = selectedDateField === colName;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleDateFieldSelection(colName)}
                            className={`px-3 py-1.5 rounded text-sm font-mono transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-2 border-blue-700'
                                : 'bg-white text-gray-800 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                          >
                            {colName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No date columns detected in the filtered data. Date columns must have all values matching date formats (YYYY-MM-DD, MM/DD/YYYY, etc.).
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-green-800">
                  <span className="font-medium">✓ Date field selected:</span>{' '}
                  <code className="px-2 py-0.5 bg-green-100 rounded text-green-900">{selectedDateField}</code>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditObjective4}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors"
                  >
                    Change
                  </button>
                  {confirmedObjective < 5 && (
                    <button
                      onClick={handleProceedObjective4}
                      disabled={!objective4Complete}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Proceed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Objective 5: Select latitude and longitude fields (only for snapshot) */}
      {shouldShowObjective(5, selectedChartType) && (confirmedObjective >= 5 || editingObjective === 5) && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              objective5Complete 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {objective5Complete ? '✓' : '5'}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Select latitude and longitude fields
            </h3>
          </div>

          {!objective5Complete ? (
            <div>
              {/* Latitude Selection */}
              {!selectedLatitudeField ? (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">Please select a Latitude field:</p>
                  {latitudeColumns.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-36 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {latitudeColumns.map((colName, idx) => {
                          const isSelected = selectedLatitudeField === colName;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleLatitudeFieldSelection(colName)}
                              className={`px-3 py-1.5 rounded text-sm font-mono transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-2 border-blue-700'
                                  : 'bg-white text-gray-800 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                            >
                              {colName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        No latitude columns detected. Latitude columns must be numeric (integer or float) with values between -90 and 90.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">✓ Latitude field selected:</span>{' '}
                    <code className="px-2 py-0.5 bg-green-100 rounded text-green-900">{selectedLatitudeField}</code>
                  </p>
                </div>
              )}

              {/* Longitude Selection - only show after latitude is selected */}
              {selectedLatitudeField && (
                <div>
                  {!selectedLongitudeField ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">Please select a Longitude field:</p>
                      {longitudeColumns.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-36 overflow-y-auto">
                          <div className="flex flex-wrap gap-2">
                            {longitudeColumns.map((colName, idx) => {
                              const isSelected = selectedLongitudeField === colName;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleLongitudeFieldSelection(colName)}
                                  className={`px-3 py-1.5 rounded text-sm font-mono transition-all ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-2 border-blue-700'
                                      : 'bg-white text-gray-800 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                  }`}
                                >
                                  {colName}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            No longitude columns detected. Longitude columns must be numeric (integer or float) with values between -180 and 180.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">✓ Longitude field selected:</span>{' '}
                        <code className="px-2 py-0.5 bg-green-100 rounded text-green-900">{selectedLongitudeField}</code>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-800 mb-1">
                    <span className="font-medium">✓ Latitude field selected:</span>{' '}
                    <code className="px-2 py-0.5 bg-green-100 rounded text-green-900">{selectedLatitudeField}</code>
                  </p>
                  <p className="text-sm text-green-800">
                    <span className="font-medium">✓ Longitude field selected:</span>{' '}
                    <code className="px-2 py-0.5 bg-green-100 rounded text-green-900">{selectedLongitudeField}</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditObjective5}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors"
                  >
                    Change
                  </button>
                  {confirmedObjective < 6 && (
                    <button
                      onClick={handleProceedObjective5}
                      disabled={!objective5Complete}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Proceed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DefineInterventionTab;

