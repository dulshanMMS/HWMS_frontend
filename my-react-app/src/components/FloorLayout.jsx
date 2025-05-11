/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import Seat from './seat';
import '../styles/floorlayout.css';
import '../styles/seatlable.css';

export default function FloorLayout() {
  const [memberId, setMemberId] = useState('');
  const [role, setRole] = useState('member');
  const [teamName, setTeamName] = useState('');
  const [entered, setEntered] = useState(false);
  const [bookedChairs, setBookedChairs] = useState({});
  const [userBooking, setUserBooking] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMemberPrompt, setShowAddMemberPrompt] = useState(false);
  const [showAddMemberIdPopUp, setShowAddMemberIdPopUp] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [memberDetails, setMemberDetails] = useState(null);
  const memberIdInputRef = useRef(null);
  const memberIdPopUpRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5004/api/bookings')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.chairs) {
          setBookedChairs(data.chairs);
        } else {
          setBookedChairs({});
          console.warn('No chairs data received from API');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setMessage('Failed to fetch bookings: ' + err.message);
        setBookedChairs({});
        setIsLoading(false);
        console.error('Booking fetch error:', err);
      });
  }, []);

  useEffect(() => {
    if (entered && role === 'leader' && memberIdInputRef.current) {
      memberIdInputRef.current.focus();
    }
    if (showAddMemberIdPopUp && memberIdPopUpRef.current) {
      memberIdPopUpRef.current.focus();
    }
    if (!entered && memberIdInputRef.current) {
      memberIdInputRef.current.focus();
    }
  }, [entered, role, showAddMemberIdPopUp]);

  const showMessage = (msg) => setMessage(msg);
  const closeMessage = () => setMessage(null);

  const PopUp = ({ message, onClose, children }) => (
    <div className="popup-overlay">
      <div className="popup-content">
        <p className="popup-message">{message}</p>
        {children || (
          <button className="popup-button green" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </div>
  );

  const AddMemberIdPopUp = ({ onSubmit, onCancel, onChange, value }) => (
    <div className="popup-overlay">
      <div className="popup-content">
        <p className="popup-message">Enter the member ID of the new team member:</p>
        <input
          ref={memberIdPopUpRef}
          className="header-input"
          placeholder="Enter member ID (e.g., M001)"
          value={value}
          onChange={onChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          autoFocus
        />
        <div className="popup-input-container">
          <button className="popup-button green" onClick={onSubmit} style={{ marginRight: '10px' }}>
            Enter
          </button>
          <button className="popup-button red" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const checkMemberExists = async (memberId) => {
    try {
      const response = await fetch('http://localhost:5004/api/teams/checkMember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      showMessage('Failed to verify member. Please try again.');
      return { exists: false };
    }
  };

  const getMemberById = async (memberId) => {
    const memberData = await checkMemberExists(memberId);
    if (memberData.exists && memberData.teamName === teamName) {
      return memberData.memberName;
    }
    return null;
  };

  const handleJoin = async () => {
    if (!memberId.trim()) {
      showMessage('Please enter your member ID');
      return;
    }

    const memberData = await checkMemberExists(memberId);
    if (!memberData.exists) {
      showMessage('You are not registered. Contact the administrator.');
      return;
    }

    setMemberDetails(memberData);
    setTeamName(memberData.teamName);
    setRole(memberData.role);
    setEntered(true);
    if (memberData.role === 'leader') {
      setTeamMembers([memberData.memberName]);
      setSelectedMember(memberData.memberName);
    }
  };

  const handleChairClick = (chairId, tableId) => {
    if (!entered || !memberDetails) {
      showMessage('Please join with a valid member ID first.');
      return;
    }

    if (role === 'member') {
      const memberHasBooking = Object.values(bookedChairs).some(
        (chair) => chair?.memberName === memberDetails?.memberName
      );
      if (memberHasBooking) {
        return; // Silently fail if already booked
      }

      if (userBooking && userBooking.chairId !== chairId) {
        return; // Silently fail if already booked elsewhere
      }

      setBookedChairs((prev) => {
        const updated = { ...prev };
        if (updated[chairId]) {
          if (updated[chairId].memberName === memberDetails?.memberName) {
            fetch(`http://localhost:5004/api/bookings/unbook/${tableId}/${chairId}`, {
              method: 'DELETE',
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error('Unbooking failed');
                }
                delete updated[chairId];
                setUserBooking(null);
              })
              .catch((err) => {
                console.error('Unbooking error:', err);
              });
          } else {
            return prev; // Silently fail if already booked by someone else
          }
        } else {
          if (!memberDetails.memberName) {
            return prev; // Silently fail if member details are missing
          }
          const bookingDetails = {
            roomId: tableId,
            teamName,
            teamColor: memberDetails.teamColor,
            memberName: memberDetails.memberName,
          };
          fetch(`http://localhost:5004/api/bookings/member/${memberDetails.memberName}/seat/${chairId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingDetails),
          })
            .then((response) => {
              if (!response.ok) {
                return response.text().then((text) => { throw new Error(text || 'Booking failed'); });
              }
              return response.json();
            })
            .then(() => {
              updated[chairId] = {
                memberName: memberDetails.memberName,
                teamColor: memberDetails.teamColor,
              };
              setUserBooking({ chairId, tableId });
            })
            .catch((err) => {
              console.error('Booking error:', err);
            });
        }
        return updated;
      });
    } else if (role === 'leader') {
      if (!selectedMember) {
        showMessage('Please select a team member to book for.');
        return;
      }

      const memberHasBooking = Object.values(bookedChairs).some(
        (chair) => chair?.memberName === selectedMember
      );
      if (memberHasBooking) {
        return; // Silently fail if already booked
      }

      setBookedChairs((prev) => {
        const updated = { ...prev };
        if (updated[chairId]) {
          if (updated[chairId].memberName === selectedMember) {
            fetch(`http://localhost:5004/api/bookings/unbook/${tableId}/${chairId}`, {
              method: 'DELETE',
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error('Unbooking failed');
                }
                delete updated[chairId];
                if (selectedMember === memberDetails?.memberName) setUserBooking(null);
              })
              .catch((err) => {
                console.error('Unbooking error:', err);
              });
          } else {
            return prev; // Silently fail if already booked by someone else
          }
        } else {
          if (!memberDetails.memberName) {
            return prev; // Silently fail if member details are missing
          }
          const bookingDetails = {
            roomId: tableId,
            teamName,
            teamColor: memberDetails.teamColor,
            memberName: selectedMember,
          };
          fetch(`http://localhost:5004/api/bookings/leader/${memberDetails.memberName}/member/${selectedMember}/seat/${chairId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingDetails),
          })
            .then((response) => {
              if (!response.ok) {
                return response.text().then((text) => { throw new Error(text || 'Booking failed'); });
              }
              return response.json();
            })
            .then(() => {
              updated[chairId] = {
                memberName: selectedMember,
                teamColor: memberDetails.teamColor,
              };
              if (selectedMember === memberDetails?.memberName) setUserBooking({ chairId, tableId });
            })
            .catch((err) => {
              console.error('Booking error:', err);
            });
        }
        return updated;
      });
    }
  };

  const handleUnbook = () => {
    if (Object.keys(bookedChairs).length === 0) {
      showMessage('No bookings available to unbook.');
      return;
    }

    const chairToUnbook = Object.keys(bookedChairs).find(
      (chairId) =>
        bookedChairs[chairId]?.memberName === (role === 'leader' ? selectedMember : memberDetails?.memberName)
    );

    if (!chairToUnbook) {
      showMessage('No seat booked to unbook.');
      return;
    }

    const tableId = chairToUnbook.split('-')[0];
    setBookedChairs((prev) => {
      const updated = { ...prev };
      fetch(`http://localhost:5004/api/bookings/unbook/${tableId}/${chairToUnbook}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Unbooking failed');
          }
          delete updated[chairToUnbook];
          if (role === 'member' || (role === 'leader' && selectedMember === memberDetails?.memberName)) {
            setUserBooking(null);
          }
          showMessage(`Seat ${chairToUnbook} unbooked successfully!`);
        })
        .catch((err) => {
          showMessage(`Failed to unbook seat (${chairToUnbook}): ${err.message}`);
        });
      return updated;
    });
  };

  const handleSubmit = () => {
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.memberName;
    if (!targetMember) {
      showMessage('No member selected for submission.');
      return;
    }

    const bookedSeat = Object.keys(bookedChairs).find(
      (chairId) =>
        bookedChairs[chairId]?.memberName?.trim().toLowerCase() === targetMember?.trim().toLowerCase()
    );

    if (!bookedSeat) {
      showMessage('Please book a seat before submitting.');
      return;
    }

    if (role === 'member') {
      showMessage('Booking submitted successfully!');
      setEntered(false);
      setMemberId('');
      setTeamName('');
      setRole('member');
      setUserBooking(null);
      setMemberDetails(null);
    } else if (role === 'leader') {
      showMessage('Booking submitted successfully!');
      setShowAddMemberPrompt(true);
    }
  };

  const handleCancel = () => {
    setEntered(false);
    setMemberId('');
    setTeamName('');
    setRole('member');
    setUserBooking(null);
    setTeamMembers([]);
    setSelectedMember('');
    setMemberDetails(null);
    showMessage('Session canceled successfully!');
  };

  const hasBookedSeat = () => {
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.memberName;
    return Object.keys(bookedChairs).some(
      (chairId) =>
        bookedChairs[chairId]?.memberName?.trim().toLowerCase() === targetMember?.trim().toLowerCase()
    );
  };

  const handleAddMemberPromptYes = () => {
    setShowAddMemberPrompt(false);
    setShowAddMemberIdPopUp(true);
    setNewMemberId('');
    setMessage(null);
  };

  const handleAddMemberPromptNo = () => {
    setShowAddMemberPrompt(false);
    setEntered(false);
    setMemberId('');
    setTeamName('');
    setRole('member');
    setTeamMembers([]);
    setSelectedMember('');
    setUserBooking(null);
    setMemberDetails(null);
    setMessage(null);
  };

  const handleAddMemberIdSubmit = async () => {
    if (newMemberId.trim()) {
      const memberName = await getMemberById(newMemberId);
      if (memberName && !teamMembers.includes(memberName)) {
        setTeamMembers((prev) => [...prev, memberName]);
        setSelectedMember(memberName);
        setNewMemberId('');
        setShowAddMemberIdPopUp(false);
        setMessage(null);
        setEntered(true);
      } else if (teamMembers.includes(memberName)) {
        setMessage('This member is already in the team.');
        setNewMemberId('');
        setShowAddMemberIdPopUp(false);
      } else {
        setMessage('Invalid member ID or member not in your team.');
        setNewMemberId('');
        setShowAddMemberIdPopUp(false);
      }
    } else {
      setMessage('Please enter a valid member ID.');
      setShowAddMemberIdPopUp(false);
    }
  };

  const handleAddMemberIdCancel = () => {
    setNewMemberId('');
    setShowAddMemberIdPopUp(false);
    setMessage(null);
  };

  const addTeamMember = () => {
    setShowAddMemberPrompt(true);
  };

  if (isLoading) {
    return (
      <div className="floor-layout">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="floor-layout">
      <div className="layout-container">
        {!entered && (
          <div className="header-container">
            <input
              ref={memberIdInputRef}
              className="header-input"
              placeholder="Enter your member ID (e.g., M001)"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
            <button className="green-button" onClick={handleJoin}>
              Join
            </button>
          </div>
        )}

        {entered && role === 'leader' && (
          <div className="header-container">
            <div>
              <label className="header-label">Book a seat for:</label>
              <select
                className="header-select"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">Select a member</option>
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
            <button className="green-button" onClick={addTeamMember}>
              Add Team Member
            </button>
          </div>
        )}

        <div className="seat-layout">
          <div className="left-containers">
            {['T1', 'T2', 'T3', 'T4'].map((tableId, index) => (
              <div key={tableId} className="table-container">
                <div className="seat-row top-row">
                  {Array.from({ length: 4 }, (_, i) => {
                    const chairId = `${tableId}-chair${i + 1}`;
                    return (
                      <Seat
                        key={i}
                        chairId={chairId}
                        tableId={tableId}
                        bookedChairs={bookedChairs}
                        onClick={entered ? () => handleChairClick(chairId, tableId) : () => {}}
                        label={`Seat-${i + 1}`}
                      />
                    );
                  })}
                </div>
                <div className="table-label">Table {index + 1}</div>
                <div className="seat-row bottom-row">
                  {Array.from({ length: 4 }, (_, i) => {
                    const chairId = `${tableId}-chair${i + 5}`;
                    return (
                      <Seat
                        key={i + 4}
                        chairId={chairId}
                        tableId={tableId}
                        bookedChairs={bookedChairs}
                        onClick={entered ? () => handleChairClick(chairId, tableId) : () => {}}
                        label={`Seat-${i + 5}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="lobby-container">
            <span className="lobby-text">Lobby</span>
          </div>

          <div className="right-containers">
            {['T5', 'T6', 'T7', 'T8'].map((tableId, index) => (
              <div key={tableId} className="table-container">
                <div className="seat-row top-row">
                  {Array.from({ length: 4 }, (_, i) => {
                    const chairId = `${tableId}-chair${i + 1}`;
                    return (
                      <Seat
                        key={i}
                        chairId={chairId}
                        tableId={tableId}
                        bookedChairs={bookedChairs}
                        onClick={entered ? () => handleChairClick(chairId, tableId) : () => {}}
                        label={`Seat-${i + 1}`}
                      />
                    );
                  })}
                </div>
                <div className="table-label">Table {index + 5}</div>
                <div className="seat-row bottom-row">
                  {Array.from({ length: 4 }, (_, i) => {
                    const chairId = `${tableId}-chair${i + 5}`;
                    return (
                      <Seat
                        key={i + 4}
                        chairId={chairId}
                        tableId={tableId}
                        bookedChairs={bookedChairs}
                        onClick={entered ? () => handleChairClick(chairId, tableId) : () => {}}
                        label={`Seat-${i + 5}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {entered && (
          <div className="control-panel">
            <button className="red-button" onClick={handleUnbook}>
              Unbook
            </button>
            <button
              className="green-button"
              onClick={handleSubmit}
              disabled={!hasBookedSeat()}
              style={{ opacity: hasBookedSeat() ? 1 : 0.5 }}
            >
              Submit
            </button>
            <button className="gray-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {message && <PopUp message={message} onClose={closeMessage} />}
      {showAddMemberPrompt && (
        <PopUp message="Do you want to book for another member?">
          <div className="popup-buttons">
            <button className="popup-button green" onClick={handleAddMemberPromptYes}>
              Yes
            </button>
            <button className="popup-button red" onClick={handleAddMemberPromptNo}>
              No
            </button>
          </div>
        </PopUp>
      )}
      {showAddMemberIdPopUp && (
        <AddMemberIdPopUp
          value={newMemberId}
          onChange={(e) => setNewMemberId(e.target.value)}
          onSubmit={handleAddMemberIdSubmit}
          onCancel={handleAddMemberIdCancel}
        />
      )}
    </div>
  );
}