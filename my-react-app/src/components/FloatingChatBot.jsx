import React, { useState, useEffect, useRef } from "react";
import {
  FaUserCircle,
  FaSearch,
  FaCheckCircle,
  FaComments,
  FaQuestionCircle,
  FaTimes,
  FaRobot,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";

/**
 * FloatingChatBot component provides a floating chat widget with:
 * - A toggle button to open/close chat
 * - Chat interface with keyword-based responses
 * - Contact Admin form with submission
 */
const FloatingChatBot = () => {
  // Chat open/close state
  const [isOpen, setIsOpen] = useState(false);

  // Active tab: 'chat' or 'contactAdmin'
  const [activeTab, setActiveTab] = useState("chat");

  // Chat messages array (each with sender and text, optional suggestions)
  const [messages, setMessages] = useState([]);

  // Current user input text in chat
  const [userInput, setUserInput] = useState("");

  // Ref for scrolling to latest message
  const chatEndRef = useRef(null);

  // Contact admin form fields and submission state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Enhanced keywords and responses system
  const keywordResponses = {
    // Booking related
    'book': {
      response: "To book a workspace, go to the dashboard and select either 'Seat Booking' or 'Parking Booking'. Choose your preferred date, time, and available slot.",
      suggestions: ["How to cancel booking?", "Booking history", "Available slots"]
    },
    'booking': {
      response: "For booking assistance: You can book seats and parking through your dashboard. Each booking requires selecting a date, entry/exit time, and available slot.",
      suggestions: ["Book parking", "Book seat", "Cancel booking"]
    },
    'seat': {
      response: "Seat booking allows you to reserve workspace seats. Go to 'Seat Booking' section, select date and time, then choose from available seats on the floor plan.",
      suggestions: ["Seat booking process", "Available floors", "Cancel seat"]
    },
    'parking': {
      response: "Parking booking lets you reserve parking spots. Navigate to 'Parking Booking', select your date/time, and choose an available parking slot.",
      suggestions: ["Parking floors", "Parking rates", "Cancel parking"]
    },
    'cancel': {
      response: "To cancel a booking, go to your 'Booking History' or 'My Calendar', find the booking you want to cancel, and click the cancel button. Note: Cancellation policies may apply.",
      suggestions: ["Cancellation policy", "Refund process", "Reschedule booking"]
    },
    
    // Schedule and calendar
    'schedule': {
      response: "Your schedule can be viewed in 'My Calendar' section. It shows all your upcoming bookings, past bookings, and available time slots.",
      suggestions: ["Today's schedule", "Upcoming bookings", "Booking history"]
    },
    'calendar': {
      response: "The calendar view shows all your bookings, events, and available dates. You can click on any date to see detailed booking information for that day.",
      suggestions: ["Add booking", "View today", "Monthly view"]
    },
    'today': {
      response: "To see today's schedule, check the 'Today's Schedule' section on your dashboard or go to the calendar and select today's date.",
      suggestions: ["Book for today", "Available now", "My bookings today"]
    },
    
    // Account and profile
    'profile': {
      response: "Access your profile by clicking the profile icon in the sidebar. You can update personal information, team details, and notification preferences.",
      suggestions: ["Update profile", "Change password", "Team settings"]
    },
    'account': {
      response: "Your account settings include profile information, team assignment, notification preferences, and security settings. Access via the profile section.",
      suggestions: ["Profile settings", "Security", "Notifications"]
    },
    'password': {
      response: "To change your password, go to Profile Settings and look for the security section. You'll need to verify your current password first.",
      suggestions: ["Forgot password", "Security settings", "Two-factor auth"]
    },
    
    // Technical help
    'login': {
      response: "For login issues: Ensure you're using the correct email/username and password. If you forgot your password, use the 'Forgot Password' link on the login page.",
      suggestions: ["Reset password", "Login problems", "Account locked"]
    },
    'error': {
      response: "If you're experiencing errors, try refreshing the page first. For persistent issues, please contact admin with details about what you were doing when the error occurred.",
      suggestions: ["Common errors", "Report bug", "Contact admin"]
    },
    'slow': {
      response: "If the system is running slowly, try clearing your browser cache or refreshing the page. The issue might be temporary due to high server load.",
      suggestions: ["Clear cache", "Browser settings", "System status"]
    },
    
    // General help
    'help': {
      response: "I'm here to help! You can ask me about booking seats/parking, viewing your schedule, managing your profile, or any technical issues you're experiencing.",
      suggestions: ["How to book?", "My schedule", "Profile settings", "Contact admin"]
    },
    'how': {
      response: "I can guide you through various processes. What would you like to know how to do? Common tasks include booking, canceling, viewing schedules, and updating profiles.",
      suggestions: ["How to book?", "How to cancel?", "How to view schedule?"]
    },
    'notification': {
      response: "Notifications keep you updated about your bookings. You can manage notification preferences in your profile settings to control what alerts you receive.",
      suggestions: ["Notification settings", "Turn off notifications", "Email alerts"]
    }
  };

  // Get quick suggestions for welcome message
  const quickSuggestions = [
    "How do I book a seat?",
    "What's my schedule today?",
    "How to contact admin?",
    "Cancel my booking"
  ];

  // Fetch user profile to autofill contact form on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // First try to get user profile from API
        const response = await fetch("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userProfile = await response.json();
          setContactName(`${userProfile.firstName} ${userProfile.lastName}`.trim());
          setContactEmail(userProfile.email || "");
        } else {
          // Fallback: decode JWT token
          const payloadBase64 = token.split(".")[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          
          console.log("JWT payload:", decodedPayload); // Debug log
          
          setContactName(
            decodedPayload.name || 
            decodedPayload.fullName || 
            decodedPayload.username || 
            ""
          );
          setContactEmail(
            decodedPayload.email ||
            decodedPayload.user_email ||
            ""
          );
        }
      } catch (e) {
        console.error("Failed to fetch user profile or parse JWT token", e);
        
        // Last resort: try basic JWT decode
        try {
          const token = localStorage.getItem("token");
          const payloadBase64 = token.split(".")[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          
          setContactName(decodedPayload.username || "");
          // Don't set email from username - leave it empty for user to fill
        } catch (decodeError) {
          console.error("JWT decode also failed:", decodeError);
        }
      }
    };

    fetchUserProfile();
  }, []);

  // Initialize welcome messages when chat opens and no messages yet
  useEffect(() => {
    if (isOpen && activeTab === "chat" && messages.length === 0) {
      const welcomeMessages = [
        { sender: "bot", text: "👋 Hello! I'm your HWMS assistant." },
        {
          sender: "bot",
          text: "I can help you with bookings, schedules, and system questions. Try asking me something!",
          suggestions: quickSuggestions,
        },
      ];
      setMessages(welcomeMessages);
    }
  }, [isOpen, activeTab, messages.length]);

  // Scroll chat window to latest message when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enhanced keyword matching function
  const findBestMatch = (userInput) => {
    const input = userInput.toLowerCase().trim();
    const words = input.split(' ');
    
    // Direct keyword match
    for (const keyword in keywordResponses) {
      if (input.includes(keyword)) {
        return keywordResponses[keyword];
      }
    }
    
    // Multi-word matching
    for (const word of words) {
      if (keywordResponses[word]) {
        return keywordResponses[word];
      }
    }
    
    // Partial matches
    const partialMatches = {
      'book': ['reserve', 'schedule', 'appointment'],
      'cancel': ['remove', 'delete', 'stop'],
      'schedule': ['agenda', 'calendar', 'time'],
      'help': ['assist', 'support', 'guide'],
      'login': ['signin', 'access', 'enter'],
      'profile': ['settings', 'account', 'info']
    };
    
    for (const [keyword, synonyms] of Object.entries(partialMatches)) {
      if (synonyms.some(synonym => input.includes(synonym))) {
        return keywordResponses[keyword];
      }
    }
    
    // Default response
    return {
      response: "I understand you need help! Could you please be more specific? I can assist with bookings, schedules, profile settings, or technical issues.",
      suggestions: ["How to book?", "My schedule", "Profile help", "Technical issues"]
    };
  };

  // Send message handler for user input or suggested question buttons
  const sendMessage = (text = userInput) => {
    if (!text.trim()) return;

    const userMessage = { sender: "user", text };
    const botResponse = findBestMatch(text);
    const botMessage = { 
      sender: "bot", 
      text: botResponse.response,
      suggestions: botResponse.suggestions
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setUserInput("");
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Contact Admin form submission handler (fixed with better debugging)
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (
      !contactName.trim() ||
      !contactEmail.trim() ||
      !contactSubject.trim() ||
      !contactMessage.trim()
    ) {
      console.log("Validation failed - empty fields");
      setSubmitSuccess(false);
      setTimeout(() => setSubmitSuccess(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(null);

    try {
      const token = localStorage.getItem("token");
      console.log("Submitting support request:", {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        messageLength: contactMessage.length
      });

      const response = await fetch("http://localhost:5000/api/support/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage,
        }),
      });

      console.log("Response status:", response.status);
      
      // Try to parse response
      let result;
      try {
        result = await response.json();
        console.log("Response data:", result);
      } catch (parseError) {
        console.log("Failed to parse JSON response:", parseError);
        const textResponse = await response.text();
        console.log("Raw response:", textResponse);
        throw new Error("Invalid server response format");
      }

      if (response.ok) {
        console.log("Support request submitted successfully");
        setSubmitSuccess(true);
        setContactSubject("");
        setContactMessage("");
        setTimeout(() => setSubmitSuccess(null), 5000);
      } else {
        console.log("Server error:", result);
        throw new Error(result.message || `Server error: ${response.status}`);
      }
    } catch (err) {
      console.error("Support request error:", err);
      setSubmitSuccess(false);
      
      // Show the actual error in development
      if (process.env.NODE_ENV === 'development') {
        alert(`Debug Error: ${err.message}`);
      }
      
      setTimeout(() => setSubmitSuccess(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle chat open/close; reset to chat tab on open
  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setActiveTab("chat");
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating chat toggle button */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className={`fixed bottom-6 right-6 z-50 rounded-full shadow-lg flex items-center justify-center
          transition-all duration-500
          ${
            isOpen
              ? "w-14 h-14 bg-red-600 text-white hover:bg-red-700"
              : "w-16 h-16 bg-green-600 text-white hover:bg-green-700"
          }`}
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
      </button>

      {/* Chat window panel */}
      <div
        className={`fixed bottom-20 right-6 z-50 flex flex-col bg-white rounded-xl shadow-xl border
          transition-all duration-500 ease-in-out
          ${
            isOpen
              ? "opacity-100 scale-100 pointer-events-auto w-[480px] h-[650px]"
              : "opacity-0 scale-90 pointer-events-none w-0 h-0"
          }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chatbot-header"
      >
        {/* Header tabs */}
        <header
          id="chatbot-header"
          className="flex bg-green-700 rounded-t-xl text-white font-semibold"
        >
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 hover:bg-green-800 transition-colors
            ${
              activeTab === "chat"
                ? "bg-green-900 shadow-inner"
                : "bg-green-700"
            }`}
            aria-selected={activeTab === "chat"}
            role="tab"
            type="button"
          >
            <FaRobot />
            Chat Assistant
          </button>
          <button
            onClick={() => setActiveTab("contactAdmin")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 hover:bg-green-800 transition-colors
            ${
              activeTab === "contactAdmin"
                ? "bg-green-900 shadow-inner"
                : "bg-green-700"
            }`}
            aria-selected={activeTab === "contactAdmin"}
            role="tab"
            type="button"
          >
            <FaUserCircle />
            Contact Admin
          </button>
        </header>

        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat messages tab */}
          {activeTab === "chat" && (
            <>
              <section
                className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-100"
                aria-live="polite"
                role="log"
                aria-relevant="additions"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-md ${
                        msg.sender === "user"
                          ? "bg-green-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      {msg.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.suggestions.map((sugg, i) => (
                            <button
                              key={i}
                              onClick={() => sendMessage(sugg)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-xs transition-colors duration-200"
                            >
                              {sugg}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </section>

              {/* Chat input */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about bookings, schedules, or any help you need..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!userInput.trim()}
                    className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Contact Admin form tab */}
          {activeTab === "contactAdmin" && (
            <section className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-100">
              <h2 className="text-lg font-semibold mb-4">Contact Admin</h2>
              
              {/* Success/Error Messages */}
              {submitSuccess === true && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle />
                    <span className="font-medium">Message sent successfully!</span>
                  </div>
                  <p className="text-sm mt-1">Admin will respond to your inquiry soon.</p>
                </div>
              )}
              
              {submitSuccess === false && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaTimes />
                    <span className="font-medium">Failed to send message</span>
                  </div>
                  <p className="text-sm mt-1">Please check all fields and try again.</p>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your.email@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Please describe your issue in detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !contactName.trim() ||
                    !contactEmail.trim() ||
                    !contactSubject.trim() ||
                    !contactMessage.trim()
                  }
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    </>
  );
};

export default FloatingChatBot;