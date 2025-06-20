import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProjects, deleteProject } from '../services/api';

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, projectName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        <div className="bg-red-600 px-6 py-3 flex justify-between items-center rounded-t-lg">
          <h3 className="text-lg font-semibold text-white">Confirm Delete</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            disabled={isDeleting}
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Delete Project</h4>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <span className="font-semibold">&quot;{projectName}&quot;</span>? 
                This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              disabled={isDeleting}
            >
              {isDeleting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  projectName: PropTypes.string.isRequired,
  isDeleting: PropTypes.bool
};

// Project Details Modal Component
const ProjectDetailsModal = ({ project, onClose, onView, onDelete }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="bg-blue-600 px-6 py-3 flex justify-between items-center rounded-t-lg">
          <h3 className="text-lg font-semibold text-white">Project Details: {project.name}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Project Info */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-4 text-gray-900">Intervention:</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-800"><span className="font-medium text-gray-900">State:</span> {project.state}</p>
                  <p className="text-gray-800"><span className="font-medium text-gray-900">District:</span> {project.district}</p>
                  <p className="text-gray-800"><span className="font-medium text-gray-900">SubDistrict:</span> {project.subdistrict}</p>
                  <p className="text-gray-800"><span className="font-medium text-gray-900">Village:</span> {project.village}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-4 text-gray-900">Control:</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-800"><span className="font-medium text-gray-900">State:</span> {project.control_state || project.state}</p>
                  <p className="text-gray-800"><span className="font-medium text-gray-900">District:</span> {project.control_district || project.district}</p>
                  <p className="text-gray-800"><span className="font-medium text-gray-900">SubDistrict:</span> {project.control_subdistrict || 'Auto-selected'}</p>
                  <p className="text-gray-800"><span className="font-medium text-gray-900">Village:</span> {project.control_village || 'Auto-selected'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2 text-gray-900">Intervention Period:</h4>
                <div className="flex space-x-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm">
                    {project.intervention_start_year || 'Not specified'}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm">
                    {project.intervention_end_year || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Project Image */}
            <div className="bg-gray-200 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
              {project.project_image ? (
                <div className="w-full h-full">
                  <img 
                    src={project.project_image} 
                    alt={`${project.name} satellite view`}
                    className="w-full h-full object-cover rounded-lg"
                    style={{ maxHeight: '400px' }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Satellite view of {project.village}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No Project Image</p>
                  <p className="text-xs text-gray-500">Image will be captured when project is saved</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => onView(project)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              View
            </button>
            <button
              onClick={() => onDelete(project.project_id)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes for ProjectDetailsModal
ProjectDetailsModal.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string,
    project_image: PropTypes.string,
    state: PropTypes.string,
    district: PropTypes.string,
    subdistrict: PropTypes.string,
    village: PropTypes.string,
    control_state: PropTypes.string,
    control_district: PropTypes.string,
    control_subdistrict: PropTypes.string,
    control_village: PropTypes.string,
    intervention_start_year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    intervention_end_year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    project_id: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

const MyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, [isAuthenticated, navigate]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      if (response.success) {
        setProjects(response.data);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleViewProject = (project) => {
    // Navigate to impact assessment page with project data pre-populated
    const queryParams = new URLSearchParams({
      shared: 'true',
      state: project.state || '',
      district: project.district || '',
      subdistrict: project.subdistrict || '',
      village: project.village || '',
      projectId: project.project_id
    });
    
    navigate(`/impact-assessment?${queryParams.toString()}`);
  };

  const handleDeleteProject = (projectId) => {
    const project = projects.find(p => p.project_id === projectId);
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteProject(projectToDelete.project_id);
      fetchProjects(); // Refresh the list
      setShowDeleteConfirm(false);
      setShowProjectDetails(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExploreJaltol = () => {
    navigate('/impact-assessment');
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-blue-600 text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold">Welcome to Jaltol {user?.username}.</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Projects</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchProjects}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-6">No Saved Projects Yet</p>
                <button
                  onClick={handleExploreJaltol}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Explore Jaltol
                </button>
              </div>
            ) : (
              <>
                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {projects.map((project) => (
                    <div
                      key={project.project_id}
                      className="bg-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-400 transition-colors"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">Project:</h3>
                          <p className="text-gray-700">{project.name}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900">State:</h4>
                          <p className="text-gray-700">{project.state}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900">District:</h4>
                          <p className="text-gray-700">{project.district}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900">Intervention Village:</h4>
                          <p className="text-gray-700">{project.intervention_villages}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900">Control Village:</h4>
                          <p className="text-gray-700">{project.control_villages}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900">Intervention Period:</h4>
                          <p className="text-gray-700">{project.intervention_period_display}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Explore Jaltol Button */}
                <div className="text-center">
                  <button
                    onClick={handleExploreJaltol}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg"
                  >
                    Explore Jaltol
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Project Details Modal */}
      {showProjectDetails && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setShowProjectDetails(false)}
          onView={handleViewProject}
          onDelete={handleDeleteProject}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDeleteProject}
        projectName={projectToDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MyProjectsPage; 