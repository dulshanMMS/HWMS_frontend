import React from 'react';

const Seat = ({ chairId, bookedChairs, onClick, label, isUserBooked, seatSize = "normal" }) => {
  const booking = bookedChairs[chairId];
  const isBooked = !!booking;
  const userName = booking?.userName || '';
  const teamColor = booking?.teamColor || '#808080';
  
  // Extract time information from booking
  const entryTime = booking?.entryTime || '';
  const exitTime = booking?.exitTime || '';
  const timeSlot = booking?.timeSlot || '';

  const getSeatClasses = () => {
    // Fully responsive sizes for all screen sizes
    let sizeClasses = '';
    let textClasses = '';
    
    switch (seatSize) {
      case 'small':
        sizeClasses = 'w-11 h-5'; // Mobile and small tablets
        textClasses = 'text-xs';
        break;
      case 'medium':
        sizeClasses = 'w-14 h-6'; // Medium tablets
        textClasses = 'text-xs';
        break;
      default: // normal
        sizeClasses = 'w-16 h-7'; // Desktop and large screens
        textClasses = 'text-xs';
    }

    const baseClasses = `
      ${sizeClasses} flex items-center justify-center cursor-pointer
      rounded-lg transition-all duration-200 ease-in-out
      ${textClasses} font-medium border-2 shadow-sm
    `;

    if (isBooked) {
      return `${baseClasses} text-white border-gray-400`;
    } else {
      return `${baseClasses} text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400`;
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

  // Enhanced tooltip function
  const getTooltipText = () => {
    if (isBooked) {
      let timeInfo = '';
      
      if (timeSlot) {
        timeInfo = timeSlot;
      } else if (entryTime && exitTime) {
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

  // Fully responsive label display
  const getDisplayLabel = () => {
    if (isBooked) {
      // Show username with appropriate truncation for all screen sizes
      if (seatSize === 'small') {
        const firstName = userName.split(' ')[0];
        return firstName.length > 4 ? firstName.substring(0, 3) + '..' : firstName;
      } else if (seatSize === 'medium') {
        return userName.length > 6 ? userName.substring(0, 5) + '..' : userName;
      } else {
        return userName.length > 8 ? userName.substring(0, 7) + '..' : userName;
      }
    } else {
      // Show appropriate labels for each screen size
      if (seatSize === 'small') {
        return label.replace('Seat-', 'S');
      } else if (seatSize === 'medium') {
        return label.replace('Seat-', 'S-');
      } else {
        return label; // Full "Seat-X" for desktop
      }
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
        {getDisplayLabel()}
      </span>
    </div>
  );
};

export default Seat;