import React from 'react';
import { ScatterChart } from 'lucide-react';

const CorrelationExplorerTemplate = () => {
  return (
    <div className="w-full h-full bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ScatterChart className="text-indigo-600" size={20} />
          Correlation Explorer View
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Discover relationships between different variables
        </p>
      </div>

      {/* Preview */}
      <div className="relative bg-white rounded-lg shadow-md h-[400px] border border-gray-200 p-6">
        {/* Axis selectors */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">X-Axis:</span>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Rainfall (mm)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Y-Axis:</span>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Groundwater Level (m)</option>
            </select>
          </div>
        </div>

        {/* Scatter plot mockup */}
        <div className="relative h-[280px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
          {/* Grid lines */}
          <div className="absolute inset-4 border-l-2 border-b-2 border-gray-300">
            {/* Y-axis labels */}
            <div className="absolute -left-8 top-0 text-xs text-gray-500">High</div>
            <div className="absolute -left-8 bottom-0 text-xs text-gray-500">Low</div>
            
            {/* X-axis labels */}
            <div className="absolute -bottom-6 left-0 text-xs text-gray-500">Low</div>
            <div className="absolute -bottom-6 right-0 text-xs text-gray-500">High</div>

            {/* Scatter points */}
            <div className="relative w-full h-full">
              {[
                { left: '15%', bottom: '20%' },
                { left: '25%', bottom: '35%' },
                { left: '35%', bottom: '45%' },
                { left: '45%', bottom: '50%' },
                {left: '55%', bottom: '60%' },
                { left: '65%', bottom: '70%' },
                { left: '75%', bottom: '75%' },
                { left: '  20%', bottom: '30%' },
                { left: '70%', bottom: '80%' },
                { left: '50%', bottom: '55%' },
                { left: '40%', bottom: '48%' },
                { left: '60%', bottom: '65%' },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-indigo-500 rounded-full opacity-70"
                  style={{ left: pos.left, bottom: pos.bottom }}
                ></div>
              ))}

              {/* Trend line */}
              <div 
                className="absolute w-full h-0.5 bg-indigo-600 opacity-40"
                style={{
                  transform: 'rotate(35deg)',
                  transformOrigin: 'left bottom',
                  left: 0,
                  bottom: 0
                }}
              ></div>
            </div>
          </div>

          {/* Correlation coefficient */}
          <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded shadow-sm border border-indigo-200">
            <div className="text-xs text-gray-600">Correlation</div>
            <div className="text-lg font-bold text-indigo-600">r = 0.87</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationExplorerTemplate;
