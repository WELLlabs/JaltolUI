import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';
import { get_boundary_data, get_lulc_raster } from '../services/api';
import interventionsJsonData from '../assets/vapi-interventions-y1.json';
import wellsJsonData from '../assets/vapi-wells-y1.json';

// Combined Legend + Layer toggles (inspired by ImpactAssessment V2)
const CombinedLegendControls = ({ layerVisibility, setLayerVisibility, interventionTypes, typeVisibility, setTypeVisibility }) => {
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
      key: 'lulcMap',
      label: 'Land Use Land Cover',
      // filled box for raster
      icon: (
        <span className="inline-block w-4 h-4 rounded-sm" style={{ backgroundColor: '#8b9dc3' }} />
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
    }
  ];

  const lulcLegend = [
    { color: '#397d49', label: 'Tree Cover' },
    { color: '#8b9dc3', label: 'Single Crop' },
    { color: '#222f5b', label: 'Double Crop' },
    { color: '#946b2d', label: 'Shrubs' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Legend & Layers</h3>
      </div>

      {/* Primary layer toggles */}
      <div className="flex flex-wrap gap-3">
        {primaryItems.map(item => (
          <button
            key={item.key}
            type="button"
            aria-pressed={layerVisibility[item.key]}
            onClick={() => toggle(item.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition select-none focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              layerVisibility[item.key]
                ? 'bg-white border-gray-300 text-gray-800'
                : 'bg-gray-50 border-gray-200 text-gray-500 opacity-60'
            }`}
            title={`Toggle ${item.label}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* LULC legend (static swatches) */}
      <div className="mt-4 border-t border-gray-200 pt-3">
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
        <div className="mt-4 border-t border-gray-200 pt-3">
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
    wells: true
  });

  const [boundaryData, setBoundaryData] = useState(null);
  const [lulcTilesUrl, setLulcTilesUrl] = useState(null);
  const [interventionsData, setInterventionsData] = useState(null);
  const [wellsData, setWellsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [interventionTypes, setInterventionTypes] = useState([]);
  const [typeVisibility, setTypeVisibility] = useState({});

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

  // Monitor interventions and wells data state changes
  useEffect(() => {
    console.log('Interventions data state changed:', interventionsData?.length, 'items');
    if (interventionsData && interventionsData.length > 0) {
      console.log('First intervention in state:', interventionsData[0]);
    }
  }, [interventionsData]);

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
    <div className="bg-surface text-gray-800 min-h-screen">
      {/* Desktop: map takes 2/3, controls 1/3; mobile: stacked */}
      <section className="mx-auto w-[95%] py-3 md:py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Map */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-4 min-h-[420px] border border-gray-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">Landscape View</h1>
            <p className="text-gray-600 text-sm">Interactive Map</p>
          </div>

          {/* Map Container */}
          <div className="relative h-[350px] md:h-[400px] rounded-lg overflow-hidden border border-gray-200">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className="w-full h-full"
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
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm">{intervention.intervention_id}</h3>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p><strong>Type:</strong> {intervention.intervention_type.replace('_', ' ').toUpperCase()}</p>
                          <p><strong>Village:</strong> {intervention.village}</p>
                          <p><strong>Status:</strong> {intervention.status}</p>
                          <p><strong>Completed:</strong> {intervention.month_completed}</p>
                          {intervention.volume_m3 && <p><strong>Volume:</strong> {intervention.volume_m3} m³</p>}
                          {intervention.length_m && <p><strong>Dimensions:</strong> {intervention.length_m}m × {intervention.breadth_m}m</p>}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
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
            )}
          </div>
        </div>

        {/* Right Column - Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-4 min-h-[420px] border border-gray-200 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Map Controls</h2>
            <p className="text-gray-600 text-sm">Layer Management</p>
          </div>

          {/* Combined Legend + Layer Controls */}
          <div className="mb-6">
            <CombinedLegendControls
              layerVisibility={layerVisibility}
              setLayerVisibility={setLayerVisibility}
              interventionTypes={interventionTypes}
              typeVisibility={typeVisibility}
              setTypeVisibility={setTypeVisibility}
            />
          </div>
        </div>
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

CombinedLegendControls.propTypes = {
  layerVisibility: PropTypes.object.isRequired,
  setLayerVisibility: PropTypes.func.isRequired,
  interventionTypes: PropTypes.array,
  typeVisibility: PropTypes.object,
  setTypeVisibility: PropTypes.func
};


export default LandscapeView;
