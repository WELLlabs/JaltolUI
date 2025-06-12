import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from 'recoil';
import { AuthProvider } from './context/AuthContext';

// Import pages
import Homepage from "./pages/Homepage";
import ImpactAssessmentPage from "./pages/Impactpage";
import CompareVillagesPage from "./pages/CompareVillagespage";
import IndiaSATPage from "./pages/Mapspage";
import MethodologyPage from "./pages/Methodologypage";
import ApiDocumentationPage from "./pages/ApiDocumentationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Import components
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
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
  );
}

export default App;