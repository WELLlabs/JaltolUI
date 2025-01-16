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

const DistrictMap = ({ selectedState, selectedDistrict, selectedSubdistrict, selectedVillage, scrollRef }) => {
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
    const years = ['2019', '2020', '2021', '2022'];
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

  useEffect(() => {
    setLoading(true);
    setBoundaryLoaded(false);
    setRasterLoaded(false);
    setFlyToComplete(false);

    if (selectedDistrict && selectedState) {
      const districtValue = selectedDistrict.value;
      const subdistrictValue = selectedSubdistrict?.label || null;
      const villageValue = selectedVillage?.label || null;

      // Fetch boundary data
      get_boundary_data(selectedState, districtValue, subdistrictValue, villageValue)
        .then(data => {
          if (selectedSubdistrict && selectedVillage) {
            const villageFeature = data.features.find(
              feature => feature.properties.village_na.toLowerCase().trim() === villageValue.toLowerCase().trim()
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
        })
        .catch(error => {
          console.error('Error fetching the GeoJSON data:', error);
          setBoundaryLoaded(true);
        });

      // Fetch LULC raster data
      get_lulc_raster(selectedState, districtValue, subdistrictValue, villageValue, selectedYear)
        .then(data => {
          setLulcTilesUrl(data.tiles_url);
          setRasterLoaded(true);
        })
        .catch(error => {
          console.error('Error fetching the LULC raster data:', error);
          setRasterLoaded(true);
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
    const villageName = selectedVillage?.label || selectedVillage;
    if (feature.properties.village_na && 
        feature.properties.village_na.toLowerCase().trim() === (villageName || '').toLowerCase().trim()) {
      layer.setStyle(highlightStyle);
    } else {
      layer.setStyle(normalStyle);
    }
  };

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
        <YearDropdown selectedYear={selectedYear} onChange={handleYearChange} />
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
            disabled={!lulcTilesUrl || !selectedVillage || isDownloading}
            className={`${
              lulcTilesUrl && selectedVillage && !isDownloading
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-all duration-200`}
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
            disabled={!selectedVillage || isLoading}
            className={`${
              selectedVillage && !isLoading
                ? 'bg-purple-500 hover:bg-purple-600'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white font-bold py-2 px-4 rounded flex items-center gap-2`}
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
              setCompareVillagesClicked(true);
              if (scrollRef?.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
          >
            Compare Villages
          </button>
        </div>
      </div>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
          console.log('Map instance created:', mapInstance);
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
};

export default DistrictMap;