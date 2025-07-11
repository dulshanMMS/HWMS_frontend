// components/about/ContentSection.jsx
import React, { useState, useEffect, useRef } from 'react';

const ContentSection = ({ 
  imageLeft = true, 
  title, 
  description, 
  imageSrc, 
  imageAlt,
  features = [] // Optional features list
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Staggered animations when section comes into view
          setTimeout(() => setImageVisible(true), 200);
          setTimeout(() => setTextVisible(true), 400);
          setTimeout(() => setFeaturesVisible(true), 600);
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
    <section ref={sectionRef} className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
          imageLeft ? '' : 'lg:grid-flow-col-dense'
        }`}>
          
          {/* Image Section */}
          <div className={`${imageLeft ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className={`transform transition-all duration-1000 ease-out ${
              imageVisible ? 'translate-x-0 opacity-100' : 
              imageLeft ? '-translate-x-10 opacity-0' : 'translate-x-10 opacity-0'
            }`}>
              <div className="rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                <img 
                  src={imageSrc} 
                  alt={imageAlt}
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className={`${imageLeft ? 'lg:order-2' : 'lg:order-1'}`}>
            <div className={`transform transition-all duration-1000 ease-out delay-200 ${
              textVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              
              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {title}
              </h2>
              
              {/* Description */}
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-8">
                {description}
              </p>

              {/* Features List (if provided) */}
              {features.length > 0 && (
                <div className={`transform transition-all duration-1000 ease-out delay-400 ${
                  featuresVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}>
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <div 
                        key={index}
                        className={`flex items-start space-x-3 transform transition-all duration-700 ease-out ${
                          featuresVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                        }`}
                        style={{ transitionDelay: `${600 + index * 100}ms` }}
                      >
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-3"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{feature.title}:</h4>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentSection;