import React from 'react';
import '../styles/controlpanel.css';

const ControlPanel = ({ role, hasBookedSeat, onCancel, onUnbook, onSubmit }) => {
  return (
    <div className="control-panel">
      {role === "member" && (
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
      )}
      <button
        className={`unbook-btn ${hasBookedSeat ? 'enabled' : ''}`}
        onClick={onUnbook}
        disabled={!hasBookedSeat}
      >
        Unbook
      </button>
      <button className="submit-btn" onClick={onSubmit}>Submit</button>
    </div>
  );
};

export default ControlPanel;