import React, { useState } from 'react';
import AnalystChat from '../../components/AnalystChat';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DefineInterventionTab from '../../components/DefineInterventionTab';

const NewCMProject = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('define-intervention');

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
              {/* Define your Intervention - visible */}
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
              
              {/* Site Snapshot - visible */}
              <button
                onClick={() => setSelectedTemplate('site-snapshot')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTemplate === 'site-snapshot'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Site Snapshot
              </button>
              
              {/* Hidden pills - commented out for now */}
              {/* 
              <button
                onClick={() => setSelectedTemplate('time-traveler')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTemplate === 'time-traveler'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Time Traveler
              </button>
              <button
                onClick={() => setSelectedTemplate('impact-analyzer')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTemplate === 'impact-analyzer'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Impact Analyzer
              </button>
              <button
                onClick={() => setSelectedTemplate('correlation')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTemplate === 'correlation'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Correlation Explorer
              </button>
              <button
                onClick={() => setSelectedTemplate('simple-report')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTemplate === 'simple-report'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Simple Report
              </button>
              */}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto p-4">
          {selectedTemplate === 'define-intervention' && <DefineInterventionTab />}
          {selectedTemplate === 'site-snapshot' && (
            <div className="text-center py-12 text-gray-500">
              Site Snapshot template preview (coming soon)
            </div>
          )}
        </div>

        <AnalystChat />
      </div>
      <Footer />
    </>
  );
};

export default NewCMProject;
