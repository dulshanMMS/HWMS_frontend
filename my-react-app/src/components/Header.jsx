import React from 'react';
import '../styles/header.css';

const Header = ({ memberId, onMemberIdChange, onJoin, entered, role, teamMembers, selectedMember, onSelectedMemberChange, onAddTeamMember }) => {
  return (
    <div className="header">
      {!entered && (
        <>
          <input
            value={memberId}
            onChange={(e) => onMemberIdChange(e.target.value)}
            placeholder="Enter your member ID (e.g., M001)"
          />
          <button onClick={onJoin}>Join</button>
        </>
      )}
      {entered && role === "leader" && (
        <div className="leader-controls">
          <label>Book a seat for (Member Name):</label>
          <select value={selectedMember} onChange={(e) => onSelectedMemberChange(e.target.value)}>
            <option value="">Select a member</option>
            {teamMembers.map((member) => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
          <button onClick={onAddTeamMember}>Add Team Member</button>
        </div>
      )}
    </div>
  );
};

export default Header;