// components/Home/CTASection.jsx - Fully Responsive
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import teamOfficeImage from '../../assets/team-office.jpg';

const LightCTASection = () => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
          setTimeout(() => setSubtitleVisible(true), 300);
          setTimeout(() => setButtonVisible(true), 600);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const navigateToLogin = () => {
    navigate('/');
  };

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 relative overflow-hidden">
      {/* Background Image with Light Overlay */}
      <div className="absolute inset-0">
        <img 
          src={teamOfficeImage} 
          alt="Team Collaboration"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-green-100/80 to-emerald-50/90"></div>
      </div>
      
      {/* Decorative Elements - Responsive sizing */}
      <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 bg-green-200 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-24 h-24 sm:w-40 sm:h-40 bg-emerald-200 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-green-300 rounded-full opacity-15 blur-lg"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Main Title - Responsive text sizing */}
        <div className={`transform transition-all duration-1000 ease-out ${
          titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
            Take the next steps toward a 
            <span className="text-green-600 block sm:inline"> smarter workplace</span>
          </h2>
        </div>

        {/* Subtitle - Responsive text and spacing */}
        <div className={`transform transition-all duration-1000 ease-out delay-300 ${
          subtitleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Join thousands of companies that trust Wiley Booking to optimize their workspace and enhance productivity.
          </p>
        </div>

        {/* CTA Button - Responsive sizing */}
        <div className={`transform transition-all duration-1000 ease-out delay-600 ${
          buttonVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="px-4 sm:px-0">
            <button 
              onClick={navigateToLogin}
              className="bg-green-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              Get Started Today
              <ArrowRight className="inline-block ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightCTASection;