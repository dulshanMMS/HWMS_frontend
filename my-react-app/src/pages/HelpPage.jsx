import React, { useState, useEffect, useRef } from 'react';
import LeftSidebar from '../components/LeftSidebar';
import { 
  FaPlay, 
  FaPause, 
  FaChevronRight, 
  FaChevronLeft, 
  FaHome, 
  FaCar, 
  FaChair, 
  FaBell, 
  FaUser, 
  FaCalendarAlt,
  FaQuestionCircle,
  FaSearch,
  FaCheckCircle,
  FaMagic,
  FaRocket,
  FaLightbulb,
  FaGraduationCap
} from 'react-icons/fa';
import useTokenExpiration from '../hooks/useTokenExpiration';

const HelpPage = () => {
  const [currentTutorial, setCurrentTutorial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState(new Set());
  const [showFloatingHelper, setShowFloatingHelper] = useState(true);
  const intervalRef = useRef(null);

  // Token expiration protection
  const clearHelpData = () => {
    setCurrentTutorial(0);
    setCurrentStep(0);
    setCompletedTutorials(new Set());
    setIsPlaying(false);
  };
  useTokenExpiration(clearHelpData);

  const tutorials = [
    {
      id: 0,
      title: "Dashboard Overview",
      description: "Learn to navigate your main dashboard",
      icon: <FaHome className="text-2xl" />,
      color: "from-[#052E19] to-green-700",
      steps: [
        {
          title: "Welcome to Your Dashboard!",
          description: "Your dashboard is your command center. Here you can see all your bookings, notifications, and quick actions.",
          highlight: "dashboard-main",
          imagePlaceholder: "dashboard-overview.jpg"
        },
        {
          title: "Profile Summary",
          description: "View your profile information, team details, and vehicle info at the top of your dashboard.",
          highlight: "profile-summary",
          imagePlaceholder: "profile-summary.jpg"
        },
        {
          title: "Booking Summary Card",
          description: "Check your total bookings, separated by parking and seating, with visual breakdowns.",
          highlight: "booking-summary",
          imagePlaceholder: "booking-summary.jpg"
        },
        {
          title: "Calendar Integration",
          description: "Your calendar shows all bookings and events. Click on any date to see details.",
          highlight: "calendar-view",
          imagePlaceholder: "calendar-integration.jpg"
        }
      ]
    },
    {
      id: 1,
      title: "Parking Booking",
      description: "Master the parking reservation system",
      icon: <FaCar className="text-2xl" />,
      color: "from-blue-700 to-[#052E19]",
      steps: [
        {
          title: "Navigate to Parking",
          description: "Click on 'Parking Booking' in the left sidebar to access the parking system.",
          highlight: "parking-nav",
          imagePlaceholder: "parking-navigation.jpg"
        },
        {
          title: "Select Date & Time",
          description: "Choose your preferred date, entry time, and exit time for your parking slot.",
          highlight: "parking-datetime",
          imagePlaceholder: "parking-datetime.jpg"
        },
        {
          title: "Choose Your Slot",
          description: "View available parking slots by floor and select the one that suits you best.",
          highlight: "parking-slots",
          imagePlaceholder: "parking-slots.jpg"
        },
        {
          title: "Confirm Booking",
          description: "Review your selection and confirm your parking booking. You'll receive a confirmation.",
          highlight: "parking-confirm",
          imagePlaceholder: "parking-confirmation.jpg"
        }
      ]
    },
    {
      id: 2,
      title: "Seat Booking",
      description: "Reserve your perfect workspace",
      icon: <FaChair className="text-2xl" />,
      color: "from-green-600 to-[#052E19]",
      steps: [
        {
          title: "Access Seat Booking",
          description: "Navigate to 'Seat Booking' to find and reserve your ideal workspace.",
          highlight: "seat-nav",
          imagePlaceholder: "seat-navigation.jpg"
        },
        {
          title: "Browse Floors & Areas",
          description: "Explore different floors and work areas to find the perfect environment for your work.",
          highlight: "seat-areas",
          imagePlaceholder: "seat-areas.jpg"
        },
        {
          title: "Select Your Seat",
          description: "Choose from available seats based on your preferences - window view, team proximity, or quiet zones.",
          highlight: "seat-selection",
          imagePlaceholder: "seat-selection.jpg"
        },
        {
          title: "Set Duration",
          description: "Specify your working hours and any special requirements for your workspace.",
          highlight: "seat-duration",
          imagePlaceholder: "seat-duration.jpg"
        }
      ]
    },
    {
      id: 3,
      title: "Notifications & Profile",
      description: "Stay updated and manage your profile",
      icon: <FaBell className="text-2xl" />,
      color: "from-green-500 to-[#052E19]",
      steps: [
        {
          title: "Notification Center",
          description: "Access your notifications panel on the right to see booking reminders and announcements.",
          highlight: "notifications",
          imagePlaceholder: "notifications-panel.jpg"
        },
        {
          title: "Profile Management",
          description: "Update your profile information, team details, and preferences in the profile section.",
          highlight: "profile-management",
          imagePlaceholder: "profile-management.jpg"
        },
        {
          title: "Settings & Preferences",
          description: "Customize your notification preferences and application settings.",
          highlight: "settings",
          imagePlaceholder: "settings-preferences.jpg"
        },
        {
          title: "Help & Support",
          description: "Access help resources, contact support, or use the floating chat assistant for quick help.",
          highlight: "help-support",
          imagePlaceholder: "help-support.jpg"
        }
      ]
    }
  ];

  const startTutorial = (tutorialIndex) => {
    setCurrentTutorial(tutorialIndex);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const nextStep = () => {
    const tutorial = tutorials[currentTutorial];
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial completed
      setCompletedTutorials(prev => new Set([...prev, currentTutorial]));
      setIsPlaying(false);
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const playPauseTutorial = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-advance tutorial steps
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        nextStep();
      }, 5000); // 5 seconds per step
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentStep, currentTutorial]);

  const FloatingHelper = () => (
    <div className={`fixed bottom-6 left-80 z-50 transition-all duration-500 ${showFloatingHelper ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
      <div className="bg-gradient-to-r from-[#052E19] to-[#0a5d2e] text-white p-4 rounded-2xl shadow-2xl max-w-sm border border-green-400/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-green-400 bg-opacity-20 rounded-full flex items-center justify-center animate-bounce">
            <FaLightbulb className="text-green-300" />
          </div>
          <h4 className="font-bold">Need Help?</h4>
          <button 
            onClick={() => setShowFloatingHelper(false)}
            className="ml-auto text-white opacity-70 hover:opacity-100 text-xl"
          >
            ×
          </button>
        </div>
        <p className="text-sm opacity-90 mb-3">
          Watch our interactive tutorials to master the booking system!
        </p>
        <button
          onClick={() => startTutorial(0)}
          className="bg-green-400 text-[#052E19] px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-300 transition-colors"
        >
          Start Tutorial
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-green-50/30 to-[#052E19]/5">
      <LeftSidebar />
      
      <div className="flex-1 p-8 overflow-hidden">
        {/* Animated Header */}
        <div className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#052E19]/10 to-green-600/10 opacity-10 rounded-3xl blur-3xl"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-4 mb-4 p-4 bg-white rounded-2xl shadow-lg border border-[#052E19]/10">
              <div className="w-12 h-12 bg-gradient-to-r from-[#052E19] to-green-700 rounded-full flex items-center justify-center animate-pulse">
                <FaGraduationCap className="text-white text-xl" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#052E19] to-green-700 bg-clip-text text-transparent">
                  Help Center
                </h1>
                <p className="text-gray-600 text-lg">Interactive Learning Experience</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tutorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {tutorials.map((tutorial, index) => (
            <div
              key={tutorial.id}
              className={`group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 hover:-rotate-1 cursor-pointer ${
                completedTutorials.has(index) ? 'ring-4 ring-green-400' : ''
              }`}
              onClick={() => startTutorial(index)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tutorial.color} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12 group-hover:scale-150 transition-transform duration-1000 delay-200"></div>
              </div>

              <div className="relative z-10 p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                    {tutorial.icon}
                  </div>
                  {completedTutorials.has(index) && (
                    <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-bounce">
                      <FaCheckCircle className="text-white" />
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold mb-3 group-hover:translate-x-2 transition-transform duration-500">
                  {tutorial.title}
                </h3>
                <p className="text-lg opacity-90 mb-6 group-hover:translate-x-2 transition-transform duration-500 delay-100">
                  {tutorial.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{tutorial.steps.length} Steps</span>
                    <div className="flex gap-1">
                      {tutorial.steps.map((_, stepIndex) => (
                        <div
                          key={stepIndex}
                          className="w-2 h-2 bg-white bg-opacity-50 rounded-full group-hover:bg-opacity-100 transition-all duration-300"
                          style={{ animationDelay: `${stepIndex * 100}ms` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium group-hover:translate-x-2 transition-transform duration-500">
                    Start Tutorial <FaPlay className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Active Tutorial Modal */}
        {isPlaying && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${tutorials[currentTutorial].color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-10 animate-pulse"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        {tutorials[currentTutorial].icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{tutorials[currentTutorial].title}</h2>
                        <p className="opacity-90">Step {currentStep + 1} of {tutorials[currentTutorial].steps.length}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${((currentStep + 1) / tutorials[currentTutorial].steps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image Placeholder */}
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 group hover:border-green-400 transition-colors duration-300">
                      <div className="text-center p-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <FaMagic className="text-green-500 text-2xl" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          {tutorials[currentTutorial].steps[currentStep].imagePlaceholder}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">Image placeholder - upload your screenshot here</p>
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex flex-col justify-center">
                    <h3 className="text-3xl font-bold text-gray-800 mb-4 animate-slide-in-right">
                      {tutorials[currentTutorial].steps[currentStep].title}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8 animate-slide-in-right animation-delay-200">
                      {tutorials[currentTutorial].steps[currentStep].description}
                    </p>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        <FaChevronLeft /> Previous
                      </button>

                      <button
                        onClick={playPauseTutorial}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 ${
                          isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {isPlaying ? <FaPause /> : <FaPlay />}
                      </button>

                      <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                      >
                        {currentStep === tutorials[currentTutorial].steps.length - 1 ? 'Complete' : 'Next'} <FaChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-[#052E19]/10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaRocket className="text-[#052E19]" />
            Quick Start Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "First Booking", desc: "Make your first parking or seat reservation", icon: <FaCalendarAlt />, color: "[#052E19]" },
              { title: "Profile Setup", desc: "Complete your profile and preferences", icon: <FaUser />, color: "green-700" },
              { title: "Get Support", desc: "Contact our support team for assistance", icon: <FaQuestionCircle />, color: "green-600" }
            ].map((item, index) => (
              <div key={index} className={`p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 cursor-pointer group border border-[#052E19]/10`}>
                <div className={`w-12 h-12 ${index === 0 ? 'bg-[#052E19]' : index === 1 ? 'bg-green-700' : 'bg-green-600'} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Helper */}
        <FloatingHelper />
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default HelpPage;