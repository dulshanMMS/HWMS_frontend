import React, { useRef } from 'react';
import '../styles/popup.css';

const AddMemberPopup = ({ value, onChange, onSubmit }) => {
  const inputRef = useRef(null);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>Enter the member ID of the new team member:</p>
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
          placeholder="Enter member ID (e.g., M001)"
          autoFocus
        />
        <div className="button-group">
          <button className="close-btn" onClick={onSubmit}>Enter</button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberPopup;