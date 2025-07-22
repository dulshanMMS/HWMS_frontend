// components/Footer.jsx
import React from 'react';
import { Car, Mail, Phone, MapPin, Globe, Facebook, Twitter, Linkedin, Instagram, Clock, Shield, Users, Award } from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Content */}
        <div className="py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Company Information */}
            <div className="lg:col-span-1">
              <div className="text-center lg:text-left">
                <div className="mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 w-48 h-20 flex items-center justify-center mx-auto lg:mx-0">
                    <img 
                      src={logo}
                      alt="Wiley Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-green-100 text-sm leading-relaxed mb-4">
                    Smart workspace management for modern businesses.
                  </p>
                  
                  <h3 className="text-md font-semibold mb-3 text-green-200">Follow Us</h3>
                  <div className="flex justify-center lg:justify-start space-x-2">
                    <a href="#" className="group bg-white/10 backdrop-blur-sm p-2 rounded-lg hover:bg-green-600 transition-all duration-300 border border-white/20 hover:border-green-400">
                      <Facebook className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </a>
                    <a href="#" className="group bg-white/10 backdrop-blur-sm p-2 rounded-lg hover:bg-green-600 transition-all duration-300 border border-white/20 hover:border-green-400">
                      <Twitter className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </a>
                    <a href="#" className="group bg-white/10 backdrop-blur-sm p-2 rounded-lg hover:bg-green-600 transition-all duration-300 border border-white/20 hover:border-green-400">
                      <Linkedin className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </a>
                    <a href="#" className="group bg-white/10 backdrop-blur-sm p-2 rounded-lg hover:bg-green-600 transition-all duration-300 border border-white/20 hover:border-green-400">
                      <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-md font-semibold mb-4 text-green-200 flex items-center">
                <div className="w-1 h-4 bg-green-400 rounded-full mr-3"></div>
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="group flex items-center text-green-100 hover:text-white transition-all duration-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-4 group-hover:scale-150 transition-transform"></div>
                    <span className="group-hover:translate-x-1 transition-transform">Home</span>
                  </a>
                </li>
                <li>
                  <a href="/user/AboutUsPage" className="group flex items-center text-green-100 hover:text-white transition-all duration-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-4 group-hover:scale-150 transition-transform"></div>
                    <span className="group-hover:translate-x-1 transition-transform">About Us</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group flex items-center text-green-100 hover:text-white transition-all duration-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-4 group-hover:scale-150 transition-transform"></div>
                    <span className="group-hover:translate-x-1 transition-transform">Services</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group flex items-center text-green-100 hover:text-white transition-all duration-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-4 group-hover:scale-150 transition-transform"></div>
                    <span className="group-hover:translate-x-1 transition-transform">Contact</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-md font-semibold mb-4 text-green-200 flex items-center">
                <div className="w-1 h-4 bg-green-400 rounded-full mr-3"></div>
                Our Services
              </h3>
              <ul className="space-y-3">
                <li className="group flex items-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300 -m-3">
                  <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:bg-green-500 transition-colors">
                    <Car className="h-4 w-4" />
                  </div>
                  <span className="text-green-100 group-hover:text-white transition-colors">Parking Booking</span>
                </li>
                <li className="group flex items-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300 -m-3">
                  <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:bg-green-500 transition-colors">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-green-100 group-hover:text-white transition-colors">Workspace Management</span>
                </li>
                <li className="group flex items-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300 -m-3">
                  <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:bg-green-500 transition-colors">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-green-100 group-hover:text-white transition-colors">Real-time Availability</span>
                </li>
                <li className="group flex items-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300 -m-3">
                  <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:bg-green-500 transition-colors">
                    <Award className="h-4 w-4" />
                  </div>
                  <span className="text-green-100 group-hover:text-white transition-colors">Premium Support</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-md font-semibold mb-4 text-green-200 flex items-center">
                <div className="w-1 h-4 bg-green-400 rounded-full mr-3"></div>
                Contact Info
              </h3>
              <ul className="space-y-3">
                <li className="group">
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-green-400/50 transition-all duration-300">
                    <div className="flex items-start">
                      <div className="bg-green-600 p-2 rounded-lg mr-4 flex-shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="text-green-100">
                        <p className="font-semibold text-white mb-1">Wiley Global Pvt.Ltd.</p>
                        <p className="text-sm">No 200 Narahenpita</p>
                        <p className="text-sm">Kotte 11222, Sri Lanka.</p>
                      </div>
                    </div>
                  </div>
                </li>
                
                <li>
                  <a href="mailto:booking@wiley.com" className="group bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-green-400/50 transition-all duration-300 flex items-center block">
                    <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:bg-green-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="text-green-100 group-hover:text-white transition-colors">booking@wiley.com</span>
                  </a>
                </li>
                
                <li>
                  <a href="tel:0117577977" className="group bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-green-400/50 transition-all duration-300 flex items-center block">
                    <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:bg-green-500 transition-colors">
                      <Phone className="h-5 w-5" />
                    </div>
                    <span className="text-green-100 group-hover:text-white transition-colors">0117 577 977</span>
                  </a>
                </li>
                
                <li>
                  <a href="#" className="group bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-green-400/50 transition-all duration-300 flex items-center block">
                    <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:bg-green-500 transition-colors">
                      <Globe className="h-5 w-5" />
                    </div>
                    <span className="text-green-100 group-hover:text-white transition-colors">www.wileybooking.com</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-green-700/50 backdrop-blur-sm py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-green-200">
              <p className="flex items-center">
                <span className="text-2xl mr-2">©</span>
                <span className="font-medium">2025 Wiley Booking Platform. All rights reserved.</span>
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
              <a href="#" className="text-green-200 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                Privacy Policy
              </a>
              <a href="#" className="text-green-200 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                Terms of Service
              </a>
              <a href="#" className="text-green-200 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                Cookie Policy
              </a>
              <a href="#" className="text-green-200 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                Support
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;