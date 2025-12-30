import React, { useState } from 'react';
import AnalystChat from '../../components/AnalystChat';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DefineInterventionTab from '../../components/DefineInterventionTab';
import SnapshotView from '../../components/cm/SnapshotView';
import TimeSeriesView from '../../components/cm/TimeSeriesView';

const NewCMProject = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('define-intervention');
  const [completedConfig, setCompletedConfig] = useState(null);

  // Handle completion callback from DefineInterventionTab
  const handleDefineInterventionComplete = (configData) => {
    console.log('Define Intervention completed with config:', configData);
    setCompletedConfig(configData);
    
    // Automatically switch to the result tab
    if (configData.chartType === 'snapshot') {
      setSelectedTemplate('snapshot');
    } else if (configData.chartType === 'time-series') {
      setSelectedTemplate('time-series');
    }
  };

  // Get the tab label for the result view
  const getResultTabLabel = () => {
    if (!completedConfig) return null;
    return completedConfig.chartType === 'snapshot' ? 'Snapshot' : 'Time-series';
  };

  return (
    <>
      <Navbar />
      <div style={{ 
        minHeight: 'calc(100vh-120px)', 
        background: '#ffffff',
        padding: '0px 0px'
      }}>
        {/* Template Pills */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-3 flex-wrap">
              {/* Define your Intervention - always visible */}
              <button
                onClick={() => setSelectedTemplate('define-intervention')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTemplate === 'define-intervention'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Define your Intervention
              </button>
              
              {/* Dynamic result tab - only visible after completion */}
              {completedConfig && (
                <button
                  onClick={() => setSelectedTemplate(completedConfig.chartType)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTemplate === completedConfig.chartType
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getResultTabLabel()}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className={selectedTemplate === 'define-intervention' ? 'max-w-7xl mx-auto p-4' : ''}>
          {selectedTemplate === 'define-intervention' && (
            <DefineInterventionTab onComplete={handleDefineInterventionComplete} />
          )}
          
          {selectedTemplate === 'snapshot' && completedConfig && (
            <SnapshotView
              data={completedConfig.filteredRows}
              idField={completedConfig.idField}
              latField={completedConfig.latitudeField}
              lngField={completedConfig.longitudeField}
              dateField={completedConfig.dateField}
              csvData={completedConfig.csvData}
              columnTypes={completedConfig.columnTypes}
              selectedValue={completedConfig.selectedValue}
            />
          )}
          
          {selectedTemplate === 'time-series' && completedConfig && (
            <TimeSeriesView
              data={completedConfig.filteredRows}
              allData={completedConfig.csvData}
              idField={completedConfig.idField}
              dateField={completedConfig.dateField}
              columnTypes={completedConfig.columnTypes}
              selectedValue={completedConfig.selectedValue}
            />
          )}
        </div>

        <AnalystChat />
      </div>
      <Footer />
    </>
  );
};

export default NewCMProject;

