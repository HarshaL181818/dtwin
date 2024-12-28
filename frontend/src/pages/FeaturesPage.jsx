import React from 'react';
import Navbar from '../component/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

const FeaturesPage = () => {
  const navigate = useNavigate();

  const handleExplore = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-black mt-5">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-16 text-white">Our Features</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Developing Cities Card */}
          <div className="group perspective-1000">
            <div className="relative transform transition-all duration-500 hover:-translate-y-2">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl opacity-50 blur-lg group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="h-48 mb-6 overflow-hidden rounded-lg">
                  <img 
                    src="/image1.png" 
                    alt="Developing Cities"
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Developing Cities</h2>
                  <p className="text-gray-400">Plan and design new urban areas, with our editor tool. Create sustainable and efficient city layouts.</p>
                  <button
                    onClick={() => handleExplore('/features/module1')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Developed Cities Card */}
          <div className="group perspective-1000">
            <div className="relative transform transition-all duration-500 hover:-translate-y-2">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-50 blur-lg group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="h-48 mb-6 overflow-hidden rounded-lg">
                  <img 
                    src="/image2.png" 
                    alt="Developed Cities"
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Developed Cities</h2>
                  <p className="text-gray-400">Analyze and optimize existing urban environments. Enhance city infrastructure and efficiency.</p>
                  <button
                    onClick={() => handleExplore('/features/visualization')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;