import React from "react";

const MessageBox = ({ message }) => {
  if (!message) return null;

  // Check if message is an error (contains certain keywords)
  const isError = message.toLowerCase().includes('cannot') || 
                  message.toLowerCase().includes('failed') || 
                  message.toLowerCase().includes('incorrect') ||
                  message.toLowerCase().includes('past date') ||
                  message.toLowerCase().includes('past time') ||
                  message.toLowerCase().includes('please select') ||
                  message.toLowerCase().includes('must be after') ||
                  message.toLowerCase().includes('required');

  return (
    <div className={`mt-4 text-center font-semibold ${
      isError ? 'text-red-600' : 'text-green-600'
    }`}>
      {message}
    </div>
  );
};

export default MessageBox;