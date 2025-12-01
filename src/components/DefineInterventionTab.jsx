import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { createCMProject, uploadDataset, analyzeDataset } from '../services/continuousMonitoringApi';

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
  const [filteredRows, setFilteredRows] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
  const [csvData, setCsvData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedObjective, setConfirmedObjective] = useState(0); // Track which objective has been confirmed via Proceed button
  const fileInputRef = useRef(null);

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
    setFilteredRows([]);
    setColumnTypes({});
    setCsvData(null);
    setConfirmedObjective(0);

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
        
        // Find columns with at least one non-NULL value in filtered rows
        const columnsWithValues = [];
        const validColumns = [];
        
        csvData.headers.forEach(header => {
          const hasNonNullValue = filtered.some(row => {
            const val = row[header];
            return val !== null && val !== undefined && val.toString().trim() !== '';
          });
          if (hasNonNullValue) {
            columnsWithValues.push(header);
            // Check if this column is a valid ID column
            if (isValidIdColumn(header, filtered, csvData.types)) {
              validColumns.push(header);
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

  // Handlers to go back and edit previous objectives
  const handleEditObjective1 = () => {
    // Reset intervention type selection and all subsequent objectives
    setSelectedInterventionField(null);
    setSelectedValue(null);
    setUniqueValues([]);
    setFilteredColumns([]);
    setValidIdColumns([]);
    setSelectedIdFields([]);
    setSelectedDateField(null);
    setFilteredRows([]);
    setConfirmedObjective(0); // Reset to objective 0
  };

  const handleEditObjective2 = () => {
    // Reset ID field selection and subsequent objectives
    setSelectedIdFields([]);
    setSelectedDateField(null);
    setConfirmedObjective(1); // Reset to objective 1
  };

  const handleEditObjective3 = () => {
    // Reset date field selection
    setSelectedDateField(null);
    setConfirmedObjective(2); // Reset to objective 2
  };

  // Handlers for Proceed buttons
  const handleProceedObjective1 = () => {
    if (selectedInterventionField && selectedValue) {
      setConfirmedObjective(1);
    }
  };

  const handleProceedObjective2 = () => {
    if (selectedIdFields.length === 1) {
      setConfirmedObjective(2);
    }
  };

  const handleProceedObjective3 = () => {
    if (selectedDateField) {
      setConfirmedObjective(3);
    }
  };

  // Determine completion status for each objective
  const objective0Complete = columns && columns.length > 0;
  const objective1Complete = selectedInterventionField && selectedValue;
  const objective2Complete = selectedIdFields.length === 1;
  const objective3Complete = selectedDateField !== null;

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

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Objective 0: Upload your CSV */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gray-300 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              objective0Complete 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-300 text-gray-600'
            }`}>
              {objective0Complete ? '✓' : '0'}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Upload your CSV file
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

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">Error: {error}</p>
          </div>
        )}

        {objective0Complete && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-800">
                <span className="font-medium">✓ CSV uploaded successfully.</span> Detected {columns.length} columns.
              </p>
              {confirmedObjective < 1 && (
                <button
                  onClick={() => setConfirmedObjective(1)}
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Proceed
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Objective 1: Select an intervention type field */}
      {(confirmedObjective >= 1 || objective0Complete) && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              objective1Complete 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {objective1Complete ? '✓' : '1'}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Select an intervention type field
            </h3>
          </div>

          {!objective1Complete ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">Please pick an Intervention Type Column:</p>
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
              
              {selectedInterventionField && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    <span className="font-medium">Selected intervention type column:</span>{' '}
                    <code className="px-2 py-0.5 bg-blue-100 rounded text-blue-900">{selectedInterventionField}</code>
                  </p>
                  {uniqueValues.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-blue-800 mb-2">Select a unique value to filter by:</p>
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
                    onClick={handleEditObjective1}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors"
                  >
                    Change
                  </button>
                  {confirmedObjective < 2 && (
                    <button
                      onClick={handleProceedObjective1}
                      disabled={!objective1Complete}
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

      {/* Objective 2: Select an ID field */}
      {(confirmedObjective >= 2 || objective1Complete) && (
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
              Select an ID field
            </h3>
          </div>

          {!objective2Complete ? (
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
                    Only yellow fields are valid ID fields (all values are unique and non-null)
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
                    
                    // Get sample ID values from filtered rows (up to 5)
                    const sampleValues = filteredRows
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
                    onClick={handleEditObjective2}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors whitespace-nowrap"
                  >
                    Change
                  </button>
                  {confirmedObjective < 3 && (
                    <button
                      onClick={handleProceedObjective2}
                      disabled={!objective2Complete}
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

      {/* Objective 3: Select a date field */}
      {(confirmedObjective >= 3 || objective2Complete) && (
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
              Select a date field
            </h3>
          </div>

          {!objective3Complete ? (
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
                    onClick={handleEditObjective3}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors"
                  >
                    Change
                  </button>
                  {confirmedObjective < 4 && (
                    <button
                      onClick={handleProceedObjective3}
                      disabled={!objective3Complete}
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

      {/* Objective 4: Select latitude and longitude fields */}
      {(confirmedObjective >= 4 || objective3Complete) && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-300 p-6 opacity-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gray-300 text-gray-600">
              4
            </div>
            <h3 className="text-lg font-semibold text-gray-600">
              Select latitude and longitude fields
            </h3>
          </div>
          <p className="text-sm text-gray-500 italic">Coming soon...</p>
        </div>
      )}

      {/* Objective 5: Select a chart type */}
      {(confirmedObjective >= 4 || objective3Complete) && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-300 p-6 opacity-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gray-300 text-gray-600">
              5
            </div>
            <h3 className="text-lg font-semibold text-gray-600">
              Select a chart type
            </h3>
          </div>
          <p className="text-sm text-gray-500 italic">Coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default DefineInterventionTab;

