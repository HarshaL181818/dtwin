import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import Visualization from "./component/MapComponent/Visualization";
import Module1 from "./component/MapComponent/Module1";
import Pollution from "./component/AnalysisComponent/Pollution";
import Traffic from "./component/AnalysisComponent/Traffic";
import PollutionControl from "./component/MapComponent/PollutionControl";
import Traf from "./component/MapComponent/Traf";
import RoutManager from "./component/MapComponent/RoutManager";
import './App.css'
import RoutManagerr from "./component/MapComponent/RoutManager";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} /> 
        <Route path="/about" element={<AboutPage />} /> 
        <Route path="/contact" element={<ContactPage />} /> 
        <Route path="/features/visualization" element={<Visualization />} /> 
        <Route path="/features/module1" element={<Module1 />} />
        <Route path="/features/visualization" element={<Visualization />} /> 
        <Route path="/features/visualization/pollution" element={<Pollution />} />
        <Route path="/features/visualization/traffic" element={<Traffic />} />
        <Route path="/poll" element={<PollutionControl />} />
        <Route path="/traf" element={<Traf />} />
        <Route path="/help" element={<RoutManager />} />
      </Routes>    
    </Router>
  );
}

export default App;

