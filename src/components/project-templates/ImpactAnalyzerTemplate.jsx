import React from 'react';
import { TrendingUp } from 'lucide-react';

const ImpactAnalyzerTemplate = () => {
  return (
    <div className="w-full h-full bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-green-600" size={20} />
          Impact Analyzer View
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Compare before/after intervention impacts
        </p>
      </div>

      {/* Preview */}
      <div className="relative bg-white rounded-lg shadow-md h-[400px] border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Before */}
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-700 mb-3">Before Intervention</div>
            <div className="flex-1 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Average Value:</span>
                  <span className="text-lg font-bold text-red-600">45.2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Sample Size:</span>
                  <span className="text-sm font-medium">120 points</span>
                </div>
                <div className="mt-4">
                  <div className="h-24 bg-white rounded p-2 flex items-end justify-around gap-1">
                    {[30, 40, 35, 45, 40, 38, 42].map((h, i) => (
                      <div key={i} className="w-full bg-red-400 rounded-t" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-700 mb-3">After Intervention</div>
            <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Average Value:</span>
                  <span className="text-lg font-bold text-green-600">62.8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Sample Size:</span>
                  <span className="text-sm font-medium">120 points</span>
                </div>
                <div className="mt-4">
                  <div className="h-24 bg-white rounded p-2 flex items-end justify-around gap-1">
                    {[50, 65, 60, 70, 62, 58, 68].map((h, i) => (
                      <div key={i} className="w-full bg-green-400 rounded-t" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="absolute bottom-6 left-6 right-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Impact:</span>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-lg font-bold text-green-600">+39%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalyzerTemplate;
