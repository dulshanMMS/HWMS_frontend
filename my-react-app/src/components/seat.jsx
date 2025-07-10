import React from 'react';
import '../styles/seat.css';

const Seat = ({ chairId, bookedChairs, onClick, label, isUserBooked }) => {
  const booking = bookedChairs[chairId];
  const isBooked = !!booking;
  const memberName = booking?.memberName || '';
  const teamColor = booking?.teamColor || '#808080';

  const getSeatStyle = () => {
    if (isBooked) {
      return {
        backgroundColor: teamColor,
        color: 'white',
        border: isUserBooked ? '3px solid #ffd700' : '1px solid #ccc'
      };
    } else {
      return {
        backgroundColor: '#f0f0f0',
        color: '#333',
        border: '1px solid #ccc'
      };
    }
  };

  return (
    <div
      className="seat"
      style={getSeatStyle()}
      onClick={onClick}
      title={isBooked ? `Booked by: ${memberName}` : `Available seat: ${label}`}
    >
      <span>{isBooked ? memberName : label}</span>
    </div>
  );
};

export default Seat;