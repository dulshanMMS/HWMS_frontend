import React from 'react';
import Seat from './seat';
import TableGroup from './TableGroup';
import '../styles/seatgrid.css';

const SeatGrid = ({ entered, bookedChairs, onChairClick }) => {
  const rooms = [
    { id: 'T1', tableNum: 1 },
    { id: 'T2', tableNum: 2 },
    { id: 'T3', tableNum: 3 },
    { id: 'T4', tableNum: 4 },
    { id: 'T5', tableNum: 5 },
    { id: 'T6', tableNum: 6 },
    { id: 'T7', tableNum: 7 },
    { id: 'T8', tableNum: 8 },
  ];

  return (
    <div className="seat-grid">
      <div className="room-container">
        {rooms.slice(0, 4).map(({ id, tableNum }) => (
          <div key={id} className="room">
            <div className="seats-row">
              {Array.from({ length: 4 }, (_, i) => (
                <Seat
                  key={i}
                  chairId={`${id}-chair${i + 1}`}
                  roomId={id}
                  bookedChairs={bookedChairs}
                  onClick={entered ? () => onChairClick(`${id}-chair${i + 1}`, id) : () => {}}
                  label={`Seat-${i + 1}`}
                />
              ))}
            </div>
            <div className="table">Table {tableNum}</div>
            <div className="seats-row">
              {Array.from({ length: 4 }, (_, i) => (
                <Seat
                  key={i + 4}
                  chairId={`${id}-chair${i + 5}`}
                  roomId={id}
                  bookedChairs={bookedChairs}
                  onClick={entered ? () => onChairClick(`${id}-chair${i + 5}`, id) : () => {}}
                  label={`Seat-${i + 5}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="lobby">Lobby</div>
      <div className="room-container">
        {rooms.slice(4, 8).map(({ id, tableNum }) => (
          <div key={id} className="room">
            <div className="seats-row">
              {Array.from({ length: 4 }, (_, i) => (
                <Seat
                  key={i}
                  chairId={`${id}-chair${i + 1}`}
                  roomId={id}
                  bookedChairs={bookedChairs}
                  onClick={entered ? () => onChairClick(`${id}-chair${i + 1}`, id) : () => {}}
                  label={`Seat-${i + 1}`}
                />
              ))}
            </div>
            <div className="table">Table {tableNum}</div>
            <div className="seats-row">
              {Array.from({ length: 4 }, (_, i) => (
                <Seat
                  key={i + 4}
                  chairId={`${id}-chair${i + 5}`}
                  roomId={id}
                  bookedChairs={bookedChairs}
                  onClick={entered ? () => onChairClick(`${id}-chair${i + 5}`, id) : () => {}}
                  label={`Seat-${i + 5}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatGrid;