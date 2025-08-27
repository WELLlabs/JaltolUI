import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import { get_boundary_data } from '../services/api';
import PropTypes from 'prop-types';
import L from 'leaflet';
import Spinner from './Spinner';
import 'leaflet/dist/leaflet.css';

// Minimal tooltip style for village labels
const villageLabelCSS = `
  .village-label-simple.leaflet-tooltip {
    background: transparent !important;
    border: none !important;
    // box-shadow: none !important;
    color: #FF4433 !important; /* match boundary orange */
    font-weight: 700 !important;
    text-shadow: 0 0 3px rgba(0,0,0,1) !important;
    padding: 0 !important;
  }
`;

// No in-map legend for simplified V2 VillageMap

// No shared-link zoom lock for simplified V2 VillageMap

function FlyToFeature({ featureData, onFlyToComplete }) {
  const map = useMap();
  const [hasZoomed, setHasZoomed] = useState(false);

  useEffect(() => {
    if (featureData) {
      setHasZoomed(false);
    }
  }, [featureData]);

  useEffect(() => {
    if (hasZoomed || !featureData || !map) return;

    try {
      const geoJsonLayer = L.geoJSON(featureData);
      const bounds = geoJsonLayer.getBounds();
      if (!bounds.isValid()) {
        onFlyToComplete();
        return;
      }

      map.flyToBounds(bounds, { padding: [10, 10] });
      setHasZoomed(true);
      map.once('moveend', () => {
        onFlyToComplete();
      });
    } catch (e) {
      onFlyToComplete();
    }
  }, [featureData, map, onFlyToComplete, hasZoomed]);

  return null;
}

FlyToFeature.propTypes = {
  featureData: PropTypes.object,
  onFlyToComplete: PropTypes.func,
};

const VillageMap = ({ selectedState, selectedDistrict, selectedSubdistrict, selectedVillage, scrollRef, villageMapRef, isAuthenticated }) => {
  const position = [22.3511148, 78.6677428];
  const zoom = 5;

  const [boundaryData, setBoundaryData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [boundaryLoaded, setBoundaryLoaded] = useState(false);
  const [flyToComplete, setFlyToComplete] = useState(false);
  const mapRef = useRef(null);
  

  // Update external ref when internal ref changes
  useEffect(() => {
    if (villageMapRef && mapRef.current) {
      villageMapRef.current = mapRef.current;
      console.log('VillageMap: External ref updated via useEffect');
    }
  }, [villageMapRef, mapRef.current]);

  // Inject simple tooltip CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = villageLabelCSS;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // No year change, download, or multi-year visualization in simplified V2 VillageMap

  // Update the useEffect where boundary data is fetched
  useEffect(() => {
    setLoading(true);
    setBoundaryLoaded(false);
    setFlyToComplete(false);

    console.log("Selection changed, fetching new data:", {
      state: selectedState,
      district: selectedDistrict?.label,
      subdistrict: selectedSubdistrict?.label,
      village: selectedVillage?.label
    });

    // Only proceed when subdistrict is selected (improves performance)
    if (selectedState && selectedDistrict && selectedSubdistrict) {
        const districtName = selectedDistrict.label;
        const subdistrictValue = selectedSubdistrict?.label || null;
        const villageValue = selectedVillage?.label || null;

        // Extract village ID if present in the format "name - id"
        let villageId = null;
        let villageName = villageValue;

        if (villageValue && villageValue.includes(' - ')) {
          const parts = villageValue.split(' - ');
          villageName = parts[0];
          villageId = parts[1];
        }

        // Also check if the village object has a value property that might contain the ID
        if (!villageId && selectedVillage?.value) {
          villageId = selectedVillage.value;
        }

        console.log('Fetching boundary with:', {
          state: selectedState,
          district: districtName,
          subdistrict: subdistrictValue,
          villageName: villageName,
          villageId: villageId
        });

        // Store the exact parameters for boundary
        const apiParams = {
          state: selectedState,
          district: districtName,
          subdistrict: subdistrictValue,
          village: villageValue,
          villageId: villageId,
          villageName: villageName
        };

        console.log('API parameters for boundary:', apiParams);

        // Fetch boundary data with village ID when available
        get_boundary_data(selectedState, districtName, subdistrictValue, villageValue, villageId)
          .then(data => {
            if (data && data.features && data.features.length > 0) {
              console.log(`Received boundary data with ${data.features.length} features`);

              if (selectedSubdistrict && selectedVillage) {
                // Still match by name for UI purposes
                const villageNameToMatch = villageName || villageValue;
                const villageFeature = data.features.find(
                  feature => feature.properties.village_na.toLowerCase().trim() === villageNameToMatch.toLowerCase().trim()
                );

                if (villageFeature) {
                  console.log("Found matching village feature:", villageFeature.properties.village_na);
                  console.log("Village feature coordinates:", villageFeature.geometry);
                  setBoundaryData({ ...data, features: [villageFeature] });
                } else {
                  console.warn("No matching village feature found for:", villageNameToMatch);
                  console.warn("Available villages:", data.features.map(f => f.properties.village_na));
                  setBoundaryData(null);
                }
              } else {
                console.log("Setting all boundary features");
                setBoundaryData(data);
              }
            } else {
              console.warn("Received empty or invalid boundary data");
              setBoundaryData(null);
            }

            setBoundaryLoaded(true);
          })
          .catch(error => {
            console.error('Error fetching the GeoJSON data:', error);
            setBoundaryData(null);
            setBoundaryLoaded(true);
          });
    } else {
      console.log("Waiting for subdistrict selection; clearing map data");
      setBoundaryData(null);
      setLoading(false);
    }
  }, [selectedState, selectedDistrict, selectedSubdistrict, selectedVillage]);

  useEffect(() => {
    if (boundaryLoaded && flyToComplete) {
      setLoading(false);
    }
  }, [boundaryLoaded, flyToComplete]);

  const highlightStyle = {
    color: '#ff7800',
    weight: 5,
    opacity: 1,
    fillOpacity: 0.1
  };

  const normalStyle = {
    color: '#4a83ec',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.1
  };

  const onEachFeature = (feature, layer) => {
    const villageName = selectedVillage?.label || selectedVillage;
    // Extract base village name without ID if it's in the format "name - id"
    let selectedVillageName = villageName;
    if (selectedVillageName && selectedVillageName.includes(' - ')) {
      selectedVillageName = selectedVillageName.split(' - ')[0];
    }

    if (feature.properties.village_na &&
        feature.properties.village_na.toLowerCase().trim() === (selectedVillageName || '').toLowerCase().trim()) {
      layer.setStyle(highlightStyle);
    } else {
      layer.setStyle(normalStyle);
    }

    // Add village name labels when a subdistrict is selected
    if (selectedSubdistrict && feature.properties && feature.properties.village_na) {
      layer.bindTooltip(String(feature.properties.village_na), {
        permanent: true,
        direction: 'center',
        className: 'village-label-simple',
        opacity: 0.9
      });
    }
  };

  // No shared-link forced zoom in simplified V2 VillageMap

  return (
    <div className="relative h-full w-full bg-blue-100 rounded-lg min-h-[500px]">
      {isLoading && <Spinner />}
      {!selectedDistrict && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
                      bg-white bg-opacity-90 p-5 rounded-lg shadow-lg text-center">
          <p className="text-lg font-bold text-gray-800">Please select a subdistrict to view the map</p>
        </div>
      )}
      {/* No year selection in simplified V2 VillageMap */}
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        whenCreated={(map) => {
          mapRef.current = map;
          console.log('Map instance created:', map);

          // Update external ref immediately when map is created
          if (villageMapRef) {
            villageMapRef.current = map;
            console.log('VillageMap: External ref updated via whenCreated');
          }
        }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Google Maps">
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Satellite">
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution='&copy; <a href="https://www.google.com/maps">Google Satellite</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Terrain">
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              attribution='&copy; <a href="https://www.google.com/maps">Google Terrain</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked name="Google Satellite Hybrid">
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              attribution='&copy; <a href="https://www.google.com/maps">Google Satellite Hybrid</a> contributors'
            />
          </LayersControl.BaseLayer>

          {/* No LULC layer in simplified V2 VillageMap */}

          {boundaryData && (
            <LayersControl.Overlay checked name="Village Boundaries">
              <GeoJSON
                key={JSON.stringify(boundaryData)}
                data={boundaryData}
                style={{
                  color: '#FF4433',
                  weight: 1,
                  fillColor: '#1a1d62',
                  fillOpacity: 0.1,
                }}
                onEachFeature={onEachFeature}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
        {boundaryData && (
          <FlyToFeature
            featureData={boundaryData}
            onFlyToComplete={() => setFlyToComplete(true)}
          />
        )}

        {/* No shared-link zoom lock in simplified V2 VillageMap */}

      </MapContainer>

      {/* No MultiYearMaps in simplified V2 VillageMap */}
    </div>
  );
};

VillageMap.propTypes = {
  selectedState: PropTypes.string,
  selectedDistrict: PropTypes.object,
  selectedSubdistrict: PropTypes.object,
  selectedVillage: PropTypes.object,
  scrollRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  villageMapRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  isAuthenticated: PropTypes.bool,
};

export default VillageMap;
