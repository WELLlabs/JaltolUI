import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from 'recoil';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Import pages
import Homepage from "./pages/Homepage";
import ImpactAssessmentPage from "./pages/Impactpage";
import CompareVillagesPage from "./pages/CompareVillagespage";
// import AboutUsPage from "./pages/AboutUspage";
import IndiaSATPage from "./pages/Mapspage";
import MethodologyPage from "./pages/Methodologypage";
import ImpactAssessmentV2 from "./pages/ImpactAssessmentV2";
import AppLayout from './components/AppLayout';
import ScrollToTop from './components/ScrollToTop';
import ApiDocumentationPage from "./pages/ApiDocumentationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PricingPage from "./pages/PricingPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import MyProjectsPage from "./pages/MyProjectsPage";

// Import components
import ImpactAssessmentGate from './components/ImpactAssessmentGate';
import ProtectedRoute from './components/ProtectedRoute';
import PlanSelectionModal from './components/PlanSelectionModal';
import { PostHogIdentifier } from './components/PostHogIdentifier';

// Loading component
const AppLoading = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading application...</p>
    </div>
  </div>
);

// Main app content wrapper that has access to auth context
const AppContent = () => {
  const { showPlanSelection, dismissPlanSelection } = useAuth();

  return (
    <>
      <PostHogIdentifier />
      <div className="App">
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* Protected routes */}
          <Route path="/profile-setup" element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          } />
          <Route path="/my-projects" element={
            <ProtectedRoute>
              <MyProjectsPage />
            </ProtectedRoute>
          } />
          
          {/* Authentication gate */}
          <Route path="/impact-assessment" element={<ImpactAssessmentGate />} />

          {/* Main application routes with layout */}
          <Route element={<AppLayout />}>
            <Route path="/impact-assessment/app" element={<ImpactAssessmentV2 />} />
            <Route path="/compare-villages" element={<CompareVillagesPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/maps-page" element={<IndiaSATPage />} />
            <Route path="/api-documentation" element={<ApiDocumentationPage />} />

            {/* Internal routes for development/testing */}
            <Route path="/internal/impact-assessment-v1" element={<ImpactAssessmentPage />} />
            <Route path="/internal/impact-assessment-v2" element={<ImpactAssessmentV2 />} />
          </Route>
        </Routes>
      </div>

      {/* Plan Selection Modal */}
      <PlanSelectionModal 
        isOpen={showPlanSelection}
        onClose={dismissPlanSelection}
      />
    </>
  );
};

function App() {
  const [googleClientId, setGoogleClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoogleConfig = async () => {
      try {
        // Use the production API URL directly
        const API_URL = 'https://app.jaltol.app/api';
        // const API_URL = 'http://127.0.0.1:8000/api'; // For local development
        
        const response = await axios.get(`${API_URL}/auth/google/config/`);
        
        if (response.data && response.data.client_id) {
          setGoogleClientId(response.data.client_id);
          console.log('Google OAuth client ID loaded successfully');
        } else {
          console.error('Invalid Google config response:', response.data);
          setError('Failed to load Google OAuth configuration');
        }
      } catch (error) {
        console.error('Failed to fetch Google OAuth config:', error.message);
        
        if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
          setError('Network connection failed. Please check your internet connection and try again.');
        } else if (error.response) {
          setError(`Server error: ${error.response.status}. Please try again later.`);
        } else {
          setError('Failed to initialize application. Please refresh the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleConfig();
  }, []);

  if (loading) {
    return <AppLoading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Application Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!googleClientId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-yellow-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h1>
          <p className="text-gray-600">Google OAuth not configured. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <RecoilRoot>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </RecoilRoot>
    </GoogleOAuthProvider>
  );
}

export default App;