import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaPlus,
  FaPaperPlane,
  FaSmile,
  FaPaperclip,
  FaEllipsisV,
  FaPhone,
  FaVideo,
  FaTimes,
  FaThumbtack,
  FaBell,
  FaBellSlash,
  FaReply,
  FaTrash,
  FaCheck,
  FaCheckDouble,
  FaComments,
  FaUsers,
  FaArrowLeft,
} from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import LeftSidebar from "../components/LeftSidebar";

const MessagingPage = () => {
  // Core states
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // UI states
  const [showNewChat, setShowNewChat] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showConversationList, setShowConversationList] = useState(true);

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const token = localStorage.getItem("token");
  // Get current user info properly
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.id;
  const currentUsername = currentUser.username;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowConversationList(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch real conversations from backend
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/messages/conversations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setConversations(response.data.conversations || []);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchConversations();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);

    try {
      // Load real messages from backend
      const response = await axios.get(
        `http://localhost:5000/api/messages/conversations/${conversation._id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages(response.data.messages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }

    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      // Send message to backend
      const response = await axios.post(
        `http://localhost:5000/api/messages/conversations/${activeConversation._id}/messages`,
        {
          content: newMessage.trim(),
          messageType: "text",
          replyTo: replyingTo?._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const savedMessage = response.data.message;

        // Add message to local state
        setMessages((prev) => [...prev, savedMessage]);

        // Update conversation's last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === activeConversation._id
              ? {
                  ...conv,
                  lastMessage: {
                    content: savedMessage.content,
                    sender: savedMessage.senderName,
                    timestamp: savedMessage.createdAt,
                  },
                  updatedAt: savedMessage.createdAt,
                }
              : conv
          )
        );

        // Clear input and reset state
        setNewMessage("");
        setReplyingTo(null);

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/search/users?query=${encodeURIComponent(
          query
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
      // Mock users for demo if API not ready
      setSearchResults(
        [
          {
            _id: "1",
            firstName: "John",
            lastName: "Doe",
            username: "john.doe",
            email: "john@company.com",
            profilePhoto: "https://i.pravatar.cc/40?img=1",
            displayName: "John Doe",
            teamInfo: { name: "Development Team" },
          },
          {
            _id: "2",
            firstName: "Sarah",
            lastName: "Wilson",
            username: "sarah.wilson",
            email: "sarah@company.com",
            profilePhoto: "https://i.pravatar.cc/40?img=2",
            displayName: "Sarah Wilson",
            teamInfo: { name: "Design Team" },
          },
        ].filter(
          (user) =>
            user.displayName.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  const createConversation = async (participantIds, type = "direct") => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/messages/conversations",
        {
          participantIds,
          conversationType: type,
          groupName: type === "group" ? groupName : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const conversation = response.data.conversation;

        // Format the conversation for frontend display
        const formattedConversation = {
          _id: conversation._id,
          conversationType: conversation.conversationType,
          participants: conversation.participants,
          displayName:
            conversation.conversationType === "group"
              ? conversation.groupName
              : selectedUsers.map((u) => u.displayName).join(", "),
          displayPhoto:
            conversation.conversationType === "group"
              ? conversation.groupPhoto
              : selectedUsers[0]?.profilePhoto,
          lastMessage: conversation.lastMessage,
          totalMessages: conversation.totalMessages || 0,
          updatedAt: conversation.updatedAt || new Date(),
          isOnline: true, // Default to online for new conversations
        };

        // Add to conversations list if new
        if (response.data.isNew) {
          setConversations((prev) => [formattedConversation, ...prev]);
        }

        // Set as active conversation
        setActiveConversation(formattedConversation);

        // Load messages for this conversation (will be empty initially)
        setMessages([]);

        // Close modals and reset state
        setShowNewChat(false);
        setShowUserSearch(false);
        setSelectedUsers([]);
        setGroupName("");

        // Hide conversation list on mobile
        if (isMobile) {
          setShowConversationList(false);
        }
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      // Show error message to user
      alert("Failed to create conversation. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <LeftSidebar />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <LeftSidebar />

      <div className="flex-1 flex max-h-screen">
        {/* Conversations List */}
        <div
          className={`${
            showConversationList || !isMobile ? "w-full md:w-80" : "hidden"
          } bg-white border-r border-gray-200 flex flex-col`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <FaComments className="text-green-600 text-xl" />
                </div>
                Messages
              </h2>
              <button
                onClick={() => setShowNewChat(true)}
                className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 hover:scale-105 shadow-lg"
                title="Start new conversation"
              >
                <FaPlus className="text-lg" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaComments className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No conversations yet
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Start messaging your colleagues about workspace bookings
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                >
                  Start Messaging
                </button>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                    activeConversation?._id === conversation._id
                      ? "bg-green-50 border-l-4 border-l-green-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center ring-2 ring-white shadow-sm">
                        <span className="text-sm font-semibold text-gray-600">
                          {conversation.displayName
                            ? conversation.displayName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "?"}
                        </span>
                      </div>
                      {conversation.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                      {conversation.conversationType === "group" && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <FaUsers className="text-white text-xs" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                          {conversation.displayName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.updatedAt)}
                        </span>
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.sender}:{" "}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area - Made wider */}
        <div
          className={`${
            !showConversationList || !isMobile
              ? "flex-1"
              : "hidden md:flex md:flex-1"
          } flex flex-col bg-white max-w-4xl`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {isMobile && (
                      <button
                        onClick={() => setShowConversationList(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FiArrowLeft className="text-gray-600" />
                      </button>
                    )}

                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600">
                          {activeConversation.displayName
                            ? activeConversation.displayName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "?"}
                        </span>
                      </div>
                      {activeConversation.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {activeConversation.displayName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {activeConversation.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-green-50/30 to-white">
                {messages.map((message) => {
                  const isOwn = message.sender._id === "current";

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md ${
                          isOwn ? "order-2" : "order-1"
                        }`}
                      >
                        {/* Reply context */}
                        {message.replyTo && (
                          <div className="mb-2 p-2 bg-gray-200 rounded-lg text-sm">
                            <p className="text-gray-600">Replying to:</p>
                            <p className="truncate">
                              {message.replyTo.content}
                            </p>
                          </div>
                        )}

                        <div
                          className={`p-4 rounded-2xl shadow-sm ${
                            isOwn
                              ? "bg-green-500 text-white rounded-br-md"
                              : "bg-white text-gray-900 border border-gray-100 rounded-bl-md"
                          } ${message.isDeleted ? "italic opacity-75" : ""}`}
                        >
                          {!isOwn &&
                            activeConversation.conversationType === "group" && (
                              <p className="text-xs font-semibold mb-2 opacity-75">
                                {message.senderName}
                              </p>
                            )}

                          {/* Booking context */}
                          {message.messageType === "booking" &&
                            message.bookingContext && (
                              <div
                                className={`p-3 rounded-lg mb-2 ${
                                  isOwn ? "bg-green-600" : "bg-green-50"
                                } border-l-4 border-green-500`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <FaComments
                                    className={`text-sm ${
                                      isOwn
                                        ? "text-green-100"
                                        : "text-green-600"
                                    }`}
                                  />
                                  <span
                                    className={`text-sm font-medium ${
                                      isOwn
                                        ? "text-green-100"
                                        : "text-green-700"
                                    }`}
                                  >
                                    {message.bookingContext.bookingType ===
                                    "seat"
                                      ? "Seat Booking"
                                      : "Parking Booking"}
                                  </span>
                                </div>
                                <p
                                  className={`text-sm ${
                                    isOwn ? "text-green-100" : "text-green-600"
                                  }`}
                                >
                                  📅 {message.bookingContext.bookingDate}
                                </p>
                                <p
                                  className={`text-sm ${
                                    isOwn ? "text-green-100" : "text-green-600"
                                  }`}
                                >
                                  📍 {message.bookingContext.slotInfo}
                                </p>
                              </div>
                            )}

                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-75">
                              {formatTime(message.createdAt)}
                            </span>
                            {isOwn && (
                              <FaCheckDouble className="text-green-200 text-xs" />
                            )}
                          </div>
                        </div>
                      </div>

                      {!isOwn && (
                        <img
                          src={
                            activeConversation.displayPhoto ||
                            "https://i.pravatar.cc/32"
                          }
                          alt={message.senderName}
                          className="w-8 h-8 rounded-full object-cover order-1 mr-3 mt-auto"
                        />
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply indicator */}
              {replyingTo && (
                <div className="bg-green-50 border-t border-green-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FaReply className="text-green-600" />
                      <span className="text-sm text-green-800">
                        Replying to: {replyingTo.content.substring(0, 50)}...
                      </span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      ref={messageInputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type your message..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaComments className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Welcome to HWMS Messaging
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Connect with your colleagues to coordinate workspace bookings,
                  discuss seating arrangements, and collaborate effectively.
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-semibold shadow-lg hover:scale-105"
                >
                  Start Your First Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  New Conversation
                </h3>
                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setShowUserSearch(false);
                    setSelectedUsers([]);
                    setGroupName("");
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!showUserSearch ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowUserSearch(true)}
                    className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <FaSearch className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Find Colleagues
                        </h4>
                        <p className="text-sm text-gray-500">
                          Search and message your teammates
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      /* Handle team chat creation */
                    }}
                    className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <FaUsers className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Team Chat
                        </h4>
                        <p className="text-sm text-gray-500">
                          Start a group conversation
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Back Button */}
                  <button
                    onClick={() => {
                      setShowUserSearch(false);
                      setSearchResults([]);
                      setSelectedUsers([]);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <FaArrowLeft />
                    <span>Back</span>
                  </button>

                  {/* User Search */}
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, username, or email..."
                      onChange={(e) => searchUsers(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>

                  {/* Selected Users */}
                  {selectedUsers.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        Selected ({selectedUsers.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center space-x-2 bg-green-100 rounded-full px-3 py-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-600">
                                {user.displayName
                                  ? user.displayName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                  : "?"}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-green-800">
                              {user.displayName}
                            </span>
                            <button
                              onClick={() =>
                                setSelectedUsers((prev) =>
                                  prev.filter((u) => u._id !== user._id)
                                )
                              }
                              className="text-green-600 hover:text-green-800 ml-1"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {selectedUsers.length > 1 && (
                        <input
                          type="text"
                          placeholder="Group name (optional)"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      )}

                      <button
                        onClick={() =>
                          createConversation(
                            selectedUsers.map((u) => u._id),
                            selectedUsers.length > 1 ? "group" : "direct"
                          )
                        }
                        className="w-full p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                      >
                        Start Conversation ({selectedUsers.length}{" "}
                        {selectedUsers.length === 1 ? "person" : "people"})
                      </button>
                    </div>
                  )}

                  {/* Search Results */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <div className="text-center py-8">
                        <FaUsers className="mx-auto text-gray-300 text-3xl mb-3" />
                        <p className="text-gray-500">
                          Search for colleagues to start messaging
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium">
                          Search Results ({searchResults.length}):
                        </p>
                        {searchResults.map((user) => (
                          <div
                            key={user._id}
                            onClick={() => {
                              if (
                                selectedUsers.some((u) => u._id === user._id)
                              ) {
                                setSelectedUsers((prev) =>
                                  prev.filter((u) => u._id !== user._id)
                                );
                              } else {
                                setSelectedUsers((prev) => [...prev, user]);
                              }
                            }}
                            className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                              selectedUsers.some((u) => u._id === user._id)
                                ? "bg-green-50 border-green-300 shadow-sm"
                                : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-gray-600">
                                    {user.displayName
                                      ? user.displayName
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                      : "?"}
                                  </span>
                                </div>
                                {selectedUsers.some(
                                  (u) => u._id === user._id
                                ) && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <FaCheck className="text-white text-xs" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {user.displayName}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  @{user.username}
                                </p>
                                {user.teamInfo && (
                                  <p className="text-xs text-gray-400 truncate">
                                    Team: {user.teamInfo.name}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-xs text-gray-400 mt-1">
                                  Online
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPage;
