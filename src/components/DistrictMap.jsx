import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import { get_boundary_data, get_lulc_raster } from '../services/api';
import PropTypes from 'prop-types';
import YearDropdown from './MapComponents/YearSelectMap';
import L from 'leaflet';
import Spinner from './Spinner';
import 'leaflet/dist/leaflet.css';
import { useSetRecoilState } from 'recoil';
import { compareVillagesClickedAtom } from '../recoil/selectAtoms';
import OpacitySlider from './MapComponents/OpacitySlider';
import html2canvas from 'html2canvas';
import MultiYearMaps from './MapComponents/MultiYearMap';
import { mapCoordinator } from '../utils/MapStateCoordinator';
import { useAuth } from '../context/AuthContext';

const Legend = () => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      const labels = [
        { color: "#397d49", label: "Tree/Forests" },
        { color: "#8b9dc3", label: "Single cropping cropland" },
        { color: "#222f5b", label: "Double cropping cropland" },
        { color: "#946b2d", label: "Shrub/Scrub" }
      ];

      let legendHtml = '<div style="font-size:14px; font-weight:bold; margin-bottom:5px; color: black;">Legend</div>';
      labels.forEach(item => {
        legendHtml +=
          `<div style="display: flex; align-items: center; margin-bottom: 4px; color: black;">` +
          `<i style="width: 18px; height: 18px; background:${item.color}; margin-right: 8px;"></i>` +
          `<span>${item.label}</span>` +
          `</div>`;
      });

      div.innerHTML = legendHtml;
      div.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      div.style.padding = '6px 10px';
      div.style.borderRadius = '5px';
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
};

const ZoomStateLock = () => {
  const map = useMap();
  const [hasAppliedZoom, setHasAppliedZoom] = useState(false);
  
  useEffect(() => {
    const isSharedLink = window.location.search.includes('shared=true');
    if (!map || !isSharedLink) return;
    if (hasAppliedZoom) return; // Only apply once
    
    console.log('ZoomStateLock: Initializing for shared link');
    
    // Override critical map methods to prevent zoom changes
    const originalFitBounds = map.fitBounds;
    const originalFlyToBounds = map.flyToBounds;
    const originalZoomOut = map.zoomOut;
    
    if (sessionStorage.getItem('zoomLocked') === 'true') {
      // Apply hard override to map methods
      map.fitBounds = function() {
        console.log('Intercepted fitBounds call');
        return map;
      };
      
      map.flyToBounds = function() {
        console.log('Intercepted flyToBounds call');
        return map;
      };
      
      map.zoomOut = function() {
        const zoom = map.getZoom();
        if (zoom <= 12) {
          console.log('Preventing zoom out below 12');
          return map;
        }
        return originalZoomOut.apply(this, arguments);
      };
      
      // Restore bounds from session storage
      try {
        const boundsData = JSON.parse(sessionStorage.getItem('villageBounds'));
        if (boundsData) {
          const bounds = L.latLngBounds(
            [boundsData.south, boundsData.west],
            [boundsData.north, boundsData.east]
          );
          
          // Set hard constraints
          map.setMinZoom(12);
          map.setMaxBounds(bounds.pad(0.5));
          map.options.maxBoundsViscosity = 1.0;
          
          // Wait for the map to be ready before zooming
          setTimeout(() => {
            console.log('Applying stored zoom bounds');
            map.invalidateSize();
            map.flyToBounds(bounds, { 
              padding: [40, 40],
              animate: true
            });
            setHasAppliedZoom(true);
            
            mapCoordinator.init(map).lockZoom(bounds);
          }, 500); // Increased delay to ensure map is ready
        }
      } catch (e) {
        console.error('Error restoring zoom state:', e);
      }
    }
    
    // Clean up on unmount
    return () => {
      // Only restore original methods if we're still in a shared link
      if (window.location.search.includes('shared=true')) {
        map.fitBounds = originalFitBounds;
        map.flyToBounds = originalFlyToBounds;
        map.zoomOut = originalZoomOut;
      }
    };
  }, [map, hasAppliedZoom]);
  
  return null;
};

function FlyToFeature({ featureData, onFlyToComplete }) {
  const map = useMap();
  const [hasZoomed, setHasZoomed] = useState(false);

  // Reset hasZoomed when featureData changes completely
  useEffect(() => {
    if (featureData) {
      console.log("New feature data received, resetting zoom state");
      setHasZoomed(false);
    }
  }, [featureData]);

  useEffect(() => {
    // Skip if we've already zoomed or no data
    if (hasZoomed || !featureData || !map) {
      console.log("Skipping zoom because:", { 
        hasZoomed, 
        hasFeatureData: !!featureData, 
        hasMap: !!map 
      });
      return;
    }
    
    const isSharedLink = window.location.search.includes('shared=true');
    
    // Skip if coordinator says we should
    if (isSharedLink && mapCoordinator.shouldSkipZoomReset()) {
      console.log('Skipping automatic zoom due to zoom lock');
      onFlyToComplete();
      return;
    }
    
    // Add delay for zooming in shared link mode to ensure map is properly loaded
    const performZoom = async () => {
      try {
        // Add a delay before zooming to ensure the map is fully ready
        if (isSharedLink) {
          console.log("Adding delay before zooming in shared link mode...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Create bounds from the GeoJSON data
        console.log("Creating bounds from GeoJSON data");
        const geoJsonLayer = L.geoJSON(featureData);
        const bounds = geoJsonLayer.getBounds();
        
        if (!bounds.isValid()) {
          console.error("Invalid bounds generated from feature data");
          onFlyToComplete();
          return;
        }
        
        console.log("Zooming to bounds:", bounds);
        
        // If it's a shared link, we want to lock the zoom
        if (isSharedLink) {
          // Initialize coordinator with map if needed
          if (!mapCoordinator.mapRef) {
            mapCoordinator.init(map);
          }
          
          // Lock the zoom to these bounds
          mapCoordinator.lockZoom(bounds);
          
          // Zoom with animation
          map.flyToBounds(bounds, { 
            padding: [40, 40],
            animate: true,
            duration: 0.8
          });
          
          // Set flag to prevent repeated zooming
          setHasZoomed(true);
          
          // Signal completion after animation
          setTimeout(() => {
            console.log("Zoom animation complete (timeout)");
            onFlyToComplete();
          }, 1000);
        } else {
          // Standard zoom behavior for normal use
          map.flyToBounds(bounds, { padding: [50, 50] });
          setHasZoomed(true);
          
          // Signal completion when animation ends
          map.once('moveend', () => {
            console.log("Zoom animation complete (moveend event)");
            onFlyToComplete();
          });
        }
      } catch (error) {
        console.error("Error during map zoom:", error);
        // Ensure we don't get stuck in loading state
        onFlyToComplete();
      }
    };
    
    performZoom();
  }, [featureData, map, onFlyToComplete, hasZoomed]);

  return null;
}

FlyToFeature.propTypes = {
  featureData: PropTypes.object,
  onFlyToComplete: PropTypes.func,
};

const DistrictMap = ({ selectedState, selectedDistrict, selectedSubdistrict, selectedVillage, scrollRef, districtMapRef, isAuthenticated }) => {
  const position = [22.3511148, 78.6677428];
  const zoom = 5;

  const [boundaryData, setBoundaryData] = useState(null);
  const [lulcTilesUrl, setLulcTilesUrl] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2022');
  const [isLoading, setLoading] = useState(false);
  const [boundaryLoaded, setBoundaryLoaded] = useState(false);
  const [rasterLoaded, setRasterLoaded] = useState(false);
  const [flyToComplete, setFlyToComplete] = useState(false);
  const [lulcOpacity, setLulcOpacity] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showYearViz, setShowYearViz] = useState(false);
  const [yearLulcData, setYearLulcData] = useState({});

  const setCompareVillagesClicked = useSetRecoilState(compareVillagesClickedAtom);
  const mapRef = useRef(null);
  const downloadMapRef = useRef(null);

  const { isAuthenticated: authFromHook } = useAuth();
  const userIsAuthenticated = isAuthenticated || authFromHook;

  // Update external ref when internal ref changes
  useEffect(() => {
    if (districtMapRef && mapRef.current) {
      districtMapRef.current = mapRef.current;
      console.log('DistrictMap: External ref updated via useEffect');
    }
  }, [districtMapRef, mapRef.current]);

  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption.value);
  };

  const handleDownload = async () => {
    if (!mapRef.current || !lulcTilesUrl || !selectedVillage) {
      console.error('Required data missing for download');
      return;
    }

    setIsDownloading(true);
    const map = mapRef.current;

    try {
      // Store map reference immediately when download starts
      downloadMapRef.current = mapRef.current;
      
      // Get the map container element
      const mapContainer = map.getContainer();
      
      // Make sure the container is visible and has dimensions
      if (!mapContainer.offsetWidth || !mapContainer.offsetHeight) {
        throw new Error('Map container has no dimensions');
      }

      // Force map size update
      map.invalidateSize();
      
      // Use DOM API to capture the map
      const screenshotTarget = mapContainer.querySelector('.leaflet-map-pane');
      if (!screenshotTarget) {
        throw new Error('Map pane element not found');
      }

      const canvas = await html2canvas(screenshotTarget, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        scale: 2, // Higher quality
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight,
        onclone: (clonedDoc) => {
          // Ensure the cloned element is visible
          const clonedMap = clonedDoc.querySelector('.leaflet-map-pane');
          if (clonedMap) {
            clonedMap.style.visibility = 'visible';
          }
        }
      });

      // Create download
      const dataURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      const villageName = selectedVillage?.label || selectedVillage;
      
      downloadLink.href = dataURL;
      downloadLink.download = `LULC_${villageName}_${selectedYear}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

    } catch (error) {
      console.error('Error during download:', error);
      alert('Failed to download map. Please try again.');
    } finally {
      setIsDownloading(false);
      downloadMapRef.current = null;
    }
  };

  const fetchAllYearsLulc = async () => {
    setLoading(true);
    // Use different years based on state
    const years = ['maharashtra', 'uttar pradesh', 'jharkhand'].includes(selectedState?.toLowerCase())
      ? ['2018', '2020', '2021', '2022']
      : ['2019', '2020', '2021', '2022'];
    const data = {};
    
    try {
      for (const year of years) {
        const response = await get_lulc_raster(
          selectedState,
          selectedDistrict.value,
          selectedSubdistrict?.label || null,
          selectedVillage?.label || null,
          year
        );
        data[year] = response.tiles_url;
      }
      setYearLulcData(data);
      setShowYearViz(true);
    } catch (error) {
      console.error('Error fetching multi-year LULC data:', error);
      alert('Failed to load visualization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update the useEffect where boundary data is fetched
  useEffect(() => {
    const isSharedLink = window.location.search.includes('shared=true');
    
    setLoading(true);
    setBoundaryLoaded(false);
    setRasterLoaded(false);
    setFlyToComplete(false); // Always reset flyToComplete when selections change
    
    console.log("Selection changed, fetching new data:", {
      state: selectedState,
      district: selectedDistrict?.label,
      subdistrict: selectedSubdistrict?.label,
      village: selectedVillage?.label
    });

    if (selectedDistrict && selectedState) {
      // If on a shared link, add a small delay before fetching
      const delayFetch = async () => {
        if (isSharedLink) {
          console.log("Shared link detected, adding delay before fetching map data...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log("Proceeding with map data fetch after delay");
        }
        
        const districtValue = selectedDistrict.value;
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
          district: districtValue,
          subdistrict: subdistrictValue,
          villageName: villageName,
          villageId: villageId
        });

        // Register this API call with the coordinator
        const callId = isSharedLink ? mapCoordinator.registerApiCall('boundary', 10) : 'no-shared-link';
        
        // Store the exact parameters for LULC to ensure consistency
        const apiParams = {
          state: selectedState,
          district: districtValue,
          subdistrict: subdistrictValue,
          village: villageValue,
          villageId: villageId,
          villageName: villageName
        };
        
        console.log('API parameters for both boundary and LULC:', apiParams);
        
        // Fetch boundary data with village ID when available
        get_boundary_data(selectedState, districtValue, subdistrictValue, villageValue, villageId)
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
            if (isSharedLink) {
              mapCoordinator.completeApiCall(callId);
            }
          })
          .catch(error => {
            console.error('Error fetching the GeoJSON data:', error);
            setBoundaryData(null);
            setBoundaryLoaded(true);
            if (isSharedLink) {
              mapCoordinator.completeApiCall(callId);
            }
          });

        // Fetch LULC data with EXACT same parameters as boundary
        const lulcCallId = isSharedLink ? mapCoordinator.registerApiCall('lulc', 5) : 'no-shared-link';
        console.log('Fetching LULC with same parameters as boundary:', apiParams);
        
        get_lulc_raster(selectedState, districtValue, subdistrictValue, villageValue, selectedYear)
          .then(data => {
            console.log("Received LULC raster data:", data.tiles_url ? "has URL" : "no URL");
            if (data.tiles_url) {
              console.log("LULC URL:", data.tiles_url);
            }
            setLulcTilesUrl(data.tiles_url);
            setRasterLoaded(true);
            if (isSharedLink) {
              mapCoordinator.completeApiCall(lulcCallId);
            }
          })
          .catch(error => {
            console.error('Error fetching the LULC raster data:', error);
            setLulcTilesUrl(null);
            setRasterLoaded(true);
            if (isSharedLink) {
              mapCoordinator.completeApiCall(lulcCallId);
            }
          });
      };
      
      delayFetch();
    } else {
      console.log("Missing required selections, clearing map data");
      setBoundaryData(null);
      setLulcTilesUrl(null);
      setLoading(false);
    }
  }, [selectedState, selectedDistrict, selectedSubdistrict, selectedVillage, selectedYear]);

  useEffect(() => {
    if (boundaryLoaded && rasterLoaded && flyToComplete) {
      setLoading(false);
    }
  }, [boundaryLoaded, rasterLoaded, flyToComplete]);

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
  };

  // Add a new useEffect in the DistrictMap component to handle shared link forces zoom
  // Put this right after the other useEffects

  useEffect(() => {
    // This effect is specifically for handling shared link re-zoom after all data is loaded
    const isSharedLink = window.location.search.includes('shared=true');
    
    if (!isSharedLink || !mapRef.current || !boundaryData || !selectedVillage || !boundaryLoaded || !rasterLoaded) {
      return;
    }
    
    console.log("Shared link detected with all data loaded - performing additional zoom to ensure correct position");
    
    // Add a longer delay after everything is loaded to perform an additional zoom
    const timer = setTimeout(() => {
      try {
        if (!mapRef.current) return;
        
        const map = mapRef.current;
        const geoJsonLayer = L.geoJSON(boundaryData);
        const bounds = geoJsonLayer.getBounds();
        
        if (bounds.isValid()) {
          console.log("Performing additional forced zoom to village bounds");
          
          // Initialize coordinator with map if needed
          if (!mapCoordinator.mapRef) {
            mapCoordinator.init(map);
          }
          
          // Lock the zoom to these bounds
          mapCoordinator.lockZoom(bounds);
          
          // Force zoom with animation
          map.invalidateSize();
          map.flyToBounds(bounds, { 
            padding: [40, 40],
            animate: true,
            duration: 1.0
          });
        }
      } catch (error) {
        console.error("Error during additional forced zoom:", error);
      }
    }, 5000); // 5 second delay after all data is loaded
    
    return () => clearTimeout(timer);
  }, [boundaryData, selectedVillage, boundaryLoaded, rasterLoaded]);

  return (
    <div className="relative h-full w-full">
      {isLoading && <Spinner />}
      {!selectedDistrict && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 
                      bg-white bg-opacity-90 p-5 rounded-lg shadow-lg text-center">
          <p className="text-lg font-bold text-gray-800">Please select a district to view the map</p>
        </div>
      )}
      <div className="absolute top-0 left-10 z-[9999] m-4">
        <YearDropdown selectedYear={selectedYear} onChange={handleYearChange} stateName={selectedState} />
      </div>
      <div className="absolute bottom-8 left-10 z-[9999] m-4">
        <div className="mb-4 w-52">
          <OpacitySlider
            opacity={lulcOpacity}
            onChange={setLulcOpacity}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={!lulcTilesUrl || !selectedVillage || isDownloading || !userIsAuthenticated}
            className={`${
              lulcTilesUrl && selectedVillage && !isDownloading && userIsAuthenticated
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-all duration-200`}
            title={!userIsAuthenticated ? "Login required to download" : ""}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                clipRule="evenodd"
              />
            </svg>
            {isDownloading ? 'Downloading...' : 'Download LULC'}
          </button>

          <button
            onClick={fetchAllYearsLulc}
            disabled={!selectedVillage || isLoading || !userIsAuthenticated}
            className={`${
              selectedVillage && !isLoading && userIsAuthenticated
                ? 'bg-purple-500 hover:bg-purple-600'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white font-bold py-2 px-4 rounded flex items-center gap-2`}
            title={!userIsAuthenticated ? "Login required to visualize years" : ""}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4zm6 1a1 1 0 10-2 0v4a1 1 0 102 0V5z" 
                clipRule="evenodd"
              />
            </svg>
            Visualize Years
          </button>
          
          <button
            onClick={() => {
              if (userIsAuthenticated) {
                setCompareVillagesClicked(true);
                if (scrollRef?.current) {
                  scrollRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
            disabled={!userIsAuthenticated}
            className={`${
              userIsAuthenticated
                ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white font-bold py-2 px-4 rounded`}
            title={!userIsAuthenticated ? "Login required to compare villages" : ""}
          >
            Compare Villages
          </button>
        </div>
        {!userIsAuthenticated && (
          <div className="text-gray-600 text-xs mt-2 bg-white bg-opacity-80 p-2 rounded">
            Login required for advanced features
          </div>
        )}
      </div>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        whenCreated={(map) => {
          mapRef.current = map;
          console.log('Map instance created:', map);
          
          // Update external ref immediately when map is created
          if (districtMapRef) {
            districtMapRef.current = map;
            console.log('DistrictMap: External ref updated via whenCreated');
          }
          
          // Let coordinator know about the map
          mapCoordinator.init(map);
        }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Google Maps">
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
          <LayersControl.BaseLayer name="Google Satellite Hybrid">
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              attribution='&copy; <a href="https://www.google.com/maps">Google Satellite Hybrid</a> contributors'
            />
          </LayersControl.BaseLayer>

          {lulcTilesUrl && (
            <LayersControl.Overlay checked name="Land Use Land Cover">
              <TileLayer
                url={lulcTilesUrl}
                opacity={lulcOpacity}
                crossOrigin={true}
                className="lulc-layer-only"
                zIndex={1000}
                attribution=""
                eventHandlers={{
                  load: () => {
                    console.log('LULC layer loaded');
                  }
                }}
              />
            </LayersControl.Overlay>
          )}

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
        
        {/* Add ZoomStateLock for shared links */}
        {window.location.search.includes('shared=true') && <ZoomStateLock />}
        
        <Legend />
      </MapContainer>

      <MultiYearMaps
        isOpen={showYearViz}
        onClose={() => setShowYearViz(false)}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        selectedVillage={selectedVillage}
        boundaryData={boundaryData}
        lulcData={yearLulcData}
      />
    </div>
  );
};

DistrictMap.propTypes = {
  selectedState: PropTypes.string,
  selectedDistrict: PropTypes.object,
  selectedSubdistrict: PropTypes.object,
  selectedVillage: PropTypes.object,
  scrollRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  districtMapRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  isAuthenticated: PropTypes.bool,
};

export default DistrictMap;