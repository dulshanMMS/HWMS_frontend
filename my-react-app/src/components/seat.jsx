import React from 'react';
import '../styles/seat.css';

const Seat = ({ chairId, bookedChairs, onClick, label }) => {
  const booking = bookedChairs[chairId];
  const isBooked = !!booking;
  const memberName = booking?.memberName || '';
  const teamColor = booking?.teamColor || '#e6ffe9';

  return (
    <div
      className={`seat ${isBooked ? 'booked' : ''}`}
      style={isBooked ? { backgroundColor: teamColor } : {}}
      onClick={onClick}
    >
      <span>{isBooked ? memberName : label}</span>
    </div>
  );
};

export default Seat;