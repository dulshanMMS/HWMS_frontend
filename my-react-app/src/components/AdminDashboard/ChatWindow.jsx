import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

const ChatWindow = ({ user, messages, onBack, onMarkAsReplied }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  const totalPages = Math.ceil(messages.length / messagesPerPage);
  const startIdx = (currentPage - 1) * messagesPerPage;
  const currentMessages = messages.slice(startIdx, startIdx + messagesPerPage);

  return (
    <div className="flex flex-col h-full bg-gray-50 animate-fade-in">
      <div className="flex items-center justify-between p-3 bg-green-700 text-white shadow">
        <div className="flex items-center gap-2">
          <FaUserCircle className="text-2xl" />
          <span className="font-semibold">
            {user.firstName || user.email}
          </span>
        </div>
        <button onClick={onBack} className="text-sm hover:underline">
          ← Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {currentMessages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm mt-10">No messages found.</p>
        ) : (
          currentMessages.map((msg) => (
            <div
              key={msg._id}
              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-sm text-gray-800"
            >
              <p className="font-semibold text-green-800">{msg.subject}</p>
              <p className="mt-1">{msg.message}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    msg.status === "replied"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {msg.status}
                </span>
              </div>
              {msg.status === "pending" && (
                <button
                  className="mt-2 text-xs text-blue-500 hover:underline"
                  onClick={() => onMarkAsReplied([msg._id])}
                >
                  ✅ Mark as Replied
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t flex items-center justify-between text-xs text-gray-600">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            currentPage === 1 ? "text-gray-300 cursor-not-allowed" : ""
          }`}
        >
          ← Prev
        </button>

        <span className="font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : ""
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
