import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Mountain, Earth } from 'lucide-react';
import L from 'leaflet';
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to fit map bounds to data
const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};

// Map Sidebar Component (simplified version of LandscapeView's MapSidebar)
const MapSidebar = ({ layerVisibility, setLayerVisibility, isExpanded, setIsExpanded, basemapType, setBasemapType, hasData }) => {
  const layerItems = [
    {
      key: 'basemapToggle',
      label: basemapType === 'satellite' ? 'Terrain' : 'Satellite',
      available: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-green-600">
          <rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1"/>
          <rect x="3" y="3" width="4" height="4" fill="currentColor" opacity="0.8"/>
          <rect x="9" y="3" width="4" height="4" fill="currentColor" opacity="0.6"/>
          <rect x="3" y="9" width="4" height="4" fill="currentColor" opacity="0.4"/>
          <rect x="9" y="9" width="4" height="4" fill="currentColor" opacity="0.2"/>
        </svg>
      )
    },
    {
      key: 'markers',
      label: 'Data Points',
      available: hasData,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-blue-600">
          <circle cx="8" cy="6" r="4" fill="currentColor"/>
          <path d="M8 10 L8 14" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      key: 'villageBoundary',
      label: 'Village Boundary',
      available: false,
      icon: (
        <span className="inline-block w-4 h-4 rounded-sm border-2 border-red-500" />
      )
    },
    {
      key: 'watershedBoundary',
      label: 'Watershed Boundary',
      available: false,
      icon: (
        <span className="inline-block w-4 h-4 rounded-sm border-2 border-black border-dashed" />
      )
    },
    {
      key: 'drainageLines',
      label: 'Drainage Lines',
      available: false,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-blue-600">
          <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4,2" />
        </svg>
      )
    },
    {
      key: 'lulcMap',
      label: 'Land Use Land Cover',
      available: false,
      icon: (
        <Earth size={16} className="text-green-600" />
      )
    },
    {
      key: 'elevationMap',
      label: 'Slope Map',
      available: false,
      icon: (
        <Mountain size={16} className="text-green-600" />
      )
    }
  ];

  const toggleLayer = (key, available) => {
    if (!available && key !== 'basemapToggle') return;
    
    if (key === 'basemapToggle') {
      setBasemapType(prev => prev === 'satellite' ? 'terrain' : 'satellite');
    } else {
      setLayerVisibility(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <div className={`
      bg-white bg-opacity-95 rounded-lg shadow-md border border-gray-500 transition-all duration-300 min-h-[400px]
      ${isExpanded ? 'w-48' : 'w-12'}
    `}>
      {/* Expand/Collapse Arrow */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-8 h-8 bg-white flex items-center justify-center border border-gray-500 px-2 hover:bg-gray-100 transition-colors mt-2 mx-2"
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
            onClick={() => toggleLayer(item.key, item.available)}
            disabled={!item.available && item.key !== 'basemapToggle'}
            className={`
              flex items-center gap-2 p-2 rounded-md transition-all duration-200
              ${item.available || item.key === 'basemapToggle'
                ? (layerVisibility[item.key] 
                    ? 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50' 
                    : 'bg-gray-50 border-gray-200 text-gray-500 opacity-60 hover:bg-gray-100')
                : 'bg-gray-100 border-gray-200 text-gray-400 opacity-40 cursor-not-allowed'
              }
              ${isExpanded ? 'w-full justify-start' : 'w-8 h-8 justify-center'}
            `}
            title={item.available || item.key === 'basemapToggle' 
              ? `${item.label} - ${layerVisibility[item.key] ? 'Visible' : 'Hidden'}`
              : `${item.label} - Not available (requires external data)`
            }
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

MapSidebar.propTypes = {
  layerVisibility: PropTypes.object.isRequired,
  setLayerVisibility: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  setIsExpanded: PropTypes.func.isRequired,
  basemapType: PropTypes.string.isRequired,
  setBasemapType: PropTypes.func.isRequired,
  hasData: PropTypes.bool.isRequired
};

// Details Panel Component (for showing selected marker info)
const DetailsPanel = ({ selectedItem, onClose, idField, dateField, columnTypes }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!selectedItem) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between border border-gray-500 bg-white hover:bg-gray-50 transition-colors rounded px-2 py-1"
        >
          <h3 className="text-lg font-semibold text-gray-800">Details</h3>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className={`text-gray-600 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
          >
            <path d="M8 6 L12 10 L4 10 Z" stroke="currentColor" strokeWidth="0" fill="black" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {!isCollapsed && (
          <div className="p-4 bg-gray-50 min-h-[150px] flex items-center justify-center mt-2">
            <p className="text-sm text-gray-500">Click on a marker to view details</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between border border-gray-500 bg-white hover:bg-gray-50 transition-colors rounded px-2 py-1"
      >
        <h3 className="text-lg font-semibold text-gray-800">Details</h3>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className={`text-gray-600 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
        >
          <path d="M8 6 L12 10 L4 10 Z" stroke="currentColor" strokeWidth="0" fill="black" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      
      {!isCollapsed && (
        <div className="mt-2">
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="bg-white p-1 rounded hover:bg-gray-100 transition-colors"
              title="Clear selection"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          
          <div className="space-y-2 text-sm max-h-[300px] overflow-y-auto">
            {Object.entries(selectedItem).map(([key, value]) => {
              if (value === null || value === undefined || value === '') return null;
              return (
                <div key={key} className="flex justify-between gap-2">
                  <span className="font-medium text-gray-600 truncate">{key}:</span>
                  <span className="text-gray-900 text-right">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

DetailsPanel.propTypes = {
  selectedItem: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  idField: PropTypes.string,
  dateField: PropTypes.string,
  columnTypes: PropTypes.object
};

// Main SnapshotView Component
const SnapshotView = ({ data, idField, latField, lngField, dateField, csvData, columnTypes, selectedValue }) => {
  const [layerVisibility, setLayerVisibility] = useState({
    markers: true,
    villageBoundary: false,
    watershedBoundary: false,
    drainageLines: false,
    lulcMap: false,
    elevationMap: false
  });
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [basemapType, setBasemapType] = useState('terrain');

  // Parse data points from CSV data
  const dataPoints = useMemo(() => {
    if (!data || !latField || !lngField) return [];
    
    return data
      .map((row, index) => {
        const lat = parseFloat(row[latField]);
        const lng = parseFloat(row[lngField]);
        
        if (isNaN(lat) || isNaN(lng)) return null;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
        
        return {
          id: idField ? row[idField] : `point-${index}`,
          lat,
          lng,
          data: row
        };
      })
      .filter(Boolean);
  }, [data, latField, lngField, idField]);

  // Calculate bounds for the map
  const bounds = useMemo(() => {
    if (dataPoints.length === 0) return null;
    
    const latLngs = dataPoints.map(p => [p.lat, p.lng]);
    return L.latLngBounds(latLngs);
  }, [dataPoints]);

  // Default center if no data
  const defaultCenter = [20.5937, 78.9629]; // India center
  const defaultZoom = 5;

  const handleMarkerClick = (item) => {
    setSelectedItem(item.data);
  };

  const hasData = dataPoints.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-100 min-h-[600px]">
      {/* Sidebar */}
      <div className="lg:order-1">
        <MapSidebar
          layerVisibility={layerVisibility}
          setLayerVisibility={setLayerVisibility}
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
          basemapType={basemapType}
          setBasemapType={setBasemapType}
          hasData={hasData}
        />
      </div>

      {/* Map Container */}
      <div className="flex-1 lg:order-2 min-h-[400px] lg:min-h-[600px] rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          className="h-full w-full"
          style={{ minHeight: '400px' }}
        >
          {/* Basemap */}
          {basemapType === 'satellite' ? (
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {/* Fit bounds to data */}
          {bounds && <FitBounds bounds={bounds} />}

          {/* Data point markers */}
          {layerVisibility.markers && dataPoints.map((point, index) => (
            <Marker
              key={point.id || index}
              position={[point.lat, point.lng]}
              eventHandlers={{
                click: () => handleMarkerClick(point)
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{idField ? point.data[idField] : `Point ${index + 1}`}</strong>
                  {dateField && point.data[dateField] && (
                    <div className="text-gray-600">{point.data[dateField]}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Details Panel */}
      <div className="lg:order-3 lg:w-80">
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Viewing:</span> {selectedValue}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {dataPoints.length} data points loaded
            </p>
          </div>
        </div>
        
        <DetailsPanel
          selectedItem={selectedItem}
          onClose={() => setSelectedItem(null)}
          idField={idField}
          dateField={dateField}
          columnTypes={columnTypes}
        />
      </div>
    </div>
  );
};

SnapshotView.propTypes = {
  data: PropTypes.array.isRequired,
  idField: PropTypes.string,
  latField: PropTypes.string.isRequired,
  lngField: PropTypes.string.isRequired,
  dateField: PropTypes.string,
  csvData: PropTypes.object,
  columnTypes: PropTypes.object,
  selectedValue: PropTypes.string
};

export default SnapshotView;
