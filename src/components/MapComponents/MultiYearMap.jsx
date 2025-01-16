import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

// Mini legend component for each map
const MiniLegend = () => {
  const map = useMap();

  React.useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      const labels = [
        { color: "#397d49", label: "Tree/Forests" },
        { color: "#8b9dc3", label: "Single cropping" },
        { color: "#222f5b", label: "Double cropping" },
        { color: "#946b2d", label: "Shrub/Scrub" }
      ];

      let legendHtml = '<div style="font-size:12px; margin-bottom:3px; color: black;">';
      labels.forEach(item => {
        legendHtml +=
          `<div style="display: flex; align-items: center; margin-bottom: 2px;">` +
          `<i style="width: 12px; height: 12px; background:${item.color}; margin-right: 4px;"></i>` +
          `<span style="font-size: 10px;">${item.label}</span>` +
          `</div>`;
      });
      legendHtml += '</div>';

      div.innerHTML = legendHtml;
      div.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      div.style.padding = '4px 6px';
      div.style.borderRadius = '4px';
      div.style.fontSize = '10px';
      return div;
    };

    legend.addTo(map);
    return () => legend.remove();
  }, [map]);

  return null;
};

// FlyTo component for each map
const FlyToFeature = ({ boundaryData }) => {
  const map = useMap();

  React.useEffect(() => {
    if (boundaryData) {
      const geoJsonLayer = L.geoJSON(boundaryData);
      const bounds = geoJsonLayer.getBounds();
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [boundaryData, map]);

  return null;
};

FlyToFeature.propTypes = {
  boundaryData: PropTypes.object,
};



const MultiYearMap = ({ 
  isOpen, 
  onClose, 
  boundaryData,
  lulcData 
}) => {
  const years = ['2019', '2020', '2021', '2022'];
  const position = [22.3511148, 78.6677428];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">
            Year-wise Land Use Land Cover Analysis
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 h-full">
            {years.map((year) => (
              <div key={year} className="relative h-[400px] border rounded-lg overflow-hidden shadow-lg">
                <div className="absolute top-2 left-12 z-[1000] bg-white px-3 py-1 rounded-full shadow-md font-semibold text-black">
                  {year}
                </div>
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='&copy; Google Maps'
                  />
                  {lulcData[year] && (
                    <TileLayer
                      url={lulcData[year]}
                      opacity={1}
                      crossOrigin={true}
                      className="lulc-layer-only"
                      zIndex={1000}
                    />
                  )}
                  {boundaryData && (
                    <GeoJSON
                      data={boundaryData}
                      style={{
                        color: '#FF4433',
                        weight: 2,
                        fillColor: '#1a1d62',
                        fillOpacity: 0.1,
                      }}
                    />
                  )}
                  <FlyToFeature boundaryData={boundaryData} />
                  <MiniLegend />
                </MapContainer>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

MultiYearMap.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  boundaryData: PropTypes.object,
  lulcData: PropTypes.objectOf(PropTypes.string).isRequired
};

MultiYearMap.defaultProps = {
  boundaryData: null,
};

export default MultiYearMap;