import React from "react";

const MessageBox = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mt-4 text-center text-green-600 font-semibold">
      {message}
    </div>
  );
};

export default MessageBox;
