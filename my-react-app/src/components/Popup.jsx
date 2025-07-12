import React from 'react';
import '../styles/popup.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Icons for success and error

const Popup = ({ message, onClose, type }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {type === 'success' && (
          <FaCheckCircle className="popup-icon success-icon" />
        )}
        {type === 'error' && (
          <FaTimesCircle className="popup-icon error-icon" />
        )}

        <p>{message}</p>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;
