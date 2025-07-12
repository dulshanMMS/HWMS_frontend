import React from "react";

const BookButton = ({ selectedSlot, onBook, loading }) => {
  if (!selectedSlot) return null;

  return (
    <div className="flex justify-center">
      <button
        onClick={onBook}
        className="btn btn-primary mt-16 w-1/3 p-4 bg-green-900 text-white rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        disabled={loading}
      >
        {loading ? "Booking..." : `Book Slot ${selectedSlot}`}
      </button>
    </div>
  );
};

export default BookButton;
