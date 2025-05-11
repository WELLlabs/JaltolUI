import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { circlesSummaryAtom } from '../recoil/selectAtoms';

const CirclesOverlay = ({ circles }) => {
  const map = useMap();
  // Always call the hook, then use conditional logic with the result
  const recoilCircles = useRecoilValue(circlesSummaryAtom);
  const circlesSummary = circles || recoilCircles;

  useEffect(() => {
    // Clear existing circles
    const clearLayers = () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle && layer.options.className === 'control-circle') {
          map.removeLayer(layer);
        }
      });
    };
    
    // Clear existing circles first
    clearLayers();
    
    // Add new circles if data exists
    if (circlesSummary && circlesSummary.center_points && circlesSummary.radius_meters) {
      const circlesLayer = L.layerGroup();
      
      // Create a circle for each center point
      circlesSummary.center_points.forEach(point => {
        const circle = L.circle(
          [point.center_y, point.center_x], // Note: Leaflet uses [lat, lng] order
          {
            radius: circlesSummary.radius_meters,
            fillColor: '#ffffff',
            fillOpacity: 0.6,
            color: '#ff0000',
            weight: 2,
            className: 'control-circle',
            interactive: true
          }
        );
        
        // Add a popup with information
        circle.bindPopup(`<div>
          <strong>Circle ID:</strong> ${point.id}<br>
          <strong>Radius:</strong> ${circlesSummary.radius_meters.toFixed(2)} meters
        </div>`);
        
        circlesLayer.addLayer(circle);
      });
      
      // If there are more circles than shown in the summary
      if (circlesSummary.count > circlesSummary.center_points.length) {
        console.log(`Note: ${circlesSummary.count - circlesSummary.center_points.length} more circles exist but are not displayed`);
      }
      
      // Add the layer to the map
      map.addLayer(circlesLayer);
    }
    
    return () => {
      clearLayers();
    };
  }, [map, circlesSummary]);

  return null;
};

CirclesOverlay.propTypes = {
  circles: PropTypes.object
};

export default CirclesOverlay; 