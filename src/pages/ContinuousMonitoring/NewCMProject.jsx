import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const NewCMProject = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
  });
  const [files, setFiles] = useState({
    wells: null,
    interventions: null,
    static: null,
    timeseries: null,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (fileType, e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        setErrors(prev => ({
          ...prev,
          [fileType]: 'Please upload a CSV file'
        }));
        return;
      }
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [fileType]: 'File size must be less than 10MB'
        }));
        return;
      }
      setFiles(prev => ({ ...prev, [fileType]: file }));
      setErrors(prev => ({ ...prev, [fileType]: '' }));
    }
  };

  const handleRemoveFile = (fileType) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
    // Reset the file input
    const input = document.getElementById(`file-${fileType}`);
    if (input) input.value = '';
  };

  const downloadSample = (fileType) => {
    // For now, trigger download of sample files from public/samples/
    const sampleFiles = {
      wells: '/samples/wells_sample.csv',
      interventions: '/samples/interventions_sample.csv',
      static: '/samples/static_sample.csv',
      timeseries: '/samples/timeseries_sample.csv',
    };
    
    const link = document.createElement('a');
    link.href = sampleFiles[fileType];
    link.download = `${fileType}_sample.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    // At least one CSV file must be uploaded
    if (!files.wells && !files.interventions && !files.static && !files.timeseries) {
      newErrors.general = 'Please upload at least one CSV file';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock project ID
      const mockProjectId = 'cm-' + Date.now();
      
      console.log('Creating CM project:', {
        ...formData,
        files: Object.keys(files).filter(k => files[k])
      });
      
      // Navigate to project page (will be created later)
      navigate(`/cm/${mockProjectId}`);
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ general: 'Failed to create project. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Continuous Monitoring Project</h1>
            <p className="text-gray-600">
              Upload your well and intervention data to create a monitoring dashboard. You can add more data later.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Groundwater Monitoring - District XYZ"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your monitoring project..."
              />
            </div>

            {/* Public Toggle */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <label htmlFor="isPublic" className="font-medium text-gray-900 cursor-pointer">
                  Make this project public
                </label>
                <p className="text-sm text-gray-600">
                  Public projects can be viewed by anyone with the link
                </p>
              </div>
            </div>

            {/* CSV Uploads */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Data Files</h2>
              <p className="text-sm text-gray-600 mb-6">
                Upload up to 4 CSV files. Download sample files to see the required format.
              </p>

              <div className="space-y-4">
                {/* Wells CSV */}
                <FileUploadCard
                  title="Wells Static Data"
                  description="Monitoring Well Details (ID, name, latitude, longitude)"
                  fileType="wells"
                  file={files.wells}
                  error={errors.wells}
                  onFileChange={handleFileChange}
                  onRemove={handleRemoveFile}
                  onDownloadSample={downloadSample}
                />

                {/* Interventions CSV */}
                <FileUploadCard
                  title="Interventions Static Data"
                  description="Intervention details (id, type, date, latitude, longitude)"
                  fileType="interventions"
                  file={files.interventions}
                  error={errors.interventions}
                  onFileChange={handleFileChange}
                  onRemove={handleRemoveFile}
                  onDownloadSample={downloadSample}
                />

                {/* Static Data CSV */}
                <FileUploadCard
                  title="Well Time Series"
                  description="Well Time Series Data (timestamp, water level, well id)"
                  fileType="static"
                  file={files.static}
                  error={errors.static}
                  onFileChange={handleFileChange}
                  onRemove={handleRemoveFile}
                  onDownloadSample={downloadSample}
                />

                {/* Time Series CSV */}
                <FileUploadCard
                  title="Intervention Time Series Data"
                  description="Intervention Time Series Data (timestamp, intervention type, intervention id, value)"
                  fileType="timeseries"
                  file={files.timeseries}
                  error={errors.timeseries}
                  onFileChange={handleFileChange}
                  onRemove={handleRemoveFile}
                  onDownloadSample={downloadSample}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Creating Project...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// File Upload Card Component
const FileUploadCard = ({ title, description, fileType, file, error, onFileChange, onRemove, onDownloadSample }) => {
  return (
    <div className={`border rounded-lg p-4 ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onDownloadSample(fileType)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center whitespace-nowrap"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Sample
        </button>
      </div>

      {file ? (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-700">{file.name}</span>
            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            type="button"
            onClick={() => onRemove(fileType)}
            className="text-red-600 hover:text-red-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <label
          htmlFor={`file-${fileType}`}
          className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer transition-colors"
        >
          <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
          <input
            type="file"
            id={`file-${fileType}`}
            accept=".csv"
            onChange={(e) => onFileChange(fileType, e)}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default NewCMProject;





