// components/Home/FeaturesSection.jsx - Fully Responsive
import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap, Lock, Users } from 'lucide-react';
import teamOfficeImage from '../../assets/team-office.jpg';

const FeaturesSection = () => {
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

  const features = [
    {
      icon: <Target className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: "Precision Focus",
      description: "Advanced targeting system ensures you hit your goals every time with laser-sharp accuracy."
    },
    {
      icon: <Zap className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: "Lightning Speed",
      description: "Experience blazing fast performance that keeps you ahead of the competition."
    },
    {
      icon: <Lock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: "Bank-Level Security",
      description: "Your data is protected by military-grade encryption and multi-layer security protocols."
    },
    {
      icon: <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />,
      title: "Team Collaboration",
      description: "Seamlessly coordinate with your team and optimize workspace utilization."
    }
  ];

  return (
    <section ref={sectionRef} id="about" className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={teamOfficeImage} 
          alt="Team Office"
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-white/80"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title - Responsive text sizes */}
        <div className={`text-center mb-12 sm:mb-16 transform transition-all duration-1000 ease-out ${
          titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Why Choose Wiley Booking?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-0">
            We eliminate the chaos and optimize your workspace for maximum efficiency and user satisfaction.
          </p>
        </div>

        {/* Features Grid - Responsive grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group p-5 sm:p-6 rounded-xl bg-white border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform ${
                cardsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="bg-green-100 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-green-200 transition-colors">
                <div className="text-green-600">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;