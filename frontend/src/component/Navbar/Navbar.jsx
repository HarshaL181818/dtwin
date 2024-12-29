import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../../assets/styles/navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const mainSection = location.pathname.split("/")[1] || "home";
    setActiveSection(mainSection);
  }, [location.pathname]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
    navigate(section === "home" ? "/" : `/${section}`);
  };

  return (
    <nav className="bg-[#181C14] custom-navbar flex items-center justify-between px-10 h-20">
      <div 
        className="text-white text-2xl font-bold tracking-wide cursor-pointer hover:scale-105 transform transition-all duration-300 navbar-name"
        onClick={() => handleSectionClick("home")}
      >
        EcoTwin
      </div>
      
      <ul className="flex justify-end space-x-10">
        {["home", "features", "about", "contact"].map((section) => (
          <li key={section} className="list-none">
            <span
              onClick={() => handleSectionClick(section)}
              className={`
                no-underline
                decoration-0
                border-none
                cursor-pointer
                text-white 
                text-lg 
                font-semibold 
                relative 
                transition-all 
                duration-300 
                inline-block
                hover:scale-110 
                transform
                ${
                  activeSection === section
                    ? "drop-shadow-[0_0_25px_rgba(255,128,0,1)] drop-shadow-[0_0_45px_rgba(255,128,0,0.8)] drop-shadow-[0_0_70px_rgba(255,128,0,0.6)] text-[#FF8000]"
                    : "hover:drop-shadow-[0_0_20px_rgba(255,128,0,0.9)] hover:drop-shadow-[0_0_40px_rgba(255,128,0,0.6)]"
                }
              `}
              style={{
                textDecoration: 'none',
                borderBottom: 'none',
                textShadow: activeSection === section ? '0 0 20px rgba(255,128,0,0.8), 0 0 30px rgba(255,128,0,0.6)' : 'none'
              }}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;