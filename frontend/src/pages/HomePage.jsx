import React from "react";
import Navbar from "../component/Navbar/Navbar";
import CitySceneCanvas from "../CityCanvas";
import '../assets/styles/homepage.css'

const HomePage = () => {
  return (
    <div>
      <div id="canvas-container">
        <CitySceneCanvas />
        <div id="gradient-overlay"></div>
        <div id="content-overlay">
            <Navbar />
          <div>
            <h1>Digital Twin for Better City Planning</h1>
            <p>Experience real-time insights for urban design and management.</p>
            <button style={{ padding: "10px 20px", fontSize: "16px", marginTop: "10px" }}>
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;