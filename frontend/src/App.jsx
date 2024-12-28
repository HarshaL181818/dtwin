import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import Visualization from "./component/MapComponent/Visualization";
// import Module1 from "./component/MapComponent/Module1";
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} /> 
        <Route path="/about" element={<AboutPage />} /> 
        <Route path="/contact" element={<ContactPage />} /> 
        <Route path="/features/Visualization" element={<Visualization />} /> 
        {/* <Route path="/features/module1" element={<Module1 />} />
        <Route path="/features/Visualization" element={<Visualization />} /> 
        <Route path="/features/Visualization/pollution" element={< />} />
        <Route path="/features/Visualization/traffic" element={< />} /> */}
      </Routes>    
    </Router>
  );
}

export default App;

