import React from 'react';
import '../styles/popup.css';

const Popup = ({ message, onClose }) => (
  <div className="popup-overlay">
    <div className="popup-content">
      <p>{message}</p>
      <button className="close-btn" onClick={onClose}>Close</button>
    </div>
  </div>
);

export default Popup;