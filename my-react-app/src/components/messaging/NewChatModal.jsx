import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaUsers, FaUserPlus, FaRocket } from 'react-icons/fa';
import UserSearchModal from './UserSearchModal';

const NewChatModal = ({ onClose, onCreateConversation, token }) => {
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateConversation = async (participantIds, type, groupName) => {
    const success = await onCreateConversation(participantIds, type, groupName);
    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowUserSearch(false);
      onClose();
    }, 300); // Match the animation duration
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      {/* Enhanced Backdrop with blur animation */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
          isVisible && !isClosing 
            ? 'bg-black/60 backdrop-blur-md' 
            : 'bg-black/0 backdrop-blur-none'
        }`}
        onClick={handleBackdropClick}
      >
        {/* Modal Container with advanced animations */}
        <div 
          className={`relative w-full max-w-md transform transition-all duration-500 ease-out ${
            isVisible && !isClosing
              ? 'translate-y-0 scale-100 rotate-0 opacity-100'
              : isClosing
                ? 'translate-y-8 scale-95 -rotate-1 opacity-0'
                : '-translate-y-8 scale-95 rotate-1 opacity-0'
          }`}
          style={{
            transformOrigin: '50% 50%'
          }}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-3xl blur-xl scale-110 animate-pulse"></div>
          
          {/* Main Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50">
            {/* Animated particles background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-full transition-transform duration-1000 ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-green-300/30 rounded-full animate-float"></div>
                <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-blue-300/30 rounded-full animate-float-delayed"></div>
                <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-purple-300/30 rounded-full animate-bounce-slow"></div>
              </div>
            </div>

            {/* Enhanced Header with slide-in animation */}
            <div className="relative p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white overflow-hidden">
              {/* Animated background pattern */}
              <div className={`absolute inset-0 opacity-20 transition-transform duration-700 ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-spin-slow"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12 animate-reverse-spin"></div>
              </div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className={`flex items-center gap-3 transition-all duration-500 delay-100 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm transform transition-transform duration-500 hover:scale-110 hover:rotate-12">
                    <FaRocket className={`text-2xl text-white transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-2'}`} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold transition-all duration-500 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                      Start Chatting
                    </h3>
                    <p className={`text-green-100 text-sm transition-all duration-500 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                      Connect with your workspace
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className={`p-2 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm group ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                >
                  <FaTimes className="text-xl text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {!showUserSearch ? (
                <div className="space-y-4">
                  {/* Direct Message Option with staggered animation */}
                  <div
                    className={`transition-all duration-700 delay-200 ${
                      isVisible 
                        ? 'translate-y-0 opacity-100 scale-100' 
                        : 'translate-y-4 opacity-0 scale-95'
                    }`}
                  >
                    <button
                      onClick={() => setShowUserSearch(true)}
                      className="w-full p-6 text-left border-2 border-gray-200 rounded-2xl hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-500 group transform hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:rotate-3">
                            <FaSearch className="text-white text-2xl group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">
                            <FaUserPlus className="text-white text-xs" />
                          </div>
                          {/* Animated ring effect */}
                          <div className="absolute inset-0 rounded-2xl border-2 border-green-400 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500"></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg group-hover:text-green-700 transition-colors duration-300">
                            Find Colleagues
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                            Search and start direct conversations with your teammates
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium group-hover:bg-green-200 transition-colors duration-300">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                              Instant
                            </span>
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium group-hover:bg-blue-200 transition-colors duration-300">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                              Direct
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Team Chat Option with staggered animation */}
                  <div
                    className={`transition-all duration-700 delay-400 ${
                      isVisible 
                        ? 'translate-y-0 opacity-100 scale-100' 
                        : 'translate-y-4 opacity-0 scale-95'
                    }`}
                  >
                    <button
                      onClick={() => {
                        console.log('Team chat creation not implemented yet');
                      }}
                      className="w-full p-6 text-left border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-500 group transform hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
                    >
                      {/* Coming Soon Badge with pulse animation */}
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        Soon
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:rotate-3">
                            <FaUsers className="text-white text-2xl group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">
                            <span className="text-white text-xs font-bold">+</span>
                          </div>
                          {/* Animated ring effect */}
                          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500"></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-700 transition-colors duration-300">
                            Team Chat
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                            Create group conversations for team collaboration
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium group-hover:bg-blue-200 transition-colors duration-300">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                              Group
                            </span>
                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium group-hover:bg-purple-200 transition-colors duration-300">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1 animate-pulse"></div>
                              Collaborate
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Quick Tips with fade-in animation */}
                  <div
                    className={`mt-6 transition-all duration-700 delay-600 ${
                      isVisible 
                        ? 'translate-y-0 opacity-100 scale-100' 
                        : 'translate-y-4 opacity-0 scale-95'
                    }`}
                  >
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow duration-300">
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-blue-500 animate-bounce">💡</span>
                        Quick Tips
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          Use messaging to coordinate parking swaps
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                          Share your seating preferences with teammates
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                          Get real-time updates on workspace availability
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`transition-all duration-500 ${showUserSearch ? 'opacity-100' : 'opacity-0'}`}>
                  <UserSearchModal
                    token={token}
                    onCreateConversation={handleCreateConversation}
                    onBack={() => setShowUserSearch(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Floating action hints */}
          <div className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200/50">
              <p className="text-xs text-gray-600 font-medium">Press ESC to close</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-2deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes reverse-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-reverse-spin {
          animation: reverse-spin 6s linear infinite;
        }
      `}</style>
    </>
  );
};

export default NewChatModal;