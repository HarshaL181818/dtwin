import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const mainSection = location.pathname.split("/")[1] || "home"; // Extract the main section
    setActiveSection(mainSection);
  }, [location.pathname]);

  const handleSectionClick = (section) => {
    setActiveSection(section);
    navigate(section === "home" ? "/" : `/${section}`);
  };

  return (
    <nav className="bg-transparent custom-navbar py-2 flex items-center justify-between px-10">
      {/* Left side: EcoTwin Text */}
      <div
        className="text-white text-2xl font-bold tracking-wide cursor-pointer hover:scale-105 transform transition-all duration-300"
        onClick={() => handleSectionClick("home")}
      >
        EcoTwin
      </div>

      {/* Right side: Navigation Links */}
      <ul className="flex justify-end space-x-10">
        {["home", "features", "about", "contact"].map((section) => (
          <li key={section}>
            <a
              onClick={() => handleSectionClick(section)}
              className={`no-underline text-white text-lg font-semibold relative transition-all duration-300 inline-block
                hover:scale-110 transform hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]
                after:absolute after:bottom-0 after:left-0 after:w-full after:h-1.5
                ${
                  activeSection === section
                    ? "after:scale-x-100 after:bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
                    : "after:scale-x-0 after:bg-gradient-to-r from-white/20 to-transparent hover:after:scale-x-100"
                }
                after:transition-transform after:duration-300
                before:absolute before:w-[130%] before:h-[130%] before:-left-[15%] before:-bottom-[15%]
                before:bg-gradient-to-b from-white/0 via-white/20 to-white/50
                before:rounded-full before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
