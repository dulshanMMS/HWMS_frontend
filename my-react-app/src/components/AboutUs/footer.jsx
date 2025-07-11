// components/Footer.jsx
import React from 'react';
import { Car, Mail, Phone, MapPin, Globe, Facebook, Twitter, Linkedin, Instagram, Clock, Shield, Users, Award } from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Information */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <img 
                  src={logo}  // Use imported photo
                  alt="Company Photo" 
                  className="w-full h-32 object-cover rounded-lg shadow-lg"
                />
              </div>
              
              {/* <div className="flex items-center mb-6">
                {/* <div className="bg-white p-2 rounded-lg">
                  <Car className="h-6 w-6 text-green-600" />
                </div>*/}
                 {/*<span className="ml-3 text-2xl font-bold">Wiley Booking</span>*/}
              {/*</div>*/}
               {/*<p className="text-green-100 mb-6 leading-relaxed">
                Revolutionizing workspace management with smart parking and booking solutions for the modern hybrid workplace.
              </p>*/}
              
              {/* Social Media Links */}
              <div className="flex space-x-4">
                <a href="#" className="bg-green-700 p-2 rounded-lg hover:bg-green-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="bg-green-700 p-2 rounded-lg hover:bg-green-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="bg-green-700 p-2 rounded-lg hover:bg-green-600 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="bg-green-700 p-2 rounded-lg hover:bg-green-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-4 text-green-100">
                <li><a href="#" className="hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Home
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>About Us
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Services
                </a></li>
                
                <li><a href="#" className="hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Contact
                </a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Our Services</h3>
              <ul className="space-y-4 text-green-100">
                <li className="flex items-center">
                  <Car className="h-4 w-4 mr-3 text-green-400" />
                  <span className="hover:text-white transition-colors">Parking Booking</span>
                </li>
                <li className="flex items-center">
                  <Users className="h-4 w-4 mr-3 text-green-400" />
                  <span className="hover:text-white transition-colors">Workspace Management</span>
                </li>
                <li className="flex items-center">
                  <Clock className="h-4 w-4 mr-3 text-green-400" />
                  <span className="hover:text-white transition-colors">Real-time Availability</span>
                </li>
                
                <li className="flex items-center">
                  <Award className="h-4 w-4 mr-3 text-green-400" />
                  <span className="hover:text-white transition-colors">Premium Support</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
              <ul className="space-y-4 text-green-100">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Wiley Global Pvt.Ltd.</p>
                    <p>No 200 Narahenpita</p>
                    <p>Kotte 11222, Sri Lanka.</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-green-400" />
                  <a href="mailto:booking@wiley.com" className="hover:text-white transition-colors">
                    booking@wiley.com
                  </a>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-green-400" />
                  <a href="tel:+1-201-748-6000" className="hover:text-white transition-colors">
                    0117 577 977
                  </a>
                </li>
                <li className="flex items-center">
                  <Globe className="h-5 w-5 mr-3 text-green-400" />
                  <a href="#" className="hover:text-white transition-colors">
                    www.wileybooking.com
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-green-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-green-200 text-sm">
              <p>&copy; 2025 Wiley Booking Platform. All rights reserved.</p>
            </div>
            <div className="flex space-x-6 text-sm text-green-200">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          
        
          
        </div>

      </div>
    </footer>
  );
};

export default Footer;