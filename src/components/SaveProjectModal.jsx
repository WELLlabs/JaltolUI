import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { captureMapImage } from '../utils/mapCapture';

const SaveProjectModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  projectData = {}, 
  isLoading = false,
  mapRefs = {},
  selectedVillage,
  compareMode = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    intervention_start_year: '',
    intervention_end_year: '',
  });
  const [errors, setErrors] = useState({});
  const [capturingImage, setCapturingImage] = useState(false);
  const [imageCapture, setImageCapture] = useState({ success: false, error: null });
  const [captureCountdown, setCaptureCountdown] = useState(0);

  // Reset form when modal opens with new project data
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: projectData.name || '',
        description: projectData.description || '',
        intervention_start_year: projectData.intervention_start_year || '',
        intervention_end_year: projectData.intervention_end_year || '',
        ...projectData
      });
      setErrors({});
      setImageCapture({ success: false, error: null });
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to reset body scroll
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, projectData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (formData.intervention_start_year && formData.intervention_end_year) {
      const startYear = parseInt(formData.intervention_start_year);
      const endYear = parseInt(formData.intervention_end_year);
      
      if (startYear >= endYear) {
        newErrors.intervention_end_year = 'End year must be after start year';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const captureCurrentMapImage = async () => {
    try {
      setCapturingImage(true);
      setImageCapture({ success: false, error: null });
      
      console.log('Starting map image capture...');
      console.log('Available map refs:', Object.keys(mapRefs));
      console.log('Map refs details:', {
        districtMap: mapRefs.districtMap?.current ? 'HAS_MAP' : 'NO_MAP',
        interventionMap: mapRefs.interventionMap?.current ? 'HAS_MAP' : 'NO_MAP',
        compareMap: mapRefs.compareMap?.current ? 'HAS_MAP' : 'NO_MAP'
      });
      
      // Determine which map to capture based on mode and availability
      let mapRef = null;
      let mapName = '';
      
      if (compareMode && mapRefs.interventionMap?.current) {
        // In compare mode, capture the intervention map
        mapRef = mapRefs.interventionMap;
        mapName = 'intervention map';
      } else if (mapRefs.districtMap?.current) {
        // Default to district map
        mapRef = mapRefs.districtMap;
        mapName = 'district map';
      } else if (mapRefs.interventionMap?.current) {
        // Fallback to intervention map
        mapRef = mapRefs.interventionMap;
        mapName = 'intervention map (fallback)';
      } else if (mapRefs.compareMap?.current) {
        // Last resort: compare map
        mapRef = mapRefs.compareMap;
        mapName = 'compare map (fallback)';
      }
      
      if (!mapRef?.current) {
        console.error('No map reference available for image capture');
        console.error('Map ref details:', {
          selectedMapRef: mapRef,
          hasCurrentProperty: Object.prototype.hasOwnProperty.call(mapRef, 'current'),
          currentValue: mapRef?.current
        });
        setImageCapture({ success: false, error: 'No map available for capture' });
        return null;
      }

      console.log(`Capturing image from ${mapName}...`);
      console.log('Map instance details:', {
        mapInstance: mapRef.current,
        hasGetContainer: typeof mapRef.current.getContainer === 'function'
      });
      
      // Wait for LULC and boundary data to fully load (10 seconds)
      console.log('Waiting 10 seconds for LULC and boundary data to fully load...');
      
      // Show countdown to user
      setCaptureCountdown(10);
      for (let i = 10; i > 0; i--) {
        setCaptureCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCaptureCountdown(0);
      
      console.log('Proceeding with image capture after 10-second delay');
      
      // Validate that both boundary and LULC layers are loaded
      const mapInstance = mapRef.current;
      const mapContainer = mapInstance.getContainer();
      const boundaryLayer = mapContainer.querySelector('.leaflet-overlay-pane svg');
      const lulcLayer = mapContainer.querySelector('.leaflet-tile-pane img');
      
      console.log('Layer validation:', {
        hasBoundaryLayer: !!boundaryLayer,
        hasLulcLayer: !!lulcLayer,
        boundaryElements: mapContainer.querySelectorAll('.leaflet-overlay-pane svg').length,
        lulcElements: mapContainer.querySelectorAll('.leaflet-tile-pane img').length
      });
      
      const imageData = await captureMapImage(mapRef, {
        scale: 1.2, // Good quality without being too large
        quality: 0.8
      });
      
      if (imageData) {
        console.log('Image captured successfully, size:', imageData.length);
        setImageCapture({ success: true, error: null });
        return imageData;
      } else {
        console.error('Image capture returned null');
        setImageCapture({ success: false, error: 'Failed to capture image' });
        return null;
      }
    } catch (error) {
      console.error('Error capturing map image:', error);
      setImageCapture({ success: false, error: error.message || 'Failed to capture image' });
      return null;
    } finally {
      setCapturingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Capture map image if village is selected
    let projectImage = null;
    if (selectedVillage) {
      console.log('Attempting to capture map image...');
      projectImage = await captureCurrentMapImage();
      
      if (projectImage) {
        console.log('Map image captured successfully for project save');
      } else {
        console.warn('Failed to capture map image, but continuing with project save');
      }
    }
    
    const projectPayload = {
      ...formData,
      project_type: 'village',
      project_image: projectImage // Include the captured image
    };
    
    console.log('Saving project with payload:', { ...projectPayload, project_image: projectImage ? 'IMAGE_DATA_PRESENT' : 'NO_IMAGE' });
    onSave(projectPayload);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading && !capturingImage) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl">
        {/* Blue Header */}
        <div className="bg-blue-600 px-6 py-3 flex justify-between items-center rounded-t-lg">
          <h3 className="text-lg font-semibold text-white">Save Project</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            disabled={isLoading || capturingImage}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Capturing Image Status */}
          {capturingImage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div>
                  <span className="text-sm font-medium">
                    {captureCountdown > 0 
                      ? `Waiting for map data to load... ${captureCountdown}s`
                      : 'Capturing satellite image...'
                    }
                  </span>
                  {captureCountdown > 0 && (
                    <p className="text-xs mt-1 text-blue-600">
                      Ensuring LULC and boundary data are properly synchronized
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Image Capture Success/Error Messages */}
          {imageCapture.success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Satellite image captured successfully!</span>
              </div>
            </div>
          )}

          {imageCapture.error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <span className="text-sm font-medium">Image capture failed</span>
                  <p className="text-xs mt-1">{imageCapture.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter project name"
              disabled={isLoading || capturingImage}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
              placeholder="Optional project description"
              disabled={isLoading || capturingImage}
            />
          </div>

          {/* Intervention Details - Read Only */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Intervention Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">State:</span> {formData.state || 'Not specified'}</p>
              <p><span className="font-medium">District:</span> {formData.district || 'Not specified'}</p>
              <p><span className="font-medium">SubDistrict:</span> {formData.subdistrict || 'Not specified'}</p>
              <p><span className="font-medium">Village:</span> {formData.village || 'Not specified'}</p>
            </div>
          </div>

          {/* Control Village Details - Read Only */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Control Village</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">State:</span> {formData.control_state || formData.state || 'Auto-selected'}</p>
              <p><span className="font-medium">District:</span> {formData.control_district || formData.district || 'Auto-selected'}</p>
              <p><span className="font-medium">SubDistrict:</span> {formData.control_subdistrict || 'Auto-selected'}</p>
              <p><span className="font-medium">Village:</span> {formData.control_village || 'Auto-selected'}</p>
            </div>
          </div>

          {/* Intervention Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="intervention_start_year" className="block text-sm font-medium text-gray-700 mb-1">
                Start Year
              </label>
              <input
                type="number"
                id="intervention_start_year"
                name="intervention_start_year"
                value={formData.intervention_start_year}
                onChange={handleChange}
                min="2000"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="2014"
                disabled={isLoading || capturingImage}
              />
            </div>
            <div>
              <label htmlFor="intervention_end_year" className="block text-sm font-medium text-gray-700 mb-1">
                End Year
              </label>
              <input
                type="number"
                id="intervention_end_year"
                name="intervention_end_year"
                value={formData.intervention_end_year}
                onChange={handleChange}
                min="2000"
                max="2030"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
                  errors.intervention_end_year ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="2017"
                disabled={isLoading || capturingImage}
              />
              {errors.intervention_end_year && (
                <p className="mt-1 text-sm text-red-600">{errors.intervention_end_year}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isLoading || capturingImage}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              disabled={isLoading || capturingImage}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

SaveProjectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  projectData: PropTypes.object,
  isLoading: PropTypes.bool,
  mapRefs: PropTypes.object,
  selectedVillage: PropTypes.object,
  compareMode: PropTypes.bool
};

export default SaveProjectModal; 