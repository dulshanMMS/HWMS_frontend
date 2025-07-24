// components/Home/StatsSection.jsx - Fully Responsive
import React, { useState, useEffect, useRef } from 'react';

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [numbersAnimated, setNumbersAnimated] = useState(false);
  
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Staggered animations
          setTimeout(() => setTitleVisible(true), 200);
          setTimeout(() => setStatsVisible(true), 600);
          setTimeout(() => setNumbersAnimated(true), 900);
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

  // Animated counter for numbers
  const AnimatedNumber = ({ targetNumber, suffix = '' }) => {
    const [currentNumber, setCurrentNumber] = useState(0);

    useEffect(() => {
      if (numbersAnimated) {
        let start = 0;
        const target = parseInt(targetNumber);
        const increment = target / 50; // Adjust speed here
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            setCurrentNumber(target);
            clearInterval(timer);
          } else {
            setCurrentNumber(Math.floor(start));
          }
        }, 30); // Animation speed

        return () => clearInterval(timer);
      }
    }, [numbersAnimated, targetNumber]);

    return (
      <span className="tabular-nums">
        {currentNumber}{suffix}
      </span>
    );
  };

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Green Box Container - Responsive padding */}
        <div className={`transform transition-all duration-1000 ease-out ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
        }`}>
          
          <div className="bg-green-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16 shadow-lg hover:shadow-xl transition-shadow duration-500">
            
            {/* Small Title - Responsive text sizing */}
            <div className={`text-center mb-4 sm:mb-6 transform transition-all duration-1000 ease-out ${
              titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}>
              <p className="text-green-700 text-xs sm:text-sm md:text-base font-medium tracking-wider uppercase">
                Scalability
              </p>
            </div>

            {/* Main Title - Responsive text sizing */}
            <div className={`text-center mb-8 sm:mb-12 transform transition-all duration-1000 ease-out delay-200 ${
              titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight px-4 sm:px-0">
                Achieve future comfort by managing your workplace.
              </h2>
            </div>

            {/* Statistics Grid - Responsive layout */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12 transform transition-all duration-1000 ease-out delay-400 ${
              statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              
              {/* Stat 1 - Employees */}
              <div className={`text-center transform transition-all duration-700 ease-out ${
                statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: '600ms' }}>
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2">
                  <AnimatedNumber targetNumber="500" suffix="+" />
                </div>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
                  Employees
                </p>
              </div>

              {/* Stat 2 - Seats */}
              <div className={`text-center transform transition-all duration-700 ease-out ${
                statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: '700ms' }}>
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2">
                  <AnimatedNumber targetNumber="64" suffix=" seats" />
                </div>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
                  Available Seats
                </p>
              </div>

              {/* Stat 3 - Parking */}
              <div className={`text-center sm:col-span-1 transform transition-all duration-700 ease-out ${
                statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: '800ms' }}>
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2">
                  <AnimatedNumber targetNumber="20" suffix=" parkings" />
                </div>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
                  Parking Spaces
                </p>
              </div>

            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;