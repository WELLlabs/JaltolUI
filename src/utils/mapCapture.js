import html2canvas from 'html2canvas';

/**
 * Captures the current map view as a base64 image
 * @param {Object} mapRef - Reference to the Leaflet map instance
 * @param {Object} options - Capture options
 * @returns {Promise<string>} Base64 encoded image data
 */
export const captureMapImage = async (mapRef, options = {}) => {
  if (!mapRef?.current) {
    console.error('Map reference is not available');
    throw new Error('Map reference is not available');
  }

  const map = mapRef.current;
  console.log('Map instance:', map);
  
  const mapContainer = map.getContainer();
  console.log('Map container:', mapContainer);
  
  // Make sure the container is visible and has dimensions
  if (!mapContainer.offsetWidth || !mapContainer.offsetHeight) {
    console.error('Map container has no dimensions:', {
      width: mapContainer.offsetWidth,
      height: mapContainer.offsetHeight
    });
    throw new Error('Map container has no dimensions');
  }

  console.log('Map container dimensions:', {
    width: mapContainer.offsetWidth,
    height: mapContainer.offsetHeight
  });

  // Force map size update
  map.invalidateSize();
  
  // Wait for map to settle
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Try different capture targets in order of preference
  const captureTargets = [
    mapContainer.querySelector('.leaflet-map-pane'),
    mapContainer.querySelector('.leaflet-container'),
    mapContainer
  ];
  
  let screenshotTarget = null;
  for (const target of captureTargets) {
    if (target) {
      screenshotTarget = target;
      console.log('Using capture target:', target.className || 'container');
      break;
    }
  }
  
  if (!screenshotTarget) {
    console.error('No suitable capture target found');
    throw new Error('Map capture target not found');
  }

  try {
    console.log('Starting html2canvas capture...');
    
    const canvas = await html2canvas(screenshotTarget, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false, // Disable logging for cleaner console
      scale: options.scale || 1.2, // Good quality without being too large
      width: mapContainer.offsetWidth,
      height: mapContainer.offsetHeight,
      ignoreElements: (element) => {
        // Ignore leaflet controls and attribution
        return element.classList.contains('leaflet-control-container') ||
               element.classList.contains('leaflet-control') ||
               element.classList.contains('leaflet-attribution') ||
               element.classList.contains('leaflet-control-layers');
      },
      onclone: (clonedDoc) => {
        // Ensure the cloned element is visible
        const clonedTarget = clonedDoc.querySelector('.leaflet-map-pane') || 
                           clonedDoc.querySelector('.leaflet-container');
        if (clonedTarget) {
          clonedTarget.style.visibility = 'visible';
          clonedTarget.style.opacity = '1';
        }
      }
    });

    console.log('Canvas created:', {
      width: canvas.width,
      height: canvas.height
    });

    // Convert canvas to base64
    const dataURL = canvas.toDataURL('image/png', options.quality || 0.8);
    console.log('Image data URL created, length:', dataURL.length);
    
    if (dataURL.length < 1000) {
      console.error('Generated image seems too small, might be empty');
      throw new Error('Generated image appears to be empty');
    }
    
    return dataURL;
  } catch (error) {
    console.error('Error during html2canvas capture:', error);
    throw new Error(`Failed to capture map image: ${error.message}`);
  }
};

/**
 * Downloads the captured map image
 * @param {string} dataURL - Base64 image data
 * @param {string} filename - Filename for the download
 */
export const downloadMapImage = (dataURL, filename = 'map_capture.png') => {
  const downloadLink = document.createElement('a');
  downloadLink.href = dataURL;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

/**
 * Gets the map reference from a component that uses useMap hook
 * This is a utility to help with accessing map references
 */
export const getMapFromContainer = (containerElement) => {
  if (!containerElement) return null;
  
  // Try to find the Leaflet map instance from the container
  const mapContainer = containerElement.querySelector('.leaflet-container');
  if (mapContainer && mapContainer._leaflet_id) {
    // Access the map through Leaflet's internal registry
    return window.L?.map?._getMapById?.(mapContainer._leaflet_id) || null;
  }
  
  return null;
}; 