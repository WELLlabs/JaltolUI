import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import ImpactAssessmentPage from "./pages/Impactpage";
import CompareVillagesPage from "./pages/CompareVillagespage";
import AboutUsPage from "./pages/AboutUspage";
import IndiaSATPage from "./pages/Mapspage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/impact-assessment" element={<ImpactAssessmentPage />} />
          <Route path="/compare-villages" element={<CompareVillagesPage />} />
          <Route path="/about-us" element={<AboutUsPage/>} />
          <Route path="/maps-page" element={<IndiaSATPage/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
