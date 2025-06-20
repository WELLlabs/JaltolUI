import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from 'recoil';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';

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

// Get Google Client ID from environment variable or use a placeholder
const GOOGLE_CLIENT_ID = import.meta.env.NEW_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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