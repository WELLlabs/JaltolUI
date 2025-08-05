import PropTypes from 'prop-types';
import { useMap } from 'react-leaflet';
import html2canvas from 'html2canvas';

const DownloadControl = ({ selectedVillage, selectedYear }) => {
  const map = useMap();

  const handleDownload = () => {
    if (!selectedVillage) return;

    const mapContainer = map.getContainer();
    const baseLayers = mapContainer.querySelectorAll('.leaflet-tile-pane > .leaflet-layer');
    const overlayPane = mapContainer.querySelector('.leaflet-overlay-pane');
    const controls = mapContainer.querySelector('.leaflet-control-container');

    // Store original states
    const baseLayerStates = Array.from(baseLayers).map(layer => layer.style.opacity);
    const overlayState = overlayPane?.style.opacity;
    const controlsState = controls?.style.display;

    // Hide everything except LULC
    baseLayers.forEach((layer, index) => {
      if (index === 1) {
        layer.style.opacity = '1';
      } else {
        layer.style.opacity = '0';
      }
    });
    if (overlayPane) overlayPane.style.opacity = '0';
    if (controls) controls.style.display = 'none';

    html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    }).then(canvas => {
      // Restore original states
      baseLayers.forEach((layer, index) => {
        layer.style.opacity = baseLayerStates[index];
      });
      if (overlayPane) overlayPane.style.opacity = overlayState;
      if (controls) controls.style.display = controlsState;

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `LULC_${selectedVillage.label}_${selectedYear}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    });
  };

  return (
    <>
      {/* Commented out download LULC button as it's not properly downloading
      <button
        onClick={handleDownload}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Download LULC
      </button>
      */}
    </>
  );
};

DownloadControl.propTypes = {
  selectedVillage: PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  }).isRequired,
  selectedYear: PropTypes.string.isRequired
};

export default DownloadControl;