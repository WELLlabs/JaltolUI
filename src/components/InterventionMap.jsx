import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { get_boundary_data, get_lulc_raster } from '../services/api';
import PropTypes from 'prop-types';
import YearDropdown from './MapComponents/YearSelectMap';
import L from 'leaflet';
import VillageDetails from './VillageDetails';
import Spinner from './Spinner'; // Import Spinner

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

const InterventionMap = ({ selectedState, selectedDistrict, selectedSubdistrict, selectedVillage }) => {
  const position = [22.3511148, 78.6677428]; // Central point of India
  const zoom = 5;

  const [boundaryData, setBoundaryData] = useState(null);
  const [lulcTilesUrl, setLulcTilesUrl] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2022');
  const [isLoading, setLoading] = useState(false);
  const [boundaryLoaded, setBoundaryLoaded] = useState(false);
  const [rasterLoaded, setRasterLoaded] = useState(false);
  const [flyToComplete, setFlyToComplete] = useState(false);

  // Function to handle year change from the dropdown
  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption.value);
  };

  useEffect(() => {
    if (selectedDistrict && selectedState) {
      setLoading(true);
      setBoundaryLoaded(false); // Reset boundary loaded state
      setRasterLoaded(false); // Reset raster loaded state
      setFlyToComplete(false); // Reset fly to complete state

      const districtValue = selectedDistrict.value;
      const subdistrictValue = selectedSubdistrict ? selectedSubdistrict.value : null;

      // Fetch boundary data
      get_boundary_data(selectedState, districtValue, subdistrictValue, selectedVillage)
        .then(data => {
          console.log("Boundary data received:", data);
          if (selectedVillage) {
            // Normalize data if necessary or ensure exact match conditions are checked
            const villageFeature = data.features.find(feature => feature.properties.village_na.toLowerCase().trim() === selectedVillage.toLowerCase().trim());
            console.log("Attempting to find village:", selectedVillage, "in data:", data.features.map(f => f.properties.village_na));
            if (villageFeature) {
              console.log("Village feature found:", villageFeature);
              setBoundaryData({ ...data, features: [villageFeature] });
            } else {
              console.log("No village feature found for:", selectedVillage);
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
      get_lulc_raster(selectedState, districtValue, subdistrictValue, selectedVillage, selectedYear)
        .then(data => {
          setLulcTilesUrl(data.tiles_url);
          setRasterLoaded(true);
          if (selectedSubdistrict && selectedVillage) {
            get_lulc_raster(selectedState, districtValue, subdistrictValue, selectedVillage, selectedYear)
            .then(data => {
              setLulcTilesUrl(data.tiles_url);
              setRasterLoaded(true);})
            ;}
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

  const onEachFeature = (feature, layer) => {
    if (feature.properties.village_na === selectedVillage) {
      layer.setStyle(highlightStyle);
    } else {
      layer.setStyle(normalStyle);
    }
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && <Spinner />} {/* Display spinner while loading */}
      <div className="absolute top-0 left-10 z-[9999] m-4">
        <YearDropdown selectedYear={selectedYear} onChange={handleYearChange} />
      </div>
      <div className='absolute top-5 left-40 z-[9999] bg-white pl-10 pr-10 rounded-lg shadow-lg bg-opacity-70'>
        <VillageDetails
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          selectedSubdistrict={selectedSubdistrict}
          selectedVillage={selectedVillage}
        />
      </div>
      <MapContainer center={position} zoom={zoom} style={{ height: '100%', width: '100%' }}>
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
              <TileLayer url={lulcTilesUrl} />
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
  selectedDistrict: PropTypes.string,
  selectedSubdistrict: PropTypes.string,
  selectedVillage: PropTypes.string,
};

export default InterventionMap;
