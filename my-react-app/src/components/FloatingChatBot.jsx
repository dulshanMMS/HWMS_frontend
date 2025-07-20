import React, { useState, useEffect, useRef } from "react";
import {
  FaUserCircle,
  FaSearch,
  FaCheckCircle,
  FaComments,
  FaQuestionCircle,
  FaTimes,
  FaRobot,
} from "react-icons/fa";

/**
 * FloatingChatBot component provides a floating chat widget with:
 * - A toggle button to open/close chat
 * - Chat interface with predefined questions & answers
 * - Help tab with static help info
 * - Contact Admin form with submission
 */
const FloatingChatBot = () => {
  // Chat open/close state
  const [isOpen, setIsOpen] = useState(false);

  // Active tab: 'home' (chat), 'help', or 'contactAdmin'
  const [activeTab, setActiveTab] = useState("home");

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

  // Premade questions & corresponding answers
  const premadeQuestions = [
    "How do I book a parking slot?",
    "What’s my schedule today?",
    "How to contact support?",
    "Where can I see my booking history?",
  ];

  const premadeAnswers = {
    "How do I book a parking slot?":
      "To book a parking slot, go to the 'Parking' section in your dashboard, select a date, entry and exit time, and choose an available slot.",
    "What’s my schedule today?":
      "You can find today's schedule under 'My Calendar'. It lists all your bookings and events for the day.",
    "How to contact support?":
      "You can contact our support team via the 'Help & Support' tab in your dashboard or email us at support@example.com.",
    "Where can I see my booking history?":
      "Go to 'Booking History' in the dashboard to view all your past and upcoming bookings.",
  };

  // Decode JWT from localStorage to autofill contact form name and email on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      setContactName(decodedPayload.name || decodedPayload.username || "");
      setContactEmail(
        decodedPayload.email ||
          decodedPayload.user_email ||
          decodedPayload.username ||
          ""
      );
    } catch (e) {
      console.error("Failed to parse JWT token", e);
    }
  }, []);

  // Initialize welcome messages when chat opens on home tab and no messages yet
  useEffect(() => {
    if (isOpen && activeTab === "home" && messages.length === 0) {
      const welcomeMessages = [
        { sender: "bot", text: "👋 Hello! I'm your assistant bot." },
        {
          sender: "bot",
          text: "Here are some things you can ask:",
          suggestions: premadeQuestions,
        },
      ];
      setMessages(welcomeMessages);
    }
  }, [isOpen, activeTab, messages.length]);

  // Scroll chat window to latest message when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler for user input or suggested question buttons
  const sendMessage = (text = userInput) => {
    if (!text.trim()) return;

    const userMessage = { sender: "user", text };
    const botResponseText =
      premadeAnswers[text] || "Thanks! I'll get back to you shortly.";
    const botMessage = { sender: "bot", text: botResponseText };
    const suggestionMessage = {
      sender: "bot",
      text: "Anything else you'd like to ask?",
      suggestions: premadeQuestions,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      botMessage,
      suggestionMessage,
    ]);
    setUserInput("");
  };

  // Contact Admin form submission handler (simulate API call)
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (
      !contactName.trim() ||
      !contactEmail.trim() ||
      !contactSubject.trim() ||
      !contactMessage.trim()
    )
      return;

    setIsSubmitting(true);
    setSubmitSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/support/submit", {
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

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to send support request");
      }

      setSubmitSuccess(true);
      setContactSubject("");
      setContactMessage("");
    } catch (err) {
      setSubmitSuccess(false);
      console.error("Support request error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle chat open/close; reset to home tab on open
  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setActiveTab("home");
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
        {isOpen ? <FaTimes size={24} /> : < FaRobot size={24} />}
      </button>

      {/* Chat window panel */}
      <div
        className={`fixed bottom-20 right-6 z-50 flex flex-col bg-white rounded-xl shadow-xl border
          transition-all duration-500 ease-in-out
          ${
            isOpen
              ? "opacity-100 scale-100 pointer-events-auto w-[460px] h-[650px]"
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
            onClick={() => setActiveTab("home")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 hover:bg-green-800 transition-colors
            ${
              activeTab === "home"
                ? "bg-green-900 shadow-inner"
                : "bg-green-700"
            }`}
            aria-selected={activeTab === "home"}
            role="tab"
            type="button"
          >
            < FaRobot/>
            Chat
          </button>
          <button
            onClick={() => setActiveTab("help")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 hover:bg-green-800 transition-colors
            ${
              activeTab === "help"
                ? "bg-green-900 shadow-inner"
                : "bg-green-700"
            }`}
            aria-selected={activeTab === "help"}
            role="tab"
            type="button"
          >
            <FaQuestionCircle />
            Help
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
        <main className="flex-1 p-4 overflow-hidden flex flex-col">
          {/* Chat messages tab */}
          {activeTab === "home" && (
            <>
              <section
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-100"
                aria-live="polite"
                role="log"
                aria-relevant="additions"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 max-w-[80%] px-3 py-2 rounded-lg shadow
                      ${
                        msg.sender === "user"
                          ? "ml-auto bg-green-100 text-green-900"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {msg.text}
                    {msg.suggestions && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {msg.suggestions.map((sugg, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(sugg)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-full text-xs"
                          >
                            {sugg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </section>
            </>
          )}

          {/* Help tab */}
          {activeTab === "help" && (
            <section
              className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-100"
              aria-label="Help content"
            >
              <h2 className="text-lg font-semibold mb-4">Help Collections</h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>How to use the parking system</li>
                <li>Booking and cancellation policies</li>
                <li>Contacting support</li>
                <li>Account management</li>
                <li>Payment options</li>
              </ul>
            </section>
          )}

          {/* Contact Admin form tab */}
          {activeTab === "contactAdmin" && (
            <section className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-100">
              <h2 className="text-lg font-semibold mb-4">Contact Admin</h2>
              {submitSuccess && (
                <p className="mb-4 text-green-700 font-semibold">
                  Message sent successfully!
                </p>
              )}
              <form
                onSubmit={handleContactSubmit}
                className="flex flex-col gap-4"
              >
                <label className="flex flex-col">
                  <span className="font-semibold mb-1">Name</span>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your name"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="font-semibold mb-1">Email</span>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your email"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="font-semibold mb-1">Subject</span>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    required
                    className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Subject"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="font-semibold mb-1">Message</span>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                    rows={5}
                    placeholder="Write your message here"
                  />
                </label>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !contactName.trim() ||
                    !contactEmail.trim() ||
                    !contactSubject.trim() ||
                    !contactMessage.trim()
                  }
                  className={`bg-green-600 hover:bg-green-700 rounded-md px-4 py-2 text-white transition ${
                    isSubmitting ||
                    !contactName.trim() ||
                    !contactEmail.trim() ||
                    !contactSubject.trim() ||
                    !contactMessage.trim()
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
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
