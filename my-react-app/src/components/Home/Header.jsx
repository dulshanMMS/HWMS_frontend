// components/Home/Header.jsx
import React, { useState, useEffect } from 'react';
import { Car, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Get hero section height (approximately viewport height)
      const heroSectionHeight = window.innerHeight;
      const currentScrollY = window.scrollY;
      
      // Show header only when in hero section
      // Hide when scrolled past hero section
      setShowHeader(currentScrollY < heroSectionHeight - 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scrolling function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  // Don't render header at all when not in hero section
  if (!showHeader) {
    return null;
  }

  return (
    <header className="absolute top-0 w-full z-50">
      {/* Navigation Bar - Scrolls with hero section */}
      <div className="flex justify-center pt-12">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl px-16 py-4 min-w-[800px] max-w-4xl">
          <nav>
            {/* Centered Navigation Links */}
            <div className="hidden md:flex items-center justify-center space-x-16">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-white px-6 py-3 text-sm font-medium transition-all duration-300 hover:text-green-300"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-white/90 hover:text-white px-6 py-3 text-sm font-medium transition-all duration-300 hover:text-green-300"
              >
                About Us
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-white/90 hover:text-white px-6 py-3 text-sm font-medium transition-all duration-300 hover:text-green-300"
              >
                Resources
              </button>
              <button className="bg-green-600 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-all duration-300 shadow-lg ml-6">
                Sign In
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex justify-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-white/20 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-green-300 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </nav>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4">
              <div className="space-y-2">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-white hover:text-green-300 block px-3 py-2 rounded-md text-base font-medium w-full text-center"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-white/90 hover:text-green-300 block px-3 py-2 rounded-md text-base font-medium w-full text-center"
                >
                  About Us
                </button>
                <button 
                  onClick={() => scrollToSection('services')}
                  className="text-white/90 hover:text-green-300 block px-3 py-2 rounded-md text-base font-medium w-full text-center"
                >
                  Resources
                </button>
                <button className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 transition-colors mt-2">
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logo and Wiley Booking - Scrolls with hero section */}
      <div className="absolute top-8 left-4 sm:left-6 lg:left-8 z-40">
        <div className="flex items-center">
          <div className="bg-green-600 p-3 rounded-lg shadow-xl">
            <Car className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-white drop-shadow-lg">Wiley Booking</span>
        </div>
      </div>
    </header>
  );
};

export default Header;