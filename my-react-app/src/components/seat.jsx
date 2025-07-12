import React from 'react';

const Seat = ({ chairId, bookedChairs, onClick, label, isUserBooked }) => {
  const booking = bookedChairs[chairId];
  const isBooked = !!booking;
  const userName = booking?.userName || '';  // ✅ CHANGED: memberName → userName
  const teamColor = booking?.teamColor || '#808080';

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

  return (
    <div
      className={getSeatClasses()}
      style={getSeatStyle()}
      onClick={onClick}
      title={isBooked ? `Booked by: ${userName}` : `Available seat: ${label}`}  // ✅ CHANGED: memberName → userName
    >
      <span className="truncate px-1 text-center leading-tight">
        {isBooked ? userName : label}  {/* ✅ CHANGED: memberName → userName */}
      </span>
    </div>
  );
};

export default Seat;