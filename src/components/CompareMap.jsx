import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { get_control_village, get_lulc_raster } from '../services/api';
import PropTypes from 'prop-types';
import YearDropdown from './MapComponents/YearSelectMap';
import L from 'leaflet';

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
        { color: "#946b2d", label: "Shrub_Scrub" }
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
  }, [map]);  // Ensure it only runs once unless the map instance changes

  return null;
};

function FlyToFeature({ featureData }) {
  const map = useMap();

  useEffect(() => {
    if (featureData) {
      const geoJsonLayer = L.geoJSON(featureData);
      const bounds = geoJsonLayer.getBounds();
      map.flyToBounds(bounds, { padding: [50, 50] });
    }
  }, [featureData, map]);

  return null;
}

FlyToFeature.propTypes = {
  featureData: PropTypes.object,
};

const CompareMap = ({ selectedState, selectedDistrict, selectedSubdistrict, selectedVillage }) => {
  const position = [22.3511148, 78.6677428]; // Central point of India
  const zoom = 5;

  const [boundaryData, setBoundaryData] = useState(null);
  const [lulcTilesUrl, setLulcTilesUrl] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2022');
  
  // Function to handle year change from the dropdown
  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption.value);
  };

  useEffect(() => {
    if (selectedDistrict && selectedState && selectedVillage) {
      // Fetch the boundary data using the selected district
      const districtValue = selectedDistrict.value;
      get_control_village(selectedState, districtValue, selectedSubdistrict, selectedVillage)
      .then(data => {
        const controllVillageName = data.properties.village_na;
        console.log("Boundary data received:", data);
        setBoundaryData(data);
  
        // Fetch the LULC raster data using the selected district and control village name
        return get_lulc_raster(selectedState, districtValue, selectedSubdistrict, controllVillageName, selectedYear);
      })
      .then(data => {
        setLulcTilesUrl(data.tiles_url);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setBoundaryData(null);
        setLulcTilesUrl(null);
      });
  
    } else {
      setBoundaryData(null);
      setLulcTilesUrl(null);
    }
  }, [selectedState, selectedDistrict, selectedSubdistrict, selectedVillage, selectedYear]);


  const normalStyle = {
    color: '#4a83ec',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.1
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 left-10 z-[9999] m-4">
        <YearDropdown selectedYear={selectedYear} onChange={handleYearChange} />
      </div>
      <MapContainer center={position} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                data={boundaryData}
                style={{
                  color: '#4a83ec',
                  weight: 0.5,
                  fillColor: '#1a1d62',
                  fillOpacity: 0.1,
                }}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
        {boundaryData && (
          <FlyToFeature 
          featureData={boundaryData}
          style={normalStyle}
          />
        )}
        <Legend />
      </MapContainer>
    </div>
  );
};

CompareMap.propTypes = {
  selectedState: PropTypes.string,
  selectedDistrict: PropTypes.string,
  selectedSubdistrict: PropTypes.string,
  selectedVillage: PropTypes.string,
};

export default CompareMap;
