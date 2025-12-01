import React from 'react';
import { Clock, Play } from 'lucide-react';

const TimeTravelerTemplate = () => {
  return (
    <div className="w-full h-full bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="text-purple-600" size={20} />
          Time Traveler View
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Watch data change over time with temporal playback
        </p>
      </div>

      {/* Preview */}
      <div className="relative bg-white rounded-lg shadow-md h-[400px] border border-gray-200">
        {/* Time Slider */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 p-4 rounded-lg shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700">
              <Play size={16} />
            </button>
            <div className="flex-1">
              <input 
                type="range"
                className="w-full"
                min="0"
                max="100"
                value="50"
                readOnly
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Jan 2023</span>
                <span className="font-medium text-purple-600">Jun 2023</span>
                <span>Dec 2023</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Map with Time Series */}
        <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
          <div className="space-y-4 text-center">
            <Clock size={48} className="mx-auto text-purple-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Time-series visualization</p>
              <p className="text-xs text-gray-500 mt-1">
                See how values change month by month
              </p>
            </div>
            {/* Sample animated indicators */}
            <div className="flex justify-center gap-4 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-2 bg-purple-500 rounded animate-pulse"
                  style={{
                    height: `${20 + i * 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTravelerTemplate;
