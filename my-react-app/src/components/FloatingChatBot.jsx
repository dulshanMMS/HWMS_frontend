import React, { useState } from "react";

const FloatingChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = () => {
    if (!userInput.trim()) return;

    const newMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate chatbot reply
    const botReply = { sender: "bot", text: "I'll get back to you shortly." };
    setMessages((prev) => [...prev, newMessage, botReply]);

    setUserInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg z-50"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-xl shadow-lg border z-50 flex flex-col">
          <div className="p-4 border-b font-semibold flex justify-between items-center">
            Chat Assistant
            <button onClick={toggleChat} className="text-gray-500 text-sm">
              ✖
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto max-h-64 space-y-2 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded ${
                  msg.sender === "user"
                    ? "bg-green-100 self-end text-right"
                    : "bg-gray-100 self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex border-t p-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 text-sm px-2 py-1 border rounded-l"
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              className="bg-green-600 text-white px-3 rounded-r text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatBot;
