import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

const Visualization = () => {
  return (
    <div className="min-h-screen text-white mt-5">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-16">City Visualization</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            {/* Pollution Card */}
            <Link 
              to="/features/Visualization/pollution"
              className="group relative transform transition-all duration-500 hover:-translate-y-2 no-underline"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#000B58] to-[#003D73] rounded-2xl opacity-50 blur-lg group-hover:opacity-75 transition duration-500"></div>
              <div
                className="relative bg-[#FFF487] rounded-xl overflow-hidden border border-gray-800 h-full"
                style={{
                  background: 'radial-gradient(ellipse at bottom right, #629584, #E2F1E7)',
                }}
              >
                {/* Image Container */}
                <div className="h-48 overflow-hidden">
                  <img 
                    src="/pollution.jpeg" 
                    alt="City Pollution Visualization"
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {/* Content Container */}
                <div className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <h3 className="text-2xl font-bold text-black">Pollution Analysis</h3>
                    <p className="text-black">Monitor and analyze urban pollution levels with advanced visualization tools.</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Traffic Card */}
            <Link 
              to="/features/Visualization/traffic"
              className="group relative transform transition-all duration-500 hover:-translate-y-2 no-underline"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#000B58] to-[#003D73] rounded-2xl opacity-50 blur-lg group-hover:opacity-75 transition duration-500"></div>
              <div
                className="relative bg-[#FFF487] rounded-xl overflow-hidden border border-gray-800 h-full"
                style={{
                  background: 'radial-gradient(ellipse at bottom right, #629584, #E2F1E7)',
                }}
              >
                {/* Image Container */}
                <div className="h-48 overflow-hidden">
                  <img 
                    src="/routing.jpeg" 
                    alt="Traffic Monitoring System"
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {/* Content Container */}
                <div className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <h3 className="text-2xl font-bold text-black">Traffic Monitoring</h3>
                    <p className="text-black">Track and optimize traffic flow patterns across urban areas.</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
