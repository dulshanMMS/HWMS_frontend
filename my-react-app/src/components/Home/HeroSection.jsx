// components/Home/HeroSection.jsx - Fully Responsive
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBackground from '../../assets/team2.png';

const HeroSection = () => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timers = [
      setTimeout(() => setTitleVisible(true), 300),
      setTimeout(() => setSubtitleVisible(true), 600),
      setTimeout(() => setButtonsVisible(true), 900)
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const navigateToLogin = () => {
    navigate('/');
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with image overlay */}
      <div className="absolute inset-0">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroBackground})`,
          }}
        ></div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-green-600/40"></div>
      </div>
      
      {/* Animated background elements - Responsive sizes */}
      <div className="absolute inset-0">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 h-32 sm:w-72 sm:h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-40 h-40 sm:w-80 sm:h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          {/* Main Title - Responsive text sizes */}
          <div className={`transform transition-all duration-1000 ease-out ${
            titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
              <span className="block">Manage Your</span>
              <span className="block text-green-300">Entire Workplace</span>
              <span className="block">on One Platform</span>
            </h1>
          </div>

          {/* Subtitle - Responsive text and spacing */}
          <div className={`transform transition-all duration-1000 ease-out delay-300 ${
            subtitleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto leading-relaxed drop-shadow-md px-4 sm:px-0">
              Bridge the gap between remote and in-person work, supercharge workplace operations and optimize your office spaces with one platform.
            </p>
          </div>

          {/* Action Button - Responsive sizing */}
          <div className={`transform transition-all duration-1000 ease-out delay-600 ${
            buttonsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="flex justify-center px-4 sm:px-0">
              <button 
                onClick={navigateToLogin}
                className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                Get Started
                <ArrowRight className="inline-block ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;