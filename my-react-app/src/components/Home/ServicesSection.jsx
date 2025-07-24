// components/Home/ServicesSection.jsx - Fully Responsive
import React, { useState, useEffect, useRef } from 'react';
import { Users, Award } from 'lucide-react';
import deskBookingImage from '../../assets/desk-booking.jpg';
import officeInsightsImage from '../../assets/office-insights.jpg';

const ServicesSection = () => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
          setTimeout(() => setCardsVisible(true), 400);
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

  return (
    <section ref={sectionRef} id="services" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title - Responsive text sizes */}
        <div className={`text-center mb-12 sm:mb-16 transform transition-all duration-1000 ease-out ${
          titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Our Services
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-0">
            Comprehensive solutions for modern workplace management
          </p>
        </div>
        
        {/* Services Grid - Responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Desk Booking Service */}
          <div className={`group relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden ${
            cardsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '200ms' }}>
            
            {/* Background Image */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
              <img 
                src={deskBookingImage} 
                alt="Desk Booking"
                className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/70 to-indigo-600/70"></div>
            </div>
            
            {/* Service Icon - Responsive positioning */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
              <div className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg shadow-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">Easily Book Desks</h3>
              <p className="text-white/90 mb-4 sm:mb-6 drop-shadow-md text-sm sm:text-base leading-relaxed">
                Explore interactive floor plans and find the perfect desk for your needs. Book instantly and get notified about availability.
              </p>
              <div className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg inline-block text-sm sm:text-base">
                Book Now
              </div>
            </div>
          </div>

          {/* Office Insights Service */}
          <div className={`group relative bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden ${
            cardsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '400ms' }}>
            
            {/* Background Image */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
              <img 
                src={officeInsightsImage} 
                alt="Office Insights"
                className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/70 to-pink-600/70"></div>
            </div>
            
            {/* Service Icon - Responsive positioning */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
              <div className="bg-purple-600 text-white p-1.5 sm:p-2 rounded-lg shadow-lg">
                <Award className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">Access Office Insights</h3>
              <p className="text-white/90 mb-4 sm:mb-6 drop-shadow-md text-sm sm:text-base leading-relaxed">
                Get real-time analytics and insights about office space utilization and team productivity patterns.
              </p>
              <div className="bg-white text-purple-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg inline-block text-sm sm:text-base">
                View Insights
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;