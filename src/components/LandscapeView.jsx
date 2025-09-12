import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, Marker, Popup } from 'react-leaflet';
import { Mountain, Earth } from 'lucide-react';

import L from 'leaflet';
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';
import { get_boundary_data, get_lulc_raster, get_srtm_raster } from '../services/api';
import interventionsJsonData from '../assets/vapi-interventions-y1.json';
import wellsJsonData from '../assets/vapi-wells-y1.json';
import WaterWellIcon from '../assets/water-well.png';  // attribute Icongeek26 - Flaticon

// Combined Legend + Layer toggles (inspired by ImpactAssessment V2)
const CombinedLegendControls = ({
  layerVisibility,
  setLayerVisibility,
  interventionTypes,
  typeVisibility,
  setTypeVisibility,
  selectedIntervention,
  setSelectedIntervention
}) => {
  const [isLayersCollapsed, setIsLayersCollapsed] = useState(false);
  const [isDataCollapsed, setIsDataCollapsed] = useState(false);
  const toggle = (key) => setLayerVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleType = (type) => setTypeVisibility(prev => ({ ...prev, [type]: !prev[type] }));

  const primaryItems = [
    {
      key: 'villageBoundary',
      label: 'Village Boundary',
      // outlined box (no fill) for vector boundary
      icon: (
        <span className="inline-block w-4 h-4 rounded-sm border-2 border-red-500" />
      )
    },
    {
      key: 'interventions',
      label: 'Interventions',
      // simple geometric icon
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-purple-600">
          <rect x="2" y="2" width="5" height="5" fill="#8B5CF6" />
          <circle cx="12" cy="5" r="3" fill="#06B6D4" />
          <path d="M8 14 L12 10 L4 10 Z" fill="#F59E0B" />
        </svg>
      )
    },
    {
      key: 'wells',
      label: 'Wells',
      // well icon
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-blue-600">
          <circle cx="8" cy="8" r="6" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1"/>
          <circle cx="8" cy="8" r="3" fill="#60A5FA" opacity="0.7"/>
        </svg>
      )
    },
    {
      key: 'lulcMap',
      label: 'Land Use Land Cover',
      // filled box for raster
      icon: (
        <span className="inline-block w-4 h-4 rounded-sm" style={{ backgroundColor: '#8b9dc3' }} />
      )
    }
  ];

  const lulcLegend = [
    { color: '#397d49', label: 'Tree Cover' },
    { color: '#8b9dc3', label: 'Single Crop' },
    { color: '#222f5b', label: 'Double Crop' },
    { color: '#946b2d', label: 'Shrubs' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm h-full lg:h-[400px] flex flex-col">
      {/* Layers Panel */}
      <div className={`bg-white rounded-t-lg transition-all duration-300 ${
        isLayersCollapsed && isDataCollapsed ? 'flex-shrink-0' : isLayersCollapsed ? 'flex-shrink-0' : 'flex-1 flex flex-col'
      }`}>
        {/* Collapsible Title */}
        <button
          onClick={() => setIsLayersCollapsed(!isLayersCollapsed)}
          className="w-full flex items-center justify-between border border-gray-500 bg-white hover:bg-gray-50 transition-colors rounded px-2 py-1"
          title={isLayersCollapsed ? "Expand layers panel" : "Collapse layers panel"}
        >
          <h3 className="text-lg font-semibold text-gray-800">Layers</h3>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className={`text-gray-600 transition-transform duration-300 ${isLayersCollapsed ? '' : 'rotate-180'}`}
          >
            <path
              d="M8 6 L12 10 L4 10 Z"
              stroke="currentColor"
              strokeWidth="0"
              fill="black"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Collapsible Content */}
        <div className={`flex-1 transition-all duration-300 overflow-hidden ${
          isLayersCollapsed ? 'max-h-0 opacity-0' : 'max-h-full opacity-100'
        }`}>
          <div
            className="p-4 pt-0 max-h-[175px] overflow-y-auto"
            style={{
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* IE and Edge */
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.setProperty('-webkit-scrollbar', 'display: none');
            }}
          >
            {/* LULC legend (static swatches) */}
            <div className="mt-2 pt-3">
              <div className="text-sm font-medium text-gray-700 mb-2">LULC Classes</div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
                {lulcLegend.map(item => (
                  <li key={item.label} className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interventions sub-layer toggles */}
            {interventionTypes && interventionTypes.length > 0 && (
              <div className="mt-4 border-t border-gray-500 pt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Intervention Types</div>
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px]">
                  {interventionTypes.map((type) => (
                    <li key={type}>
                      <button
                        type="button"
                        aria-pressed={!!typeVisibility[type]}
                        onClick={() => toggleType(type)}
                        disabled={!layerVisibility.interventions}
                        className={`w-full flex items-center gap-1 px-2 py-1 rounded border transition select-none ${
                          typeVisibility[type] ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500 opacity-60'
                        } ${!layerVisibility.interventions ? 'pointer-events-none opacity-40' : ''}`}
                        title={`Toggle ${type}`}
                      >
                        {/* Minimal inline icons per type */}
                        {type === 'gabion' && <span className="inline-block w-3 h-3 bg-purple-500" />}
                        {type === 'gully-plug' && <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />}
                        {type === 'check-dam' && <span className="inline-block w-3 h-3 bg-blue-500" />}
                        {type === 'earthen-dam' && <span className="inline-block w-3 h-3 bg-amber-500" />}
                        {type === 'farm-pond' && <span className="inline-block w-3 h-3 rounded-sm bg-cyan-500" />}
                        {type === 'bunding' && <span className="inline-block w-3 h-1 bg-red-500" />}
                        {type === 'CCT' && <span className="inline-block w-3 h-1 bg-violet-500" />}
                        {!['gabion','gully-plug','check-dam','earthen-dam','farm-pond','bunding','CCT'].includes(type) && (
                          <span className="inline-block w-3 h-3 bg-gray-400" />
                        )}
                        <span className="truncate capitalize">{type.replace('-', ' ')}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Intervention Data Panel */}
      <div className={`bg-white rounded-b-lg transition-all duration-300 ${
        isLayersCollapsed && isDataCollapsed ? 'flex-shrink-0' : isDataCollapsed ? 'flex-shrink-0' : 'flex-1 flex flex-col'
      }`}>
        {/* Collapsible Title */}
        <button
          onClick={() => setIsDataCollapsed(!isDataCollapsed)}
          className="w-full flex items-center justify-between border border-gray-500 bg-white hover:bg-gray-50 transition-colors rounded px-2 py-1"
          title={isDataCollapsed ? "Expand intervention data panel" : "Collapse intervention data panel"}
        >
          <h3 className="text-lg font-semibold text-gray-800">Intervention Data</h3>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className={`text-gray-600 transition-transform duration-300 ${isDataCollapsed ? '' : 'rotate-180'}`}
          >
            <path
              d="M8 6 L12 10 L4 10 Z"
              stroke="currentColor"
              strokeWidth="0"
              fill="black"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Collapsible Content */}
        <div className={`flex-1 transition-all duration-300 overflow-hidden ${
          isDataCollapsed ? 'max-h-0 opacity-0' : 'max-h-full opacity-100'
        }`}>
          <div
            className="p-0 pt-0 max-h-[175px] overflow-y-auto"
            style={{
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* IE and Edge */
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.setProperty('-webkit-scrollbar', 'display: none');
            }}
          >
            {selectedIntervention ? (
              /* Selected Intervention Details */
              <div className="px-4 py-2 bg-gray-50">
                <div className="flex items-end justify-end mb-3">
                  <button
                    onClick={() => setSelectedIntervention(null)}
                    className="bg-white p-0.5 w-6 h-6 flex items-center justify-center transition-all duration-150 focus:outline-none"
                    title="Clear selection"
                    style={{ lineHeight: 0, minWidth: 0, minHeight: 0 }}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4l8 8" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">ID:</span>
                    <span className="text-gray-900">{selectedIntervention.intervention_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Type:</span>
                    <span className="text-gray-900">{selectedIntervention.intervention_type?.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Village:</span>
                    <span className="text-gray-900">{selectedIntervention.village}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className="text-gray-900">{selectedIntervention.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Completed:</span>
                    <span className="text-gray-900">{selectedIntervention.month_completed}</span>
                  </div>
                  {selectedIntervention.volume_m3 && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Volume:</span>
                      <span className="text-gray-900">{selectedIntervention.volume_m3} m³</span>
                    </div>
                  )}
                  {selectedIntervention.length_m && selectedIntervention.breadth_m && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Dimensions:</span>
                      <span className="text-gray-900">{selectedIntervention.length_m}m × {selectedIntervention.breadth_m}m</span>
                    </div>
                  )}
                  {selectedIntervention.height_m && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Height:</span>
                      <span className="text-gray-900">{selectedIntervention.height_m}m</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Placeholder content */
              <div className="p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                <div className="text-center text-gray-600">
                  {/* <svg width="48" height="48" viewBox="0 0 24 24" className="mx-auto mb-2 opacity-30 text-gray-400">
                    <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                    <path fill="currentColor" d="M7 10h2v5H7zm4-3h2v8h-2zm4-1h2v9h-2z"/>
                  </svg>
                  <p className="text-sm font-medium text-gray-700">Intervention Data Panel</p> */}
                  <p className="text-sm text-gray-500 mt-1">Click on an intervention marker to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

CombinedLegendControls.propTypes = {
  layerVisibility: PropTypes.object.isRequired,
  setLayerVisibility: PropTypes.func.isRequired,
  interventionTypes: PropTypes.array,
  typeVisibility: PropTypes.object,
  setTypeVisibility: PropTypes.func,
  selectedIntervention: PropTypes.object,
  setSelectedIntervention: PropTypes.func
};


// Map Sidebar Component
const MapSidebar = ({ layerVisibility, setLayerVisibility, isExpanded, setIsExpanded, isMobile }) => {
  console.log('MapSidebar rendered - isMobile:', isMobile, 'isExpanded:', isExpanded);
  const layerItems = [
    {
      key: 'villageBoundary',
      label: 'Village Boundary',
      icon: (
        <span className="inline-block w-4 h-4 rounded-sm border-2 border-red-500" />
      )
    },
    {
      key: 'interventions',
      label: 'Interventions',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-purple-600">
          <rect x="2" y="2" width="5" height="5" fill="#8B5CF6" />
          <circle cx="12" cy="5" r="3" fill="#06B6D4" />
          <path d="M8 14 L12 10 L4 10 Z" fill="#F59E0B" />
        </svg>
      )
    },
    {
      key: 'wells',
      label: 'Wells',
      icon: (
        <img src={WaterWellIcon} alt="Wells" className="w-4 h-4" />
      )
    },
    {
      key: 'lulcMap',
      label: 'Land Use Land Cover',
      icon: (
        <Earth size={16} className="text-green-600" />
      )
    },
    {
      key: 'elevationMap',
      label: 'Slope Map',
      icon: (
        <Mountain size={16} className="text-green-600" />
      )
    }
  ];

  const toggleLayer = (key) => {
    setLayerVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isMobile) {
    // Mobile layout: horizontal bar above map (positioned outside MapContainer)
    return (
      <div className={`
        w-full bg-white bg-opacity-95 transition-all duration-300 rounded-lg border border-gray-500 mb-2 pt-2
        ${isExpanded ? 'h-auto' : 'h-12'}
      `}>
        {/* Expand/Collapse Arrow */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-11/12 flex items-center justify-center border border-gray-500 p-2 bg-white hover:bg-gray-100 transition-colors mx-auto"
          title={isExpanded ? "Collapse layer controls" : "Expand layer controls"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className={`text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path
              d="M8 6 L12 10 L4 10 Z"
              stroke="currentColor"
              strokeWidth="0"
              fill="black"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Layer Icons - Horizontal layout that wraps */}
        {isExpanded && (
          <div className="flex flex-wrap gap-2 p-3">
            {layerItems.map(item => (
              <button
                key={item.key}
                onClick={() => toggleLayer(item.key)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-50 border
                  ${layerVisibility[item.key] ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                `}
                title={`${item.label} - ${layerVisibility[item.key] ? 'Visible' : 'Hidden'}`}
              >
                {item.icon}
                <span className="text-sm text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout: vertical sidebar (outside map container)
  return (
    <div className={`
      bg-white bg-opacity-95 rounded-lg shadow-md border border-gray-500 transition-all duration-300 min-h-[400px]
      ${isExpanded
        ? 'w-48'
        : 'w-12'
      }
    `}>
      {/* Expand/Collapse Arrow */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-8 h-8 bg-white flex items-center justify-center  border border-gray-500 px-2 hover:bg-gray-100 transition-colors mt-2 mx-2"
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className={`text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
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
      <div className={`
        flex flex-col gap-2 mt-2 px-2
        ${isExpanded ? 'items-start' : 'items-center'}
      `}>
        {layerItems.map(item => (
          <button
            key={item.key}
            onClick={() => toggleLayer(item.key)}
            className={`
              flex items-center gap-2 p-2 rounded-md transition-all duration-200 hover:bg-gray-50
              ${layerVisibility[item.key] ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500 opacity-60'}
              ${isExpanded ? 'w-full justify-start' : 'w-8 h-8 justify-center'}
            `}
            title={`${item.label} - ${layerVisibility[item.key] ? 'Visible' : 'Hidden'}`}
          >
            {item.icon}
            {isExpanded && (
              <span className="text-sm text-gray-700 truncate">{item.label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};



const LandscapeView = ({ project }) => {
  // Validate imported data on component initialization
  console.log('LandscapeView: Imported interventions data:', interventionsJsonData?.length, 'items');
  if (interventionsJsonData && interventionsJsonData.length > 0) {
    console.log('LandscapeView: Sample imported intervention:', interventionsJsonData[0]);
  } else {
    console.error('LandscapeView: Failed to import interventions data!');
  }

  console.log('LandscapeView: Imported wells data:', wellsJsonData?.length, 'items');
  if (wellsJsonData && wellsJsonData.length > 0) {
    console.log('LandscapeView: Sample imported well:', wellsJsonData[0]);
  } else {
    console.error('LandscapeView: Failed to import wells data!');
  }

  const [layerVisibility, setLayerVisibility] = useState({
    villageBoundary: true,
    lulcMap: true,
    interventions: true,
    wells: true,
    elevationMap: false // Actually controls slope map visibility
  });

  const [boundaryData, setBoundaryData] = useState(null);
  const [lulcTilesUrl, setLulcTilesUrl] = useState(null);
  const [elevationTilesUrl, setElevationTilesUrl] = useState(null); // Actually stores slope tiles URL
  const [interventionsData, setInterventionsData] = useState(null);
  const [wellsData, setWellsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isElevationLoading, setIsElevationLoading] = useState(false); // Actually tracks slope loading state
  const [map, setMap] = useState(null);
  const [interventionTypes, setInterventionTypes] = useState([]);
  const [typeVisibility, setTypeVisibility] = useState({});
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false); // Default to desktop, will be updated on mount
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  // Handle responsive behavior
  useEffect(() => {
    // Set initial mobile state on mount
    const initialIsMobile = window.innerWidth < 768;
    setIsMobile(initialIsMobile);
    console.log('Initial mobile state:', initialIsMobile, 'width:', window.innerWidth);

    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      console.log('Window resized, isMobile:', newIsMobile, 'width:', window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug logging for sidebar state
  useEffect(() => {
    console.log('Sidebar state - isMobile:', isMobile, 'isExpanded:', isSidebarExpanded);
  }, [isMobile, isSidebarExpanded]);

  // Fixed location for demo: Gujarat, Valsad, Kaprada
  const stateName = 'Gujarat';
  const districtName = 'Valsad';
  const subdistrictName = 'Kaprada';

  // Default center coordinates for Kaprada, Valsad, Gujarat
  const defaultCenter = [20.3287, 73.1119];
  const defaultZoom = 13;

  // Function to calculate bounds for all interventions
  const getInterventionsBounds = (interventions) => {
    if (!interventions || interventions.length === 0) return null;

    const validInterventions = interventions.filter(int =>
      int.latitude && int.longitude &&
      !isNaN(int.latitude) && !isNaN(int.longitude)
    );

    if (validInterventions.length === 0) return null;

    const bounds = L.latLngBounds(
      validInterventions.map(int => [int.latitude, int.longitude])
    );

    return bounds;
  };

  // Create intervention-specific icons
  const createInterventionIcon = (type) => {
    let iconUrl;
      let iconSize = [20, 20];

    switch (type) {
        case 'gabion':
          iconUrl = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="16" height="8" fill="#8B5CF6" stroke="#6D28D9" stroke-width="1"/>
              <rect x="1" y="12" width="18" height="2" fill="#6D28D9"/>
            </svg>
          `);
          break;
        case 'gully-plug':
          iconUrl = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#10B981" stroke="#047857" stroke-width="1"/>
              <circle cx="10" cy="10" r="4" fill="#34D399" opacity="0.7"/>
            </svg>
          `);
          break;
        case 'check-dam':
          iconUrl = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="6" width="18" height="8" fill="#3B82F6" stroke="#1E40AF" stroke-width="1"/>
              <rect x="0" y="12" width="20" height="2" fill="#1E40AF"/>
            </svg>
          `);
          break;
        case 'earthen-dam':
          iconUrl = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="7" width="16" height="6" fill="#F59E0B" stroke="#D97706" stroke-width="1"/>
              <rect x="1" y="11" width="18" height="2" fill="#D97706"/>
            </svg>
          `);
          break;
        case 'farm-pond':
        iconUrl = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="8" width="14" height="6" fill="#06B6D4" stroke="#0891B2" stroke-width="1"/>
              <rect x="1" y="12" width="18" height="2" fill="#0891B2"/>
          </svg>
        `);
        break;
        case 'bunding':
        iconUrl = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12 Q10 8 18 12" stroke="#EF4444" stroke-width="2" fill="none"/>
              <path d="M2 14 Q10 10 18 14" stroke="#DC2626" stroke-width="1" fill="none"/>
          </svg>
        `);
        break;
        case 'CCT':
        iconUrl = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 10 Q10 6 18 10" stroke="#8B5CF6" stroke-width="2" fill="none"/>
              <path d="M2 12 Q10 8 18 12" stroke="#7C3AED" stroke-width="1" fill="none"/>
          </svg>
        `);
        break;
      default:
        iconUrl = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#6B7280" stroke="#374151" stroke-width="1"/>
          </svg>
        `);
    }

    return L.icon({
      iconUrl,
      iconSize,
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
  };

  // Monitor interventions data state changes
  useEffect(() => {
    console.log('Interventions data state changed:', interventionsData?.length, 'items');
    if (interventionsData && interventionsData.length > 0) {
      console.log('First intervention in state:', interventionsData[0]);
    }
  }, [interventionsData]);

  // Monitor wells data state changes
  useEffect(() => {
    console.log('Wells data state changed:', wellsData?.length, 'items');
    if (wellsData && wellsData.length > 0) {
      console.log('First well in state:', wellsData[0]);
    }
  }, [wellsData]);

  // Zoom to interventions and wells when data is loaded
  useEffect(() => {
    if (map && (interventionsData || wellsData)) {
      const allPoints = [];

      // Add intervention points
      if (interventionsData && interventionsData.length > 0) {
        const validInterventions = interventionsData.filter(int =>
          int.latitude && int.longitude &&
          !isNaN(int.latitude) && !isNaN(int.longitude)
        );
        allPoints.push(...validInterventions.map(int => [int.latitude, int.longitude]));
      }

      // Add well points
      if (wellsData && wellsData.length > 0) {
        const validWells = wellsData.filter(well =>
          well.latitude && well.longitude &&
          !isNaN(well.latitude) && !isNaN(well.longitude)
        );
        allPoints.push(...validWells.map(well => [well.latitude, well.longitude]));
      }

      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        if (bounds && bounds.isValid()) {
          console.log('Zooming to combined bounds with', allPoints.length, 'points');
          map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 });
        }
      }
    }
  }, [map, interventionsData, wellsData]);

  // Set interventions data immediately from imported JSON
  useEffect(() => {
    // Set interventions data immediately from imported JSON
    console.log('Setting interventions data:', interventionsJsonData?.length, 'items');

    if (interventionsJsonData && interventionsJsonData.length > 0) {
      console.log('First intervention sample:', interventionsJsonData[0]);
      setInterventionsData(interventionsJsonData);
      // derive unique types
      const types = Array.from(new Set(interventionsJsonData.map(d => d.intervention_type).filter(Boolean)));
      setInterventionTypes(types);
      // default all visible
      const vis = {};
      types.forEach(t => { vis[t] = true; });
      setTypeVisibility(vis);
    } else {
      console.error('No interventions data available, using fallback');
      // Fallback with sample data
      const fallbackData = [{
        "year": "2024-25",
        "intervention_type": "gabion",
        "intervention_id": "gabion-1",
        "quarter": "Q4",
        "block": "Kaprada",
        "village": "Varna",
        "status": "Complete",
        "month_completed": "May-25",
        "latitude": 20.3287086,
        "longitude": 73.1118511,
        "length_m": null,
        "breadth_m": null,
        "height_m": 0.96,
        "volume_m3": null,
        "no_fillings_estimate": null,
        "m3_estimate": null,
        "no_trees_planted": null,
        "hectares_micro_irr": null
      }];
      setInterventionsData(fallbackData);
      setInterventionTypes(['gabion']);
    }

    // Set wells data
    console.log('Setting wells data:', wellsJsonData?.length, 'items');
    if (wellsJsonData && wellsJsonData.length > 0) {
      console.log('First well sample:', wellsJsonData[0]);
      setWellsData(wellsJsonData);
    } else {
      console.error('No wells data available');
      setWellsData([]);
    }

    // Confirm data was set
    setTimeout(() => {
      console.log('Interventions data set, checking state...');
    }, 100);

    // Fetch boundary and LULC data for Gujarat, Valsad, Kaprada
    const fetchData = async () => {
      try {
        console.log('Fetching boundary data for:', { stateName, districtName, subdistrictName });

        // Fetch boundary data
        const boundaryResponse = await get_boundary_data(stateName, districtName, subdistrictName);
        console.log('Boundary response:', boundaryResponse);

        if (boundaryResponse && boundaryResponse.features && boundaryResponse.features.length > 0) {
          console.log('Setting boundary data with', boundaryResponse.features.length, 'features');
          setBoundaryData(boundaryResponse);
        } else {
          console.warn('No boundary data received or empty features array');
          setBoundaryData(null);
        }

        // Fetch LULC raster data
        console.log('Fetching LULC data');
        const lulcResponse = await get_lulc_raster(stateName, districtName, subdistrictName, '', '2023');
        console.log('LULC response:', lulcResponse);

        if (lulcResponse && lulcResponse.tiles_url) {
          console.log('Setting LULC tiles URL:', lulcResponse.tiles_url);
          setLulcTilesUrl(lulcResponse.tiles_url);
        } else {
          console.warn('No LULC data received');
          setLulcTilesUrl(null);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setBoundaryData(null);
        setLulcTilesUrl(null);
      setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch slope data when slope map is toggled on
  useEffect(() => {
    if (layerVisibility.elevationMap) {
      console.log('Fetching slope data');
      console.log('Setting slope loading state to true');
      setIsElevationLoading(true);
      const fetchElevationData = async () => {
        try {
          const elevationResponse = await get_srtm_raster(stateName, districtName, subdistrictName);
          console.log('Slope response:', elevationResponse);

          if (elevationResponse && elevationResponse.tiles_url) {
            console.log('Setting slope tiles URL:', elevationResponse.tiles_url);
            setElevationTilesUrl(elevationResponse.tiles_url);
          } else {
            console.warn('No slope data received');
            setElevationTilesUrl(null);
          }
        } catch (error) {
          console.error('Error fetching slope data:', error);
          setElevationTilesUrl(null);
        } finally {
          console.log('Setting slope loading state to false');
          setIsElevationLoading(false);
        }
      };

      fetchElevationData();
    } else {
      // Clear slope tiles when toggled off
      console.log('Slope map toggled off, clearing tiles and loading state');
      setElevationTilesUrl(null);
      setIsElevationLoading(false);
    }
  }, [layerVisibility.elevationMap, stateName, districtName, subdistrictName]);


  // Only render for demo project
  if (project?.project_id !== 'demo-project') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Landscape View Coming Soon
            </h2>
            <p className="text-gray-600">
              The landscape view is currently available only for demo projects.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-gray-800 min-h-screen ">
      {/* Desktop: map takes 2/3, controls 1/3; mobile: stacked */}
      <section className="mx-auto w-[98%] py-3 md:py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Map */}
        <div className="bg-white rounded-lg shadow-sm px-4 md:p-0 min-h-[420px] lg:col-span-2">

          {/* Mobile Sidebar - Above Map */}
          {isMobile && !isLoading && (
            <MapSidebar
              layerVisibility={layerVisibility}
              setLayerVisibility={setLayerVisibility}
              isExpanded={isSidebarExpanded}
              setIsExpanded={setIsSidebarExpanded}
              isMobile={isMobile}
            />
          )}

          {/* Map Container - Mobile */}
          {isMobile && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 h-[300px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Slope Loading Indicator - Mobile */}
                  {layerVisibility.elevationMap && isElevationLoading && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #3B82F6',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#374151' }}>
                        Loading slope...
                      </span>
                      <style>{`
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      `}</style>
                    </div>
                  )}

                  <MapContainer
                    center={defaultCenter}
                    zoom={defaultZoom}
                    className="w-full h-full border border-gray-500"
                    zoomControl={true}
                    ref={setMap}
                  >
                <TileLayer
                  attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                  subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                />

                {/* Village Boundary Layer */}
                {layerVisibility.villageBoundary && boundaryData && (
                  <GeoJSON
                    data={boundaryData}
                    style={{
                      color: '#FF4433',
                      weight: 2,
                      opacity: 0.8,
                      fillColor: '#FF4433',
                      fillOpacity: 0.1
                    }}
                  />
                )}

                {/* LULC Layer */}
                {layerVisibility.lulcMap && lulcTilesUrl && (
                  <TileLayer
                    url={lulcTilesUrl}
                    opacity={0.7}
                    attribution="LULC Data"
                  />
                )}

                {/* Slope Layer */}
                {layerVisibility.elevationMap && elevationTilesUrl && (
                  <TileLayer
                    url={elevationTilesUrl}
                    opacity={0.6}
                    attribution="Elevation Data (SRTM)"
                  />
                )}

                {/* Interventions Layer */}
                {layerVisibility.interventions && interventionsData && (() => {
                  const validInterventions = interventionsData.filter(intervention =>
                    intervention.latitude && intervention.longitude &&
                    !isNaN(intervention.latitude) && !isNaN(intervention.longitude) &&
                    (typeVisibility[intervention.intervention_type] ?? true)
                  );
                  console.log('Rendering', validInterventions.length, 'valid interventions out of', interventionsData.length, 'total');
                  return validInterventions.map((intervention) => (
                  <Marker
                    key={intervention.intervention_id}
                    position={[intervention.latitude, intervention.longitude]}
                    icon={createInterventionIcon(intervention.intervention_type)}
                    eventHandlers={{
                      click: () => setSelectedIntervention(intervention)
                    }}
                  />
                  ));
                })()}

                {/* Wells Layer */}
                {layerVisibility.wells && wellsData && (() => {
                  const validWells = wellsData.filter(well =>
                    well.latitude && well.longitude &&
                    !isNaN(well.latitude) && !isNaN(well.longitude)
                  );
                  console.log('Rendering', validWells.length, 'valid wells out of', wellsData.length, 'total');
                  return validWells.map((well) => (
                  <Marker
                    key={well.well_id}
                    position={[well.latitude, well.longitude]}
                    icon={L.divIcon({
                      className: 'custom-well-marker',
                      html: `<div style="background-color: #3B82F6; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
                      iconSize: [10, 10],
                      iconAnchor: [5, 5]
                    })}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm">{well.well_id}</h3>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p><strong>Village:</strong> {well.village}</p>
                          <p><strong>CRP:</strong> {well.name_of_crp}</p>
                          <p><strong>Depth:</strong> {well.total_well_depth_m}m</p>
                          <p><strong>Water Level:</strong> {well.water_level_m}m</p>
                          <p><strong>Water Use:</strong> {well.water_use}</p>
                          <p><strong>Owner:</strong> {well.owner_operator}</p>
                          {well.springs_visible && <p><strong>Springs:</strong> {well.springs_visible}</p>}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  ));
                })()}
              </MapContainer>
              </>
            )}
            </div>
          )}

          {/* Desktop Layout with Sidebar */}
          {!isMobile && (
            <div className="flex gap-4">
              {console.log('Desktop layout rendered')}
              {/* Desktop Sidebar - Outside Map */}
              <MapSidebar
                layerVisibility={layerVisibility}
                setLayerVisibility={setLayerVisibility}
                isExpanded={isSidebarExpanded}
                setIsExpanded={setIsSidebarExpanded}
                isMobile={isMobile}
              />

              {/* Map Container */}
              <div className="flex-1 relative rounded-lg overflow-hidden border border-gray-200 h-[350px] md:h-[400px]">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Slope Loading Indicator */}
                    {layerVisibility.elevationMap && isElevationLoading && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 1000,
                          background: 'rgba(255, 255, 255, 0.9)',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #3B82F6',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}
                        />
                        <span style={{ fontSize: '12px', color: '#374151' }}>
                          Loading slope...
                        </span>
                        <style>{`
                          @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                        `}</style>
                      </div>
                    )}

                    <MapContainer
                      center={defaultCenter}
                      zoom={defaultZoom}
                      className="w-full h-full border border-gray-500"
                      zoomControl={true}
                      ref={setMap}
                    >
                    <TileLayer
                      attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                      subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    />

                    {/* Village Boundary Layer */}
                    {layerVisibility.villageBoundary && boundaryData && (
                      <GeoJSON
                        data={boundaryData}
                        style={{
                          color: '#FF4433',
                          weight: 2,
                          opacity: 0.8,
                          fillColor: '#FF4433',
                          fillOpacity: 0.1
                        }}
                      />
                    )}

                    {/* LULC Layer */}
                    {layerVisibility.lulcMap && lulcTilesUrl && (
                      <TileLayer
                        url={lulcTilesUrl}
                        opacity={0.7}
                        attribution="LULC Data"
                      />
                    )}

                    {/* Slope Layer */}
                    {layerVisibility.elevationMap && elevationTilesUrl && (
                      <TileLayer
                        url={elevationTilesUrl}
                        opacity={0.6}
                        attribution="Slope Data (SRTM)"
                      />
                    )}

                  {/* Interventions Layer */}
                  {layerVisibility.interventions && interventionsData && (() => {
                    const validInterventions = interventionsData.filter(intervention =>
                      intervention.latitude && intervention.longitude &&
                      !isNaN(intervention.latitude) && !isNaN(intervention.longitude) &&
                      (typeVisibility[intervention.intervention_type] ?? true)
                    );
                    console.log('Rendering', validInterventions.length, 'valid interventions out of', interventionsData.length, 'total');
                    return validInterventions.map((intervention) => (
                    <Marker
                      key={intervention.intervention_id}
                      position={[intervention.latitude, intervention.longitude]}
                      icon={createInterventionIcon(intervention.intervention_type)}
                      eventHandlers={{
                        click: () => setSelectedIntervention(intervention)
                      }}
                    />
                    ));
                  })()}

                  {/* Wells Layer */}
                  {layerVisibility.wells && wellsData && (() => {
                    const validWells = wellsData.filter(well =>
                      well.latitude && well.longitude &&
                      !isNaN(well.latitude) && !isNaN(well.longitude)
                    );
                    console.log('Rendering', validWells.length, 'valid wells out of', wellsData.length, 'total');
                    return validWells.map((well) => (
                    <Marker
                      key={well.well_id}
                      position={[well.latitude, well.longitude]}
                      icon={L.divIcon({
                        className: 'custom-well-marker',
                        html: `<div style="background-color: #3B82F6; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
                        iconSize: [10, 10],
                        iconAnchor: [5, 5]
                      })}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-sm">{well.well_id}</h3>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p><strong>Village:</strong> {well.village}</p>
                            <p><strong>CRP:</strong> {well.name_of_crp}</p>
                            <p><strong>Depth:</strong> {well.total_well_depth_m}m</p>
                            <p><strong>Water Level:</strong> {well.water_level_m}m</p>
                            <p><strong>Water Use:</strong> {well.water_use}</p>
                            <p><strong>Owner:</strong> {well.owner_operator}</p>
                            {well.springs_visible && <p><strong>Springs:</strong> {well.springs_visible}</p>}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                    ));
                  })()}
                  </MapContainer>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Controls */}
        {/* Combined Legend + Layer Controls */}
        <CombinedLegendControls
              layerVisibility={layerVisibility}
              setLayerVisibility={setLayerVisibility}
              interventionTypes={interventionTypes}
              typeVisibility={typeVisibility}
              setTypeVisibility={setTypeVisibility}
              selectedIntervention={selectedIntervention}
              setSelectedIntervention={setSelectedIntervention}
            />
      </section>

    </div>
  );
};

LandscapeView.propTypes = {
  project: PropTypes.shape({
    project_id: PropTypes.string,
    name: PropTypes.string,
    village: PropTypes.string,
    district: PropTypes.string,
    state: PropTypes.string
  })
};


export default LandscapeView;
