import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import { get_boundary_data, get_lulc_raster } from '../services/api';
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



// No shared-link zoom lock for simplified V2 VillageMap

function FlyToFeature({ featureData, onFlyToComplete, shouldZoomToDistrict = false }) {
  const map = useMap();
  const [hasZoomed, setHasZoomed] = useState(false);

  useEffect(() => {
    if (featureData) {
      setHasZoomed(false);
    }
  }, [featureData]);

  useEffect(() => {
    if (hasZoomed || !featureData || !map) return;

    // Only zoom when shouldZoomToDistrict is true (new district loaded)
    if (!shouldZoomToDistrict) {
      console.log("FlyToFeature: Skipping zoom (preserving current zoom level)");
      onFlyToComplete();
      return;
    }

    try {
      // Zoom to district bounds when a new district is loaded
      const geoJsonLayer = L.geoJSON(featureData);
      const bounds = geoJsonLayer.getBounds();

      if (!bounds.isValid()) {
        console.error("Invalid bounds generated from feature data");
        onFlyToComplete();
        return;
      }

      console.log("FlyToFeature: Zooming to district bounds:", bounds);

      // Zoom to district bounds with padding
      map.flyToBounds(bounds, {
        padding: [50, 50],
        animate: true,
        duration: 1.0
      });

      setHasZoomed(true);
      map.once('moveend', () => {
        onFlyToComplete();
      });
    } catch (e) {
      onFlyToComplete();
    }
  }, [featureData, map, onFlyToComplete, hasZoomed, shouldZoomToDistrict]);

  return null;
}

FlyToFeature.propTypes = {
  featureData: PropTypes.object,
  onFlyToComplete: PropTypes.func,
  shouldZoomToDistrict: PropTypes.bool,
};

const VillageMap = ({ selectedState, selectedDistrict, selectedSubdistrict, selectedVillage, scrollRef, villageMapRef, isAuthenticated, showLulc = true, lulcOpacity = 0.7, selectedLulcYear = '2023', onYearLoadingChange }) => {
  const position = [22.3511148, 78.6677428];
  const zoom = 5;

  const [boundaryData, setBoundaryData] = useState(null);
  const [lulcTilesUrl, setLulcTilesUrl] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [boundaryLoaded, setBoundaryLoaded] = useState(false);
  const [rasterLoaded, setRasterLoaded] = useState(false);
  const [flyToComplete, setFlyToComplete] = useState(false);
  const [shouldZoomToVillage, setShouldZoomToVillage] = useState(false);
  const [subdistrictBounds, setSubdistrictBounds] = useState(null);
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

  // Track district changes vs year changes to control zoom behavior
  const [lastDistrict, setLastDistrict] = useState(null);
  const [lastState, setLastState] = useState(null);
  const [shouldZoomToDistrict, setShouldZoomToDistrict] = useState(false);
  const [isYearLoading, setIsYearLoading] = useState(false);

  // Notify parent of year loading state changes
  useEffect(() => {
    if (onYearLoadingChange) {
      onYearLoadingChange(isYearLoading);
    }
  }, [isYearLoading, onYearLoadingChange]);

  // Fetch district-level data once, then filter/zoom based on selections
  useEffect(() => {
    const districtChanged = lastDistrict !== selectedDistrict?.value;
    const stateChanged = lastState !== selectedState;
    const isYearChangeOnly = !districtChanged && !stateChanged && selectedDistrict && selectedState;

    // Update tracking variables
    setLastDistrict(selectedDistrict?.value);
    setLastState(selectedState);

    if (isYearChangeOnly) {
      // Only year changed - just update LULC raster without resetting zoom or boundaries
      console.log('Year change detected - updating LULC only:', selectedLulcYear);
      setIsYearLoading(true); // Show loading spinner

      if (selectedState && selectedDistrict) {
        const districtName = selectedDistrict.label;

        get_lulc_raster(selectedState, districtName, null, null, selectedLulcYear)
          .then(data => {
            console.log('Year change - received LULC raster data:', data.tiles_url ? "has URL" : "no URL");
            if (data.tiles_url) {
              console.log('Year change - LULC URL:', data.tiles_url);
              setLulcTilesUrl(data.tiles_url);
            } else {
              setLulcTilesUrl(null);
            }
            setRasterLoaded(true);
            setIsYearLoading(false); // Hide loading spinner
          })
          .catch(error => {
            console.error('Year change - error fetching LULC raster data:', error);
            setLulcTilesUrl(null);
            setRasterLoaded(true);
            setIsYearLoading(false); // Hide loading spinner
          });
      } else {
        setIsYearLoading(false); // Hide loading spinner if no valid selection
      }
      return; // Don't do full reload for year changes
    }

    // Full reload for district/state changes
    setLoading(true);
    setBoundaryLoaded(false);
    setRasterLoaded(false);
    setFlyToComplete(false);
    setShouldZoomToVillage(false);

    // Set zoom flag for new district loads (but not for year changes)
    setShouldZoomToDistrict(true);

    console.log('Full reload - selection changed:', {
      state: selectedState,
      district: selectedDistrict?.label,
      subdistrict: selectedSubdistrict?.label,
      village: selectedVillage?.label,
      reason: districtChanged ? 'district changed' : stateChanged ? 'state changed' : 'initial load'
    });

    // Only proceed when district is selected - always fetch district-level data
    if (selectedState && selectedDistrict) {
        const districtName = selectedDistrict.label;

        console.log('Fetching district-level data for:', {
          state: selectedState,
          district: districtName
        });

        // Fetch district-level boundary data (all villages in district)
        get_boundary_data(selectedState, districtName, null, null, null)
          .then(data => {
            if (data && data.features && data.features.length > 0) {
              console.log(`Received district boundary data with ${data.features.length} features`);

              // Store district bounds for zooming context
              if (data.features.length > 0) {
                const geoJsonLayer = L.geoJSON(data);
                const bounds = geoJsonLayer.getBounds();
                setSubdistrictBounds(bounds);
              }

              // Always show all district polygons - filtering happens in onEachFeature based on selection
              setBoundaryData(data);
            } else {
              console.warn('Received empty or invalid boundary data');
              setBoundaryData(null);
            }

            setBoundaryLoaded(true);
          })
          .catch(error => {
            console.error('Error fetching district boundary data:', error);
            setBoundaryData(null);
            setBoundaryLoaded(true);
          });

        // Fetch district-level LULC raster
        console.log('Fetching district-level LULC raster');

        get_lulc_raster(selectedState, districtName, null, null, selectedLulcYear)
          .then(data => {
            console.log('Received LULC raster data:', data.tiles_url ? "has URL" : "no URL");
            if (data.tiles_url) {
              console.log('LULC URL:', data.tiles_url);
              setLulcTilesUrl(data.tiles_url);
            } else {
              setLulcTilesUrl(null);
            }
            setRasterLoaded(true);
          })
          .catch(error => {
            console.error('Error fetching LULC raster data:', error);
            setLulcTilesUrl(null);
            setRasterLoaded(true);
          });
    } else {
      console.log('Waiting for district selection; clearing map data');
      setBoundaryData(null);
      setLulcTilesUrl(null);
      setSubdistrictBounds(null);
      setLoading(false);
    }
  }, [selectedState, selectedDistrict, selectedLulcYear, lastDistrict, lastState]);

  useEffect(() => {
    if (boundaryLoaded && rasterLoaded && flyToComplete) {
      setLoading(false);
    }
  }, [boundaryLoaded, rasterLoaded, flyToComplete]);

  // Handle zooming when subdistrict or village selection changes
  // This handles zooming to subdistricts and villages after initial district load
  useEffect(() => {
    if (!boundaryData || !boundaryData.features || boundaryData.features.length === 0) {
      return;
    }
    if (!mapRef.current) {
      return;
    }

    const map = mapRef.current;

    if (selectedVillage && boundaryData.features.length > 0) {
      // Zoom to selected village
      const villageName = selectedVillage.label || selectedVillage;
      let selectedVillageName = villageName;
      if (selectedVillageName && selectedVillageName.includes(' - ')) {
        selectedVillageName = selectedVillageName.split(' - ')[0];
      }

      const villageFeature = boundaryData.features.find(
        feature => feature.properties.village_na &&
        feature.properties.village_na.toLowerCase().trim() === selectedVillageName.toLowerCase().trim()
      );

      if (villageFeature) {
        const villageLayer = L.geoJSON(villageFeature);
        const villageBounds = villageLayer.getBounds();
        if (villageBounds.isValid()) {
          map.flyToBounds(villageBounds, { padding: [20, 20], animate: true });
        }
      }
    } else if (selectedSubdistrict && boundaryData.features.length > 0) {
      // Try to zoom to selected subdistrict bounds
      const subdistrictName = selectedSubdistrict.label || selectedSubdistrict;

      const subdistrictFeatures = boundaryData.features.filter(feature => {
        const featureSubdistrict = feature.properties?.subdistric ||  // ✅ Check subdistric first
                                  feature.properties?.subdistrict ||
                                  feature.properties?.subdistrict_na ||
                                  feature.properties?.sub_district ||
                                  feature.properties?.block_name ||
                                  feature.properties?.block ||
                                  feature.properties?.subdistrict_name;

        return featureSubdistrict &&
               featureSubdistrict.toLowerCase().trim() === subdistrictName.toLowerCase().trim();
      });

      if (subdistrictFeatures.length > 0) {
        // Found matching subdistrict features - zoom to them
        const subdistrictLayer = L.geoJSON(subdistrictFeatures);
        const subdistrictBounds = subdistrictLayer.getBounds();

        if (subdistrictBounds.isValid()) {
          map.flyToBounds(subdistrictBounds, { padding: [30, 30], animate: true });
        }
      }
    }
  }, [selectedSubdistrict, selectedVillage, boundaryData]);

  const highlightStyle = {
    color: '#ff7800',
    weight: 0.5,
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

    // Check if this polygon belongs to the selected subdistrict
    const featureSubdistrict = feature.properties?.subdistric;
    const selectedSubdistrictName = selectedSubdistrict?.label || selectedSubdistrict;

    // Determine if this feature should be highlighted or labeled
    let shouldHighlight = false;
    let shouldLabel = false;
    let shouldHide = false; // New flag to hide non-subdistrict features

    if (selectedVillage && feature.properties.village_na &&
        feature.properties.village_na.toLowerCase().trim() === (selectedVillageName || '').toLowerCase().trim()) {
      // Selected village - always highlight and label
      shouldHighlight = true;
      shouldLabel = true;
    } else if (selectedSubdistrict && featureSubdistrict &&
               featureSubdistrict.toLowerCase().trim() === (selectedSubdistrictName || '').toLowerCase().trim()) {
      // Village in selected subdistrict - label but don't highlight
      shouldLabel = true;
      shouldHighlight = false;
    } else if (selectedSubdistrict && featureSubdistrict &&
               featureSubdistrict.toLowerCase().trim() !== (selectedSubdistrictName || '').toLowerCase().trim()) {
      // Village NOT in selected subdistrict - hide it
      shouldHide = true;
      shouldLabel = false;
      shouldHighlight = false;
    }
    // If no subdistrict selected, don't label any polygons (district level - unlabeled)

    // Apply styling
    if (shouldHide) {
      // Hide non-subdistrict features when subdistrict is selected
      layer.setStyle({
        opacity: 0,
        fillOpacity: 0,
        weight: 0
      });
    } else if (shouldHighlight) {
      layer.setStyle(highlightStyle);
    } else {
      layer.setStyle(normalStyle);
    }

    // Add labels based on selection level
    if (shouldLabel && feature.properties && feature.properties.village_na) {
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
          <p className="text-lg font-bold text-gray-800">Please select a district to view the map</p>
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



          {boundaryData && (
            <LayersControl.Overlay checked name="Village Boundaries">
              <GeoJSON
                key={`${JSON.stringify(boundaryData)}-${selectedSubdistrict?.value || 'none'}-${selectedVillage?.value || 'none'}`}
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

        {/* LULC Layer controlled externally */}
        {lulcTilesUrl && showLulc && (
          <TileLayer
            url={lulcTilesUrl}
            opacity={lulcOpacity}
            crossOrigin={true}
            zIndex={400}
            attribution=""
          />
        )}
        {boundaryData && (
          <FlyToFeature
            featureData={boundaryData}
            onFlyToComplete={() => {
              setFlyToComplete(true);
              setShouldZoomToDistrict(false); // Reset flag after zoom completes
            }}
            shouldZoomToDistrict={shouldZoomToDistrict}
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
  showLulc: PropTypes.bool,
  lulcOpacity: PropTypes.number,
  selectedLulcYear: PropTypes.string,
  onYearLoadingChange: PropTypes.func,
};

export default VillageMap;
