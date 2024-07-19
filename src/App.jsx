import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import ImpactAssessmentPage from "./pages/Impactpage";
import CompareVillagesPage from "./pages/CompareVillagespage";
// import AboutUsPage from "./pages/AboutUspage";
import IndiaSATPage from "./pages/Mapspage";
import MethodologyPage from "./pages/Methodologypage";
import ScrollToTop from './components/ScrollToTop';
import ApiDocumentationPage from "./pages/ApiDocumentationPage";

function App() {
  return (
    <Router>
      <div className="App">
      <ScrollToTop />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/impact-assessment" element={<ImpactAssessmentPage />} />
          <Route path="/compare-villages" element={<CompareVillagesPage />} />
          <Route path="/methodology" element={<MethodologyPage/>} />
          <Route path="/maps-page" element={<IndiaSATPage/>} />
          <Route path="/api-documentation" element={<ApiDocumentationPage/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
