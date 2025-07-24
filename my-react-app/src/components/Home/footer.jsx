// components/Home/Footer.jsx - Clean version without duplicates
import React from 'react';
import { Building, Mail, Phone, MapPin, Globe, Facebook, Twitter, Linkedin, Instagram, Clock, Users, Award } from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white relative overflow-hidden">
      {/* Background Pattern - Responsive sizing */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-12 h-12 sm:w-24 sm:h-24 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-1/4 w-8 h-8 sm:w-16 sm:h-16 border border-white/20 rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Content */}
        <div className="py-6 sm:py-8 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* Company Information */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="text-center sm:text-left">
                <div className="mb-4 sm:mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20 w-32 h-16 sm:w-48 sm:h-20 flex items-center justify-center mx-auto sm:mx-0">
                    <img 
                      src={logo}
                      alt="Wiley Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <p className="text-green-100 text-sm leading-relaxed mb-3 sm:mb-4">
                    Smart workspace management for modern businesses.
                  </p>
                  
                  <h3 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3 text-green-200">Follow Us</h3>
                  <div className="flex justify-center sm:justify-start space-x-2">
                    <a href="https://facebook.com/wileybooking" target="_blank" rel="noopener noreferrer" className="group bg-white/10 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg hover:bg-green-600 transition-all duration-300 border border-white/20 hover:border-green-400">
                      <Facebook className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    </a>
                    <a href="https://twitter.com/wileybooking" target="_blank" rel="noopener noreferrer" className="group bg-white/10 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg hover:bg-green-600 transition-all duration-300 border border-white/20 hover:border-green-400">
                      <Twitter className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    </a>
                    <a href="https://linkedin.com/company/wiley-booking" target="_blank" rel="noopener noreferrer" className="group bg-white/10 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg hover:bg-green-600 transition-all duration-300 border border-white/20 hover:border-green-400">
                      <Linkedin className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    </a>
                    <a href="https://instagram.com/wileybooking" target="_blank" rel="noopener noreferrer" className="group bg-white/10 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg hover:bg-green-600 transition-all duration-300 border border-white/20 hover:border-green-400">
                      <Instagram className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-left">
              <h3 className="text-sm sm:text-md font-semibold mb-3 sm:mb-4 text-green-200 flex items-center justify-center sm:justify-start">
                <div className="w-1 h-3 sm:h-4 bg-green-400 rounded-full mr-2 sm:mr-3"></div>
                Quick Links
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a href="#" className="group flex items-center justify-center sm:justify-start text-green-100 hover:text-white transition-all duration-300">
                    <span className="group-hover:translate-x-1 transition-transform text-sm sm:text-base">Home</span>
                  </a>
                </li>
                <li>
                  <a href="/user/AboutUsPage" className="group flex items-center justify-center sm:justify-start text-green-100 hover:text-white transition-all duration-300">
                    <span className="group-hover:translate-x-1 transition-transform text-sm sm:text-base">About Us</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group flex items-center justify-center sm:justify-start text-green-100 hover:text-white transition-all duration-300">
                    <span className="group-hover:translate-x-1 transition-transform text-sm sm:text-base">Contact</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="text-center sm:text-left">
              <h3 className="text-sm sm:text-md font-semibold mb-3 sm:mb-4 text-green-200 flex items-center justify-center sm:justify-start">
                <div className="w-1 h-3 sm:h-4 bg-green-400 rounded-full mr-2 sm:mr-3"></div>
                Our Services
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li className="group flex items-center hover:bg-white/5 p-2 sm:p-3 rounded-lg transition-all duration-300 -m-2 sm:-m-3 justify-center sm:justify-start">
                  <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 group-hover:bg-green-500 transition-colors">
                    <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-green-100 group-hover:text-white transition-colors text-sm sm:text-base">Parking Booking</span>
                </li>
                <li className="group flex items-center hover:bg-white/5 p-2 sm:p-3 rounded-lg transition-all duration-300 -m-2 sm:-m-3 justify-center sm:justify-start">
                  <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 group-hover:bg-green-500 transition-colors">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-green-100 group-hover:text-white transition-colors text-sm sm:text-base">Workspace Management</span>
                </li>
                <li className="group flex items-center hover:bg-white/5 p-2 sm:p-3 rounded-lg transition-all duration-300 -m-2 sm:-m-3 justify-center sm:justify-start">
                  <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 group-hover:bg-green-500 transition-colors">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-green-100 group-hover:text-white transition-colors text-sm sm:text-base">Real-time Availability</span>
                </li>
                <li className="group flex items-center hover:bg-white/5 p-2 sm:p-3 rounded-lg transition-all duration-300 -m-2 sm:-m-3 justify-center sm:justify-start">
                  <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 group-hover:bg-green-500 transition-colors">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-green-100 group-hover:text-white transition-colors text-sm sm:text-base">Premium Support</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="text-center sm:text-left">
              <h3 className="text-sm sm:text-md font-semibold mb-3 sm:mb-4 text-green-200 flex items-center justify-center sm:justify-start">
                <div className="w-1 h-3 sm:h-4 bg-green-400 rounded-full mr-2 sm:mr-3"></div>
                Contact Info
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li className="group">
                  <div className="bg-white/5 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-white/10 hover:border-green-400/50 transition-all duration-300">
                    <div className="flex items-start justify-center sm:justify-start">
                      <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="text-green-100 text-center sm:text-left">
                        <p className="font-semibold text-white mb-1 text-sm sm:text-base">Wiley Global Pvt.Ltd.</p>
                        <p className="text-xs sm:text-sm">No 200 Narahenpita</p>
                        <p className="text-xs sm:text-sm">Kotte 11222, Sri Lanka.</p>
                      </div>
                    </div>
                  </div>
                </li>
                
                <li>
                  <a href="mailto:booking@wiley.com" className="group bg-white/5 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-white/10 hover:border-green-400/50 transition-all duration-300 flex items-center justify-center sm:justify-start block">
                    <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 group-hover:bg-green-500 transition-colors">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-green-100 group-hover:text-white transition-colors text-sm sm:text-base">booking@wiley.com</span>
                  </a>
                </li>
                
                <li>
                  <a href="tel:0117577977" className="group bg-white/5 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-white/10 hover:border-green-400/50 transition-all duration-300 flex items-center justify-center sm:justify-start block">
                    <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 group-hover:bg-green-500 transition-colors">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-green-100 group-hover:text-white transition-colors text-sm sm:text-base">0117 577 977</span>
                  </a>
                </li>
                
                <li>
                  <a href="#" className="group bg-white/5 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-white/10 hover:border-green-400/50 transition-all duration-300 flex items-center justify-center sm:justify-start block">
                    <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 group-hover:bg-green-500 transition-colors">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-green-100 group-hover:text-white transition-colors text-sm sm:text-base">www.wileybooking.com</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Footer - Responsive layout */}
        <div className="border-t border-green-700/50 backdrop-blur-sm py-3 sm:py-4">
          <div className="flex justify-center items-center">
            <div className="text-green-200 text-center">
              <p className="flex items-center justify-center text-sm sm:text-base">
                <span className="text-xl sm:text-2xl mr-2">©</span>
                <span className="font-medium">2025 Wiley Booking Platform. All rights reserved.</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;