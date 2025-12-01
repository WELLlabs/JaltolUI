import React from 'react';
import { FileText } from 'lucide-react';

const SimpleReportTemplate = () => {
  return (
    <div className="w-full h-full bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="text-amber-600" size={20} />
          Simple Report View
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Clean summary with key metrics and insights
        </p>
      </div>

      {/* Preview */}
      <div className="relative bg-white rounded-lg shadow-md h-[400px] border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
          <h2 className="text-xl font-bold">Project Summary Report</h2>
          <p className="text-sm opacity-90 mt-1">Generated: November 2023</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">142</div>
              <div className="text-xs text-gray-600 mt-1">Total Sites</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="text-2xl font-bold text-green-600">87%</div>
              <div className="text-xs text-gray-600 mt-1">Data Coverage</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">3.2M</div>
              <div className="text-xs text-gray-600 mt-1">Data Points</div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Key Insights</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">Average value increased by 24% over the period</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">85% of sites showing positive trends</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-blue-500 mt-0.5">ℹ</span>
                <span className="text-gray-700">Seasonal patterns detected in 12 locations</span>
              </li>
            </ul>
          </div>

          {/* Data Quality */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Data Quality</h4>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <span className="text-sm font-medium text-gray-700">87%</span>
            </div>
          </div>
        </div>

        {/* Download button */}
        <div className="absolute bottom-4 right-4">
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition flex items-center gap-2">
            <FileText size={16} />
           Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleReportTemplate;
