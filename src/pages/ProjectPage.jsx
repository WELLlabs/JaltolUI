import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Landscape View Components
import LandscapeView from '../components/LandscapeView';

const ProjectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get project data from URL parameters
    const projectId = searchParams.get('projectId');
    const projectName = searchParams.get('name');
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const village = searchParams.get('village');

    if (projectId) {
      // Reconstruct project data from URL parameters
      const projectData = {
        project_id: projectId,
        name: projectName || 'Project Details',
        state: state || '',
        district: district || '',
        village: village || '',
        // Add other fields as needed
      };
      setProject(projectData);
    }

    setLoading(false);
  }, [isAuthenticated, navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container ml-0 px-3 py-3">
            <div className="flex items-center justify-start gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors ml-0"
              >
                ← 
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {project?.name || 'Project Details'}
              </h1>
              {project && (
                <p className="text-gray-600 mt-1 no-wrap">
                  {project.village && project.district ? `${project.village}, ${project.district}` : 'Project Location'}
                </p>
              )}
            </div>              
          </div>
        </div>

        {/* Landscape View */}
        <LandscapeView project={project} />
      </div>

      <Footer />
    </div>
  );
};

export default ProjectPage;
