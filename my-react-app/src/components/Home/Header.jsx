// components/Home/Header.jsx - Fully Responsive
import React, { useState, useEffect } from 'react';
import { Building, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const heroSectionHeight = window.innerHeight;
      const currentScrollY = window.scrollY;
      setShowHeader(currentScrollY < heroSectionHeight - 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navigateToPage = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  if (!showHeader) {
    return null;
  }

  return (
    <header className="absolute top-0 w-full z-50">
      {/* Navigation Bar - Responsive design */}
      <div className="flex justify-center pt-6 sm:pt-8 lg:pt-12 px-4 sm:px-6">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-8 lg:px-16 py-3 sm:py-4 w-full max-w-xs sm:max-w-2xl lg:max-w-4xl xl:min-w-[800px]">
          <nav>
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center justify-center space-x-8 xl:space-x-24">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-white px-4 xl:px-6 py-2 xl:py-3 text-sm font-medium transition-all duration-300 hover:text-green-300"
              >
                Home
              </button>
              <button 
                onClick={() => navigateToPage('/about/us')}
                className="text-white/90 hover:text-white px-4 xl:px-6 py-2 xl:py-3 text-sm font-medium transition-all duration-300 hover:text-green-300"
              >
                About Us
              </button>
              <button 
                onClick={() => navigateToPage('/')}
                className="bg-green-600 text-white px-6 xl:px-8 py-2 xl:py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-all duration-300 shadow-lg"
              >
                Sign In
              </button>
            </div>

            {/* Tablet Navigation */}
            <div className="hidden md:flex lg:hidden items-center justify-between">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-white px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-green-300"
                >
                  Home
                </button>
                <button 
                  onClick={() => navigateToPage('/about/us')}
                  className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-green-300"
                >
                  About Us
                </button>
              </div>
              <button 
                onClick={() => navigateToPage('/')}
                className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all duration-300 shadow-lg"
              >
                Sign In
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex justify-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-white/20 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-green-300 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 border-t border-white/20 pt-4">
              <div className="space-y-2">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-white hover:text-green-300 block px-3 py-2 rounded-md text-base font-medium w-full text-center transition-colors"
                >
                  Home
                </button>
                <button 
                  onClick={() => navigateToPage('/about/us')}
                  className="text-white/90 hover:text-green-300 block px-3 py-2 rounded-md text-base font-medium w-full text-center transition-colors"
                >
                  About Us
                </button>
                <button 
                  onClick={() => navigateToPage('/')}
                  className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 transition-colors mt-3"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logo and Wiley Booking - Responsive positioning */}
      <div className="absolute top-4 sm:top-6 lg:top-8 left-2 sm:left-4 lg:left-8 z-40">
        <div className="flex items-center">
          <div className="bg-green-600 p-2 sm:p-3 rounded-lg shadow-xl">
            <Building className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
          </div>
          <span className="ml-2 sm:ml-3 text-base sm:text-lg lg:text-xl font-bold text-white drop-shadow-lg">
            <span className="hidden xs:inline">Wiley Booking</span>
            <span className="xs:hidden">Wiley</span>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;