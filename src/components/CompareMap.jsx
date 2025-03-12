import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { get_control_village, get_lulc_raster, get_boundary_data } from '../services/api';
import PropTypes from 'prop-types';
import YearDropdown from './MapComponents/YearSelectMap';
import L from 'leaflet';
import VillageDetails from './VillageDetails';
import Spinner from './Spinner';
import { selectedControlSubdistrictAtom, selectedControlVillageAtom } from '../recoil/selectAtoms';
import { useRecoilState } from 'recoil';
import OpacitySlider from './MapComponents/OpacitySlider';

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

const CompareMap = ({ selectedState, selectedDistrict, selectedSubdistrict, selectedVillage }) => {
  const position = [22.3511148, 78.6677428]; // Central point of India
  const zoom = 5;

  const [boundaryData, setBoundaryData] = useState(null);
  const [lulcTilesUrl, setLulcTilesUrl] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2022');
  const [isLoading, setLoading] = useState(false);
  const [boundaryLoaded, setBoundaryLoaded] = useState(false);
  const [rasterLoaded, setRasterLoaded] = useState(false);
  const [flyToComplete, setFlyToComplete] = useState(false);
  const [controlSubdistrict, setControlSubdistrict] = useRecoilState(selectedControlSubdistrictAtom);
  const [controlVillage, setControlVillage] = useRecoilState(selectedControlVillageAtom);

  const [lulcOpacity, setLulcOpacity] = useState(1);

  // Function to handle year change from the dropdown
  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption.value);
  };

  // Initial fetch for control village data when intervention village is selected
  useEffect(() => {
    if (selectedDistrict && selectedState && selectedVillage) {
      setLoading(true);
      setBoundaryLoaded(false);
      setRasterLoaded(false);
      setFlyToComplete(false);

      const districtValue = selectedDistrict.value;
      const subdistrictValue = selectedSubdistrict.label;
      const villageValue = selectedVillage.label;

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
      
      console.log('Fetching control village with:', {
        state: selectedState,
        district: districtValue,
        subdistrict: subdistrictValue,
        villageName: villageName,
        villageId: villageId
      });

      // Pass the ID to get_control_village if available
      get_control_village(selectedState, districtValue, subdistrictValue, villageValue, villageId)
        .then(data => {
          const controlSubdistrict = data.properties.subdistric;
          const controlVillageName = data.properties.village_na;
          setBoundaryData(data);
          setControlSubdistrict({ label: controlSubdistrict, value: controlSubdistrict });
          setControlVillage({ label: controlVillageName, value: controlVillageName });

          return get_lulc_raster(selectedState, districtValue, controlSubdistrict, controlVillageName, selectedYear);
        })
        .then(data => {
          setLulcTilesUrl(data.tiles_url);
          setRasterLoaded(true);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setBoundaryData(null);
          setLulcTilesUrl(null);
          setBoundaryLoaded(true);
          setRasterLoaded(true);
        });
    } else {
      setBoundaryData(null);
      setLulcTilesUrl(null);
      setLoading(false);
    }
  }, [selectedState, selectedDistrict, selectedSubdistrict, selectedVillage, selectedYear]);

  // Fetch boundary and LULC data when control village is updated via dropdown
  useEffect(() => {
    if (controlVillage?.value && selectedState && selectedDistrict && selectedSubdistrict) {
      setLoading(true);

      const districtValue = selectedDistrict.value;
      const controlSubdistrictName = controlSubdistrict.label;
      const controlVillageName = controlVillage.label;
      
      // Extract control village ID if present in the format "name - id"
      let controlVillageId = null;
      let controlVillageNameClean = controlVillageName;
      
      if (controlVillageName && controlVillageName.includes(' - ')) {
        const parts = controlVillageName.split(' - ');
        controlVillageNameClean = parts[0];
        if (parts.length > 1) {
          controlVillageId = parts[1];
        }
      }
      
      // Also check if the control village object has a value property that might contain the ID
      if (!controlVillageId && controlVillage?.value && controlVillage.value !== controlVillage.label) {
        controlVillageId = controlVillage.value;
      }

      get_lulc_raster(selectedState, districtValue, controlSubdistrictName, controlVillageName, selectedYear)
        .then(data => {
          setLulcTilesUrl(data.tiles_url);
          setRasterLoaded(true);
        })
        .catch(error => {
          console.error('Error fetching new control village LULC data:', error);
          setLulcTilesUrl(null);
          setRasterLoaded(true);
        });

      // Pass the control village ID when available
      get_boundary_data(selectedState, districtValue, controlSubdistrictName, controlVillageName, controlVillageId)
        .then(data => {
          console.log("Boundary data received:", data);
          if (controlSubdistrictName && controlVillageName) {
            // Use clean name for matching if we extracted an ID
            const nameToMatch = controlVillageNameClean || controlVillageName;
            
            const villageFeature = data.features.find(
              feature => feature.properties.village_na.toLowerCase().trim() === nameToMatch.toLowerCase().trim()
            );
            if (villageFeature) {
              setBoundaryData({ ...data, features: [villageFeature] });
            } else {
              setBoundaryData(null);
            }
          } else {
            setBoundaryData(data);
          }
          setBoundaryLoaded(true);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching the GeoJSON data:', error);
          setBoundaryLoaded(true); // Even if there's an error, we need to stop loading
          setLoading(false);
        });
    }
  }, [controlVillage, selectedState, selectedDistrict, selectedSubdistrict, selectedYear]);

  useEffect(() => {
    if (boundaryLoaded && rasterLoaded && flyToComplete) {
      setLoading(false);
    }
  }, [boundaryLoaded, rasterLoaded, flyToComplete]);


  const normalStyle = {
    color: '#4a83ec',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.1
  };

  const onEachFeature = (feature, layer) => {
    layer.setStyle(normalStyle);
  };

  const handleBoundaryLoad = () => {
    setBoundaryLoaded(true);
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && <Spinner />}
      <div className="absolute top-0 left-10 z-[9999] m-4">
        <YearDropdown selectedYear={selectedYear} onChange={handleYearChange} />
      </div>
      <div className='absolute top-5 left-40 z-[9999] bg-white pl-10 pr-10 rounded-lg shadow-lg bg-opacity-70'>
        <VillageDetails
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          selectedSubdistrict={controlSubdistrict}
          selectedVillage={controlVillage}
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
              <TileLayer
                url={lulcTilesUrl}
                opacity={lulcOpacity}
              />
            </LayersControl.Overlay>
          )}
          {boundaryData && (
            <LayersControl.Overlay checked name="Village Boundaries">
              <GeoJSON
                key={JSON.stringify(boundaryData)}
                data={boundaryData}
                style={normalStyle}
                onEachFeature={onEachFeature}
                eventHandlers={{
                  add: handleBoundaryLoad,
                }}
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

CompareMap.propTypes = {
  selectedState: PropTypes.string,
  selectedDistrict: PropTypes.object,
  selectedSubdistrict: PropTypes.object,
  selectedVillage: PropTypes.object,
};

export default CompareMap;