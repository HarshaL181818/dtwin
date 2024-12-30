import React from "react";
import Navbar from "../component/Navbar/Navbar";

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-[#697565] overflow-y-auto">
            <div className="mt-5">
                <Navbar />
            </div>
            
            <div className="container mx-auto px-6 py-16 pb-24">
                {/* Main Title Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-white">
                        About Us
                        <div className="mt-2 mx-auto w-24 h-1 bg-[#FF8000]"></div>
                    </h1>
                </div>
                
                {/* Welcome Section */}
                <div className="mb-12 p-8 rounded-xl border border-white/20">
                    <p className="text-2xl text-white mb-6">
                        Welcome to <span className="text-[#FF8000] font-bold">EcoTwin</span> – your trusted partner in building smarter, greener, and more sustainable cities!
                    </p>
                    <p className="text-lg text-white/90 leading-relaxed">
                        EcoTwin provides powerful insights into urban environments, empowering city planners, researchers, and residents to make informed decisions. With real-time data on traffic congestion, air quality, and weather trends, our platform transforms raw data into actionable knowledge, helping cities thrive in harmony with nature.
                    </p>
                </div>

                {/* Vision & Mission Section */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* Vision Card */}
                    <div className="p-8 rounded-xl border border-white/20">
                        <h2 className="text-3xl font-bold mb-6 text-[#FF8000] flex items-center">
                            <span className="w-2 h-8 bg-[#FF8000] mr-4"></span>
                            Our Vision
                        </h2>
                        <p className="text-lg text-white/90 leading-relaxed">
                            To create a sustainable future where cities are efficient, environmentally conscious, and seamlessly connected. We envision a world where every decision about urban development is guided by reliable data and a commitment to sustainability.
                        </p>
                    </div>

                    {/* Mission Card */}
                    <div className="p-8 rounded-xl border border-white/20">
                        <h2 className="text-3xl font-bold mb-6 text-[#FF8000] flex items-center">
                            <span className="w-2 h-8 bg-[#FF8000] mr-4"></span>
                            Our Mission
                        </h2>
                        <p className="text-lg text-white/90 leading-relaxed">
                            To deliver innovative tools that simplify urban analytics and promote smarter, eco-friendly decision-making. By bridging the gap between data and action, EcoTwin fosters cities that are livable, resilient, and forward-thinking.
                        </p>
                    </div>
                </div>

                {/* Why Choose Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-[#FF8000] text-center">Why Choose EcoTwin?</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {title: "Real-Time Insights", content: "Harness cutting-edge technology to access accurate and up-to-date information on key urban metrics."},
                            {title: "Eco-Conscious Design", content: "Our platform focuses on sustainability, helping users minimize environmental impact."},
                            {title: "Intuitive Interface", content: "EcoTwin's dashboard is designed for seamless usability, making it accessible to everyone."},
                            {title: "Holistic Analysis", content: "From air quality monitoring to traffic optimization, EcoTwin provides a comprehensive view of urban dynamics."}
                        ].map((item, index) => (
                            <div key={index} className="p-8 rounded-xl border border-white/20">
                                <h3 className="text-xl font-bold mb-4 text-[#FF8000]">{item.title}</h3>
                                <p className="text-white/90">{item.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Closing Statement */}
                <div className="text-center p-8 rounded-xl border border-white/20">
                    <p className="text-xl text-white mb-2">Join us in building a sustainable future, one data-driven decision at a time.</p>
                    <p className="text-2xl font-bold text-[#FF8000]">Together, let's redefine urban living with EcoTwin!</p>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;