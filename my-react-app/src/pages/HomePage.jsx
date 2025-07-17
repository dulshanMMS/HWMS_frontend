// pages/HomePage.jsx
import React from 'react';

// Import all the components
import Header from '../components/Home/Header';
import HeroSection from '../components/Home/HeroSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import WorldSection from '../components/Home/WorldSection'; // New rotating world section
import ServicesSection from '../components/Home/ServicesSection';
import CTASection from '../components/Home/CTASection';
import Footer from '../components/AboutUs/footer'; // Your friend's footer component

const HomePage = () => {
  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden" style={{ margin: 0, padding: 0 }}>
      {/* Navigation Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features/About Section */}
      <FeaturesSection />
      
      {/* World Section - Replaces Stats Section */}
      <WorldSection />
      
      {/* Services Section */}
      <ServicesSection />
      
      {/* Call to Action Section */}
      <CTASection />
      
      {/* Footer (Your friend's component) */}
      <Footer />
    </div>
  );
};

export default HomePage;