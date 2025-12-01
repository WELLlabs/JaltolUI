import React, { useState } from 'react';
import { MapPin, Earth, Share2, Upload } from 'lucide-react';

const SiteSnapshotTemplate = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isLayersCollapsed, setIsLayersCollapsed] = useState(false);
  const [isDataCollapsed, setIsDataCollapsed] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({
    villageBoundary: true,
    watershedBoundary: false,
    drainageLines: false,
    lulcMap: true,
    interventions: true,
    wells: true,
    elevationMap: false
  });

  const toggleLayer = (key) => {
    setLayerVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const lulcLegend = [
    { color: '#397d49', label: 'Tree Cover' },
    { color: '#8b9dc3', label: 'Single Crop' },
    { color: '#222f5b', label: 'Double Crop' },
    { color: '#946b2d', label: 'Shrubs' }
  ];

  const interventionTypes = ['gabion', 'gully-plug', 'check-dam', 'earthen-dam', 'farm-pond', 'bunding'];
  const [typeVisibility, setTypeVisibility] = useState(
    interventionTypes.reduce((acc, type) => ({ ...acc, [type]: true }), {})
  );

  const toggleType = (type) => {
    setTypeVisibility(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="text-blue-600" size={20} />
          Site Snapshot View
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Interactive map showing static data points with layers and filters
        </p>
      </div>

      {/* Main Container */}
      <div className="flex gap-4 h-[500px]">
        {/* Collapsible Sidebar */}
        <div className={`bg-white bg-opacity-95 rounded-lg shadow-md border border-gray-300 transition-all duration-300 ${
          isSidebarExpanded ? 'w-48' : 'w-12'
        }`}>
          {/* Expand/Collapse Arrow */}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="w-8 h-8 bg-white flex items-center justify-center border border-gray-300 px-2 hover:bg-gray-100 transition-colors mt-2 mx-2"
            title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className={`text-gray-600 transition-transform duration-300 ${isSidebarExpanded ? 'rotate-180' : ''}`}
            >
              <path
                d="M6 12 L10 8 L6 4"
                stroke="currentColor"
                strokeWidth="0"
                fill="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Layer Icons */}
          <div className={`flex flex-col gap-2 mt-2 px-2 ${isSidebarExpanded ? 'items-start' : 'items-center'}`}>
            <button
              onClick={() => toggleLayer('villageBoundary')}
              className={`flex items-center gap-2 p-2 rounded-md transition-all ${
                layerVisibility.villageBoundary ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500 opacity-60'
              } ${isSidebarExpanded ? 'w-full justify-start' : 'w-8 h-8 justify-center'}`}
            >
              <span className="inline-block w-4 h-4 rounded-sm border-2 border-red-500" />
              {isSidebarExpanded && <span className="text-sm text-gray-700 truncate">Boundary</span>}
            </button>

            <button
              onClick={() => toggleLayer('lulcMap')}
              className={`flex items-center gap-2 p-2 rounded-md transition-all ${
                layerVisibility.lulcMap ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500 opacity-60'
              } ${isSidebarExpanded ? 'w-full justify-start' : 'w-8 h-8 justify-center'}`}
            >
              <Earth size={16} className="text-green-600" />
              {isSidebarExpanded && <span className="text-sm text-gray-700 truncate">Land Use</span>}
            </button>

            <button
              onClick={() => toggleLayer('interventions')}
              className={`flex items-center gap-2 p-2 rounded-md transition-all ${
                layerVisibility.interventions ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500 opacity-60'
              } ${isSidebarExpanded ? 'w-full justify-start' : 'w-8 h-8 justify-center'}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" className="text-purple-600">
                <rect x="2" y="2" width="5" height="5" fill="#8B5CF6" />
                <circle cx="12" cy="5" r="3" fill="#06B6D4" />
              </svg>
              {isSidebarExpanded && <span className="text-sm text-gray-700 truncate">Interventions</span>}
            </button>

            <button
              onClick={() => toggleLayer('wells')}
              className={`flex items-center gap-2 p-2 rounded-md transition-all ${
                layerVisibility.wells ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500 opacity-60'
              } ${isSidebarExpanded ? 'w-full justify-start' : 'w-8 h-8 justify-center'}`}
            >
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              {isSidebarExpanded && <span className="text-sm text-gray-700 truncate">Wells</span>}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Action Buttons */}
          <div className="flex items-start gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
              <Upload size={16} />
              Add your own data
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2">
              <Share2 size={16} />
              Share this project
            </button>
          </div>

          {/* Map and Accordions Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {/* Map Container */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-green-100 via-blue-50 to-green-50 relative">
                {/* Mock Map Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={48} className="mx-auto text-blue-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Interactive Map View</p>
                    <p className="text-xs text-gray-500 mt-1">Your data points will appear here</p>
                  </div>
                </div>

                {/* Sample markers scattered on map */}
                <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-orange-500 rounded-full shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-500 rounded-full shadow-lg"></div>
                <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-cyan-500 rounded-full shadow-lg animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Village boundary mockup */}
                {layerVisibility.villageBoundary && (
                  <div className="absolute inset-8 border-2 border-red-500 rounded-lg opacity-60"></div>
                )}

                {/* Zoom controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-1 bg-white rounded shadow-md">
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 border-b border-gray-200 text-gray-700 font-bold">+</button>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold">−</button>
                </div>

                {/* Scale bar */}
                <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded shadow-sm text-xs text-gray-600">
                  Scale: 1:10,000
                </div>
              </div>
            </div>

            {/* Accordions Container */}
            <div className="bg-white rounded-lg shadow-lg flex flex-col">
              {/* Layers Accordion */}
              <div className={`bg-white rounded-t-lg transition-all duration-300 ${
                isLayersCollapsed ? 'flex-shrink-0' : 'flex-1 flex flex-col'
              }`}>
                <button
                  onClick={() => setIsLayersCollapsed(!isLayersCollapsed)}
                  className="w-full flex items-center justify-between border border-gray-300 bg-white hover:bg-gray-50 transition-colors rounded px-3 py-2"
                >
                  <h3 className="text-base font-semibold text-gray-800">Layers</h3>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className={`text-gray-600 transition-transform duration-300 ${isLayersCollapsed ? '' : 'rotate-180'}`}
                  >
                    <path d="M8 6 L12 10 L4 10 Z" fill="black" />
                  </svg>
                </button>

                <div className={`flex-1 transition-all duration-300 overflow-hidden ${
                  isLayersCollapsed ? 'max-h-0 opacity-0' : 'max-h-full opacity-100'
                }`}>
                  <div className="p-4 pt-2 max-h-[175px] overflow-y-auto">
                    {/* LULC Legend */}
                    <div className="mt-2 pt-2">
                      <div className="text-sm font-medium text-gray-700 mb-2">LULC Classes</div>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        {lulcLegend.map(item => (
                          <li key={item.label} className="flex items-center gap-2">
                            <span className="inline-block w-4 h-4 rounded-sm" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-700">{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Intervention Types */}
                    <div className="mt-4 border-t border-gray-300 pt-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Intervention Types</div>
                      <ul className="grid grid-cols-3 gap-2 text-[11px]">
                        {interventionTypes.map((type) => (
                          <li key={type}>
                            <button
                              onClick={() => toggleType(type)}
                              className={`w-full flex items-center gap-1 px-2 py-1 rounded border transition ${
                                typeVisibility[type] ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500 opacity-60'
                              }`}
                            >
                              {type === 'gabion' && <span className="inline-block w-3 h-3 bg-purple-500" />}
                              {type === 'gully-plug' && <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />}
                              {type === 'check-dam' && <span className="inline-block w-3 h-3 bg-blue-500" />}
                              {type === 'earthen-dam' && <span className="inline-block w-3 h-3 bg-amber-500" />}
                              {type === 'farm-pond' && <span className="inline-block w-3 h-3 rounded-sm bg-cyan-500" />}
                              {type === 'bunding' && <span className="inline-block w-3 h-1 bg-red-500" />}
                              <span className="truncate capitalize">{type.replace('-', ' ')}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intervention Details Accordion */}
              <div className={`bg-white rounded-b-lg transition-all duration-300 ${
                isDataCollapsed ? 'flex-shrink-0' : 'flex-1 flex flex-col'
              }`}>
                <button
                  onClick={() => setIsDataCollapsed(!isDataCollapsed)}
                  className="w-full flex items-center justify-between border border-gray-300 bg-white hover:bg-gray-50 transition-colors rounded px-3 py-2"
                >
                  <h3 className="text-base font-semibold text-gray-800">Intervention Details</h3>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className={`text-gray-600 transition-transform duration-300 ${isDataCollapsed ? '' : 'rotate-180'}`}
                  >
                    <path d="M8 6 L12 10 L4 10 Z" fill="black" />
                  </svg>
                </button>

                <div className={`flex-1 transition-all duration-300 overflow-hidden ${
                  isDataCollapsed ? 'max-h-0 opacity-0' : 'max-h-full opacity-100'
                }`}>
                  <div className="p-4 bg-gray-50 min-h-[150px] flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <p className="text-sm text-gray-500">Click on an intervention marker or well to view details and monitoring data</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSnapshotTemplate;
