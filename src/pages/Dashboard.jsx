import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProjects } from '../services/api';

// Stats Card Component
const StatsCard = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700'
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[0]} bg-opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, onClick, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600'
  };

  return (
    <button
      onClick={onClick}
      className={`group p-6 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left w-full`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]} text-white group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

// Redesigned Project Card Component
const ProjectCard = ({ project, onClick }) => {
  const getStatusColor = (project) => {
    // You can customize this based on project status
    return 'bg-green-100 text-green-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const isDemo = project.project_id === 'demo-project';

  return (
    <div
      onClick={() => onClick(project)}
      className={`group bg-white rounded-xl border hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${
        isDemo
          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* Project Image or Placeholder */}
      <div className={`h-32 relative overflow-hidden ${isDemo ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-purple-500'}`}>
        {project.project_image ? (
          <img
            src={project.project_image}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className={`w-12 h-12 opacity-70 ${isDemo ? 'text-white' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isDemo && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Demo
            </span>
          )}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project)}`}>
            Active
          </span>
        </div>
      </div>

      {/* Project Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {project.name}
        </h3>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {project.village}, {project.district}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6" />
            </svg>
            {project.intervention_period_display || 'Period N/A'}
          </div>
        </div>

        {/* Project Type Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {isDemo ? 'Continuous Monitoring' : 'Impact Assessment'}
          </span>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

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

// Demo project data for showcasing
const DEMO_PROJECT = {
  project_id: 'demo-project',
  name: 'Jalodhari - AKRSP',
  state: 'Gujarat',
  district: 'Valsad',
  subdistrict: 'Kaprada',
  village: 'Ozarda',
  control_state: 'Gujarat',
  control_district: 'Valsad',
  control_subdistrict: 'Kaprada',
  control_village: 'Mandva',
  intervention_start_year: '2018',
  intervention_end_year: '2022',
  intervention_period_display: '2018 - 2022',
  intervention_villages: 'Ozarda',
  control_villages: 'Mandva',
  created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
  project_image: null // Will use placeholder
};

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
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
        // Add demo project at the beginning of the list
        setProjects([DEMO_PROJECT, ...response.data]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Even if there's an error, show the demo project
      setProjects([DEMO_PROJECT]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project) => {
    // Handle demo project differently - navigate to project page
    if (project.project_id === 'demo-project') {
      const queryParams = new URLSearchParams({
        projectId: project.project_id,
        name: project.name,
        state: project.state || '',
        district: project.district || '',
        village: project.village || '',
        subdistrict: project.subdistrict || '',
      });
      navigate(`/project?${queryParams.toString()}`);
      return;
    }
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleViewProject = (project) => {
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
    // Prevent deletion of demo project
    if (projectId === 'demo-project') {
      alert('This is a demo project and cannot be deleted. It\'s here to show you what a typical project looks like!');
      return;
    }
    const project = projects.find(p => p.project_id === projectId);
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setIsDeleting(true);
      // Import and use deleteProject function here
      const { deleteProject } = await import('../services/api');
      await deleteProject(projectToDelete.project_id);
      fetchProjects();
      setShowDeleteConfirm(false);
      setShowProjectDetails(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'new-cm-project':
        navigate('/cm/new');
        break;
      case 'new-project':
        navigate('/impact-assessment');
        break;
      case 'view-maps':
        navigate('/maps-page');
        break;
      case 'methodology':
        navigate('/methodology');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome back, {user?.first_name || user?.username}!
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Ready to explore the impact of your interventions? Let's get started with your projects.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                  title="Total Projects"
                  value={projects.length}
                  color="blue"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  }
                />
                <StatsCard
                  title="Active Assessments"
                  value={projects.filter(p => p.intervention_start_year).length}
                  color="green"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatsCard
                  title="This Month"
                  value={projects.filter(p => {
                    const created = new Date(p.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                  color="purple"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Profile Setup Banner */}
          {user && (!user.organization || user.profile_skipped) && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Complete your profile</p>
                    <p className="text-sm text-blue-700">Add your organization and interests to get the most out of Jaltol</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile-setup')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                title="Continuous Monitoring"
                description="Create a new continuous monitoring project"
                color="blue"
                onClick={() => handleQuickAction('new-cm-project')}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
              <QuickActionCard
                title="Impact Assessment"
                description="Create a new impact assessment project"
                color="green"
                onClick={() => handleQuickAction('new-project')}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              />
              <QuickActionCard
                title="Explore Maps"
                description="View satellite imagery and data layers"
                color="purple"
                onClick={() => handleQuickAction('view-maps')}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* My Projects Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
              <button
                onClick={() => handleQuickAction('new-project')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Project</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first impact assessment project.</p>
                <button
                  onClick={() => handleQuickAction('new-project')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.project_id}
                    project={project}
                    onClick={handleProjectClick}
                  />
                ))}
              </div>
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

export default Dashboard;
