// components/about/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import hero_background_photo from '../../assets/hero_background.png';
const HeroSection = () => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [mainTextVisible, setMainTextVisible] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);

  useEffect(() => {
    // Staggered animations for smooth entrance
    const timers = [
      setTimeout(() => setTitleVisible(true), 300),
      setTimeout(() => setSubtitleVisible(true), 600),
      setTimeout(() => setMainTextVisible(true), 900),
      setTimeout(() => setDescriptionVisible(true), 1200)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
   <>
      {/* ---------------- Hero Section: Background + About Us title only ---------------- */}
      <section className="relative h-[75vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${hero_background_photo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: 'scale(1.02)'
          }}
        >
          {/* Overlays */}
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
        </div>

        {/* "About Us" Title */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <div className={`transform transition-all duration-1000 ease-out ${
            titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <p className="text-green-400 text-sm md:text-base font-medium tracking-wider uppercase mb-2">
              WHY WILEYBOOKING?
            </p>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-wide"
              style={{
                fontFamily: 'Playfair Display, serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              About Us
            </h1>
          </div>
        </div>
      </section>

      {/* ---------------- Section below the hero image ---------------- */}
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          {/* "We Connect People..." */}
          <div className={`transform transition-all duration-1000 ease-out ${
            mainTextVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              We Connect People, Spaces and Data to Power the Places where People Work Best Together.
            </h2>
          </div>

          {/* Supporting description */}
          <div className={`transform transition-all duration-1000 ease-out ${
            descriptionVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              The value of your office is the work that is done inside of it. Bring your workplace out of the dark and leverage your space to create an environment that truly works for your people and business.
            </p>
          </div>
        </div>
      </section>
    </>

  );
};

export default HeroSection;