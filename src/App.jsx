import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from 'recoil';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Import pages
import Homepage from "./pages/Homepage";
import ImpactAssessmentPage from "./pages/Impactpage";
import CompareVillagesPage from "./pages/CompareVillagespage";
// import AboutUsPage from "./pages/AboutUspage";
import IndiaSATPage from "./pages/Mapspage";
import MethodologyPage from "./pages/Methodologypage";
import ScrollToTop from './components/ScrollToTop';
import ApiDocumentationPage from "./pages/ApiDocumentationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PricingPage from "./pages/PricingPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import MyProjectsPage from "./pages/MyProjectsPage";

// Import components
import ProtectedRoute from './components/ProtectedRoute';

// Loading component
const AppLoading = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading application...</p>
    </div>
  </div>
);

function App() {
  const [googleClientId, setGoogleClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Google OAuth2 client ID from backend
  useEffect(() => {
    const fetchGoogleConfig = async () => {
      try {
        const API_URL = 'https://app.jaltol.app/api';
        const response = await axios.get(`${API_URL}/auth/google/config/`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        
        setGoogleClientId(response.data.client_id);
        console.log('Google OAuth2 client ID loaded:', response.data.client_id);
      } catch (error) {
        console.error('Failed to load Google OAuth2 config:', error);
        setError('Failed to load Google authentication configuration');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoogleConfig();
  }, []);

  // Show loading screen while fetching Google config
  if (loading) {
    return <AppLoading />;
  }

  // Show error if Google config failed to load
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-800 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Only render the app if we have the Google client ID
  if (!googleClientId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-yellow-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-800">Google authentication is not available</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <RecoilRoot>
        <AuthProvider>
          <Router>
            <div className="App">
              <ScrollToTop />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Homepage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes */}
                <Route path="/profile-setup" element={
                  <ProtectedRoute>
                    <ProfileSetupPage />
                  </ProtectedRoute>
                } />
                <Route path="/pricing" element={
                  <ProtectedRoute>
                    <PricingPage />
                  </ProtectedRoute>
                } />
                <Route path="/my-projects" element={
                  <ProtectedRoute>
                    <MyProjectsPage />
                  </ProtectedRoute>
                } />
                
                {/* Main application routes */}
                <Route path="/impact-assessment" element={<ImpactAssessmentPage />} />
                <Route path="/compare-villages" element={<CompareVillagesPage />} />
                <Route path="/methodology" element={<MethodologyPage />} />
                <Route path="/maps-page" element={<IndiaSATPage />} />
                <Route path="/api-documentation" element={<ApiDocumentationPage />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </RecoilRoot>
    </GoogleOAuthProvider>
  );
}

export default App;