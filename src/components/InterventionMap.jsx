import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { get_boundary_data, get_lulc_raster } from '../services/api';
import PropTypes from 'prop-types';
import YearDropdown from './MapComponents/YearSelectMap';
import L from 'leaflet';
import VillageDetails from './VillageDetails';
import Spinner from './Spinner'; // Import Spinner
import OpacitySlider from './MapComponents/OpacitySlider';
import * as turf from '@turf/turf';
import { useRecoilValue } from 'recoil';
import { customPolygonDataAtom } from '../recoil/selectAtoms';

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

function FlyToFeature({ featureData, onFlyToComplete }) {
  const map = useMap();

  useEffect(() => {
    if (featureData) {
      const geoJsonLayer = L.geoJSON(featureData);
      const bounds = geoJsonLayer.getBounds();
      map.flyToBounds(bounds, { padding: [50, 50] });
      map.once('moveend', () => {
        onFlyToComplete();
      });
    }
  }, [featureData, map, onFlyToComplete]);

  return null;
}

FlyToFeature.propTypes = {
  featureData: PropTypes.object,
  onFlyToComplete: PropTypes.func,
};

const InterventionMap = ({ 
  selectedState, 
  selectedDistrict, 
  selectedSubdistrict, 
  selectedVillage, 
  interventionMapRef,
  uploadedGeoJSON
}) => {
  const position = [22.3511148, 78.6677428]; // Central point of India
  const zoom = 5;

  const [boundaryData, setBoundaryData] = useState(null);
  const [lulcTilesUrl, setLulcTilesUrl] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2022');
  const [isLoading, setLoading] = useState(false);
  const [boundaryLoaded, setBoundaryLoaded] = useState(false);
  const [rasterLoaded, setRasterLoaded] = useState(false);
  const [flyToComplete, setFlyToComplete] = useState(false);
  const [lulcOpacity, setLulcOpacity] = useState(1);
  const [processedGeoJSON, setProcessedGeoJSON] = useState(null);
  
  // Get processed polygon data from Recoil atom
  const customPolygonData = useRecoilValue(customPolygonDataAtom);

  const mapRef = useRef(null);

  // Update external ref when internal ref changes
  useEffect(() => {
    if (interventionMapRef && mapRef.current) {
      interventionMapRef.current = mapRef.current;
      console.log('InterventionMap: External ref updated via useEffect');
    }
  }, [interventionMapRef, mapRef.current]);

  // Function to handle year change from the dropdown
  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption.value);
  };

  // Process the GeoJSON when it's received from props or atom
  useEffect(() => {
    if (customPolygonData?.polygon) {
      // If we have processed data from the backend, use that
      setProcessedGeoJSON(customPolygonData.polygon);
    } else if (uploadedGeoJSON && boundaryData) {
      // Otherwise process the uploaded GeoJSON locally
      processGeoJSON(uploadedGeoJSON);
    }
  }, [uploadedGeoJSON, boundaryData, customPolygonData]);

  const processGeoJSON = (geojsonData) => {
    if (!boundaryData || !boundaryData.features || boundaryData.features.length === 0) {
      console.warn('No village boundary data available to process GeoJSON');
      setProcessedGeoJSON(null);
      return;
    }

    try {
      // Get the village polygon
      const villageBoundary = boundaryData.features[0];
      
      // Process each feature in the uploaded GeoJSON
      const intersectedFeatures = {
        type: 'FeatureCollection',
        features: []
      };

      // Check if we're dealing with a FeatureCollection or a single Feature
      const features = geojsonData.type === 'FeatureCollection' 
        ? geojsonData.features 
        : [geojsonData];

      features.forEach(feature => {
        try {
          // For simple cases like the sample.geojson, where we're drawing shapes inside the village,
          // we may just want to display the shapes directly
          if (turf.booleanWithin(feature, villageBoundary)) {
            // If the feature is completely within the village boundary, add it as is
            intersectedFeatures.features.push({...feature});
            return;
          }
          
          // Handle different geometry types for partial intersections
          if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
            const intersection = turf.intersect(feature, villageBoundary);
            if (intersection) {
              // Preserve original properties if they exist
              intersection.properties = {...feature.properties, ...intersection.properties};
              intersectedFeatures.features.push(intersection);
            }
          } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
            // For lines, we can use turf.lineSplit or turf.lineIntersect
            const clipped = turf.booleanIntersects(feature, villageBoundary) 
              ? turf.mask(feature, villageBoundary) 
              : null;
            if (clipped) {
              intersectedFeatures.features.push(clipped);
            }
          } else if (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') {
            // For points, check if they're inside the polygon
            if (turf.booleanPointInPolygon(feature.geometry.coordinates, villageBoundary)) {
              intersectedFeatures.features.push(feature);
            }
          }
        } catch (error) {
          console.error('Error processing feature:', error, feature);
          // If there's an error with the intersection, try to add the feature unchanged
          // but only if it at least intersects with the village boundary
          if (turf.booleanIntersects(feature, villageBoundary)) {
            intersectedFeatures.features.push({...feature});
          }
        }
      });

      console.log('Processed GeoJSON features:', intersectedFeatures.features.length);
      setProcessedGeoJSON(intersectedFeatures);
    } catch (error) {
      console.error('Error intersecting GeoJSON with village boundary:', error);
    }
  };

  useEffect(() => {
    if (selectedDistrict && selectedState) {
      setLoading(true);
      setBoundaryLoaded(false); // Reset boundary loaded state
      setRasterLoaded(false); // Reset raster loaded state
      setFlyToComplete(false); // Reset fly to complete state

      const districtValue = selectedDistrict.value;
      const subdistrictValue = selectedSubdistrict ? selectedSubdistrict.label : null;
      const villageValue = selectedVillage ? selectedVillage.label : null;
      
      // Extract village ID if present in the format "name - id"
      let villageId = null;
      let villageName = villageValue;
      
      if (villageValue && villageValue.includes(' - ')) {
        const parts = villageValue.split(' - ');
        villageName = parts[0];
        if (parts.length > 1) {
          villageId = parts[1];
        }
      }
      
      // Also check if the village object has a value property that might contain the ID
      if (!villageId && selectedVillage?.value && selectedVillage.value !== selectedVillage.label) {
        villageId = selectedVillage.value;
      }
      
      console.log('Fetching boundary with:', {
        state: selectedState,
        district: districtValue,
        subdistrict: subdistrictValue,
        villageName: villageName,
        villageId: villageId
      });

      // Fetch boundary data with village ID when available
      get_boundary_data(selectedState, districtValue, subdistrictValue, villageValue, villageId)
        .then(data => {
          console.log("Boundary data received:", data);
          if (selectedVillage) {
            // Normalize data if necessary or ensure exact match conditions are checked
            const villageNameToMatch = villageName || villageValue;
            const villageFeature = data.features.find(
              feature => feature.properties.village_na.toLowerCase().trim() === villageNameToMatch.toLowerCase().trim()
            );
            console.log("Attempting to find village:", villageNameToMatch, "in data:", data.features.map(f => f.properties.village_na));
            if (villageFeature) {
              console.log("Village feature found:", villageFeature);
              setBoundaryData({ ...data, features: [villageFeature] });
            } else {
              console.log("No village feature found for:", villageNameToMatch);
            }
          } else {
            setBoundaryData(data);
          }
          setBoundaryLoaded(true);
        })
        .catch(error => {
          console.error('Error fetching the GeoJSON data:', error);
          setBoundaryLoaded(true); // Even if there's an error, we need to stop loading
        });

      // Fetch LULC raster data
      get_lulc_raster(selectedState, districtValue, subdistrictValue, villageValue, selectedYear)
        .then(data => {
          setLulcTilesUrl(data.tiles_url);
          setRasterLoaded(true);
          if (selectedSubdistrict && selectedVillage) {
            get_lulc_raster(selectedState, districtValue, subdistrictValue, villageValue, selectedYear)
              .then(data => {
                setLulcTilesUrl(data.tiles_url);
                setRasterLoaded(true);
              })
              ;
          }
        })
        .catch(error => {
          console.error('Error fetching the LULC raster data:', error);
          setRasterLoaded(true); // Even if there's an error, we need to stop loading
        });
    } else {
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

  const uploadedGeoJSONStyle = {
    color: 'transparent', // No border
    weight: 0,
    opacity: 0,
    fillColor: '#FFFFFF', // White fill
    fillOpacity: 0.8
  };

  const polygonStyle = {
    color: 'transparent', // No border
    weight: 0,
    opacity: 0,
    fillColor: '#FFFFFF', // White fill
    fillOpacity: 0.8
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
  
  return (
    <div className="relative h-full w-full">
      {isLoading && <Spinner />} {/* Display spinner while loading */}
      <div className="absolute top-0 left-10 z-[9999] m-4">
        <YearDropdown selectedYear={selectedYear} onChange={handleYearChange} stateName={selectedState} />
      </div>
      <div className='absolute top-5 left-40 z-[9999] bg-white pl-10 pr-10 rounded-lg shadow-lg bg-opacity-70'>
        <VillageDetails
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          selectedSubdistrict={selectedSubdistrict}
          selectedVillage={selectedVillage}
        />
      </div>
      <div className="absolute bottom-8 left-10 z-[9999] m-4">
        <div className="w-52 bg-white rounded shadow-md">
          <OpacitySlider
            opacity={lulcOpacity}
            onChange={setLulcOpacity}
          />
        </div>
      </div>

      <MapContainer 
        center={position} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }} 
        ref={mapRef}
        whenCreated={(map) => {
          mapRef.current = map;
          console.log('InterventionMap: Map instance created:', map);
          
          // Update external ref immediately when map is created
          if (interventionMapRef) {
            interventionMapRef.current = map;
            console.log('InterventionMap: External ref updated via whenCreated');
          }
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
              />
            </LayersControl.Overlay>
          )}
          {boundaryData && (
            <LayersControl.Overlay checked name="Village Boundaries">
              <GeoJSON
                key={JSON.stringify(boundaryData)} // Force re-render by using a unique key
                data={boundaryData}
                style={normalStyle}
                onEachFeature={onEachFeature}
              />
            </LayersControl.Overlay>
          )}
          {processedGeoJSON && processedGeoJSON.features.length > 0 && (
            <LayersControl.Overlay checked name="Uploaded GeoJSON">
              <GeoJSON
                key={JSON.stringify(processedGeoJSON)} // Force re-render
                data={processedGeoJSON}
                style={uploadedGeoJSONStyle}
              />
            </LayersControl.Overlay>
          )}
          {customPolygonData && customPolygonData.polygon && (
            <LayersControl.Overlay checked name="Custom Polygon">
              <GeoJSON
                key={`custom-polygon-${JSON.stringify(customPolygonData.polygon).length}`}
                data={customPolygonData.polygon}
                style={polygonStyle}
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
        <Legend />
      </MapContainer>
    </div>
  );
};

InterventionMap.propTypes = {
  selectedState: PropTypes.string,
  selectedDistrict: PropTypes.object,
  selectedSubdistrict: PropTypes.object,
  selectedVillage: PropTypes.object,
  interventionMapRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  uploadedGeoJSON: PropTypes.object
};

export default InterventionMap;
