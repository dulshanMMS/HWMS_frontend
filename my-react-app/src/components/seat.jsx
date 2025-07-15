import React from 'react';

const Seat = ({ chairId, bookedChairs, onClick, label, isUserBooked }) => {
  const booking = bookedChairs[chairId];
  const isBooked = !!booking;
  const userName = booking?.userName || '';
  const teamColor = booking?.teamColor || '#808080';
  
  // NEW: Extract time information from booking
  const entryTime = booking?.entryTime || '';
  const exitTime = booking?.exitTime || '';
  const timeSlot = booking?.timeSlot || ''; // This might come from API in format "HH:MM - HH:MM"

  const getSeatClasses = () => {
    const baseClasses = `
      w-16 h-8 flex items-center justify-center cursor-pointer
      rounded-md transition-all duration-200 ease-in-out
      text-xs font-semibold border border-gray-300 bg-white
      hover:shadow-sm
    `;

    if (isBooked) {
      return `${baseClasses} text-white`;
    } else {
      return `${baseClasses} text-gray-700 hover:bg-gray-50`;
    }
  };

  const getSeatStyle = () => {
    if (isBooked) {
      return {
        backgroundColor: teamColor,
        borderColor: isUserBooked ? '#ffd700' : undefined,
        borderWidth: isUserBooked ? '3px' : '2px'
      };
    }
    return {};
  };

  // NEW: Enhanced tooltip function
  const getTooltipText = () => {
    if (isBooked) {
      // Try to get time info in different formats
      let timeInfo = '';
      
      if (timeSlot) {
        // If timeSlot exists (format: "09:00 - 11:00")
        timeInfo = timeSlot;
      } else if (entryTime && exitTime) {
        // If separate entry/exit times exist
        timeInfo = `${entryTime} - ${exitTime}`;
      }
      
      if (timeInfo) {
        return `Booked by: ${userName}\nTime: ${timeInfo}`;
      } else {
        return `Booked by: ${userName}`;
      }
    } else {
      return `Available seat: ${label}`;
    }
  };

  return (
    <div
      className={getSeatClasses()}
      style={getSeatStyle()}
      onClick={onClick}
      title={getTooltipText()}
    >
      <span className="truncate px-1 text-center leading-tight">
        {isBooked ? userName : label}
      </span>
    </div>
  );
};

export default Seat;