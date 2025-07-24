// components/Home/WorldSection.jsx - Fully Responsive
import React, { useState, useEffect, useRef } from 'react';
import globeImage from '../../assets/globe.png';

const EnhancedGlobeSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => setTextVisible(true), 500);
        }
      },
      { 
        threshold: 0.2,
        rootMargin: '50px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
          
          {/* Globe Image - Responsive sizing */}
          <div className={`relative flex-shrink-0 transform transition-all duration-1000 ease-out ${
            isVisible ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-10 opacity-0 scale-95'
          }`}>
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px] flex items-center justify-center">
              <img 
                src={globeImage} 
                alt="Global Workspace Platform" 
                className="w-full h-full object-contain drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))',
                  mixBlendMode: 'multiply'
                }}
              />
              
              {/* Connection dots - Responsive positioning */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-8 sm:top-12 lg:top-16 left-8 sm:left-12 lg:left-16 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-ping opacity-75 shadow-lg"></div>
                <div className="absolute top-16 sm:top-24 lg:top-32 right-12 sm:right-16 lg:right-20 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-ping opacity-75 shadow-lg" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-16 sm:bottom-24 lg:bottom-32 left-16 sm:left-24 lg:left-32 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-400 rounded-full animate-ping opacity-75 shadow-lg" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-8 sm:bottom-12 lg:bottom-20 right-8 sm:right-12 lg:right-16 w-2 h-2 sm:w-3 sm:h-3 bg-teal-400 rounded-full animate-ping opacity-75 shadow-lg" style={{animationDelay: '0.5s'}}></div>
              </div>
            </div>
          </div>

          {/* Overlapping Text - Responsive layout and sizing */}
          <div className={`flex-1 max-w-4xl relative lg:-ml-20 xl:-ml-40 transform transition-all duration-1000 ease-out delay-300 ${
            textVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}>
            
            {/* Main overlapping text */}
            <div className="relative px-4 sm:px-0">
              {/* Background text layers for depth effect - Responsive text sizes */}
              <div className="absolute inset-0 hidden sm:block">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight opacity-10 text-gray-400 transform translate-x-2 translate-y-2">
                  Bridge the gap between remote and in-person work, supercharge workplace operations and optimize your office spaces with one platform.
                </h2>
              </div>
              
              <div className="absolute inset-0 hidden sm:block">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight opacity-20 text-green-300 transform translate-x-1 translate-y-1">
                  Bridge the gap between remote and in-person work, supercharge workplace operations and optimize your office spaces with one platform.
                </h2>
              </div>
              
              {/* Main text - Responsive sizing */}
              <h2 className="relative text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight z-10">
                Bridge the gap between remote and in-person work, supercharge workplace operations and optimize your office spaces with
                <span className="text-green-600 relative inline-block ml-2">
                  one platform
                  {/* Glowing effect - Hidden on small screens for performance */}
                  <span className="absolute inset-0 text-green-600 opacity-50 blur-sm hidden sm:inline">
                    one platform
                  </span>
                </span>
                .
              </h2>
            </div>
            
            {/* Feature Points - Responsive spacing and sizing */}
            <div className="space-y-4 sm:space-y-6 mt-8 sm:mt-12 relative z-10 px-4 sm:px-0">
              <div className={`flex items-center space-x-3 sm:space-x-4 transform transition-all duration-700 ease-out ${
                textVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`} style={{ transitionDelay: '600ms' }}>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full shadow-lg relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-gray-700 font-medium tracking-wide">Global remote work management</p>
              </div>
              
              <div className={`flex items-center space-x-3 sm:space-x-4 transform transition-all duration-700 ease-out ${
                textVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`} style={{ transitionDelay: '700ms' }}>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full shadow-lg relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-gray-700 font-medium tracking-wide">Real-time workspace optimization</p>
              </div>
              
              <div className={`flex items-center space-x-3 sm:space-x-4 transform transition-all duration-700 ease-out ${
                textVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`} style={{ transitionDelay: '800ms' }}>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full shadow-lg relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-gray-700 font-medium tracking-wide">Seamless hybrid collaboration</p>
              </div>
            </div>

            {/* Decorative elements - Responsive sizing */}
            <div className="absolute -top-4 sm:-top-8 -right-4 sm:-right-8 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-30 -z-10 blur-sm"></div>
            <div className="absolute -bottom-6 sm:-bottom-12 -left-6 sm:-left-12 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-full opacity-30 -z-10 blur-sm"></div>
          </div>
        </div>
      </div>
      
      {/* Enhanced CSS for overlapping effects */}
      <style jsx>{`
        @keyframes textShimmer {
          0% { 
            text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
          }
          50% { 
            text-shadow: 0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.3);
          }
          100% { 
            text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
          }
        }
        
        .text-green-600 {
          animation: textShimmer 4s ease-in-out infinite;
        }
        
        @media (max-width: 1024px) {
          .lg\\:-ml-24 {
            margin-left: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default EnhancedGlobeSection;