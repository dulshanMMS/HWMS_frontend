/* eslint-disable no-undef */
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Seat from './seat';
import '../styles/floorlayout.css';
import '../styles/seatlable.css';
import LeftSidebar from './LeftSidebar';
import { jwtDecode } from "jwt-decode";

// Convert Tailwind classes to hex colors
const getColorFromTailwind = (tailwindClass) => {
  const colorMap = {
    'bg-red-500': '#ef4444',
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#22c55e',
    'bg-yellow-500': '#eab308',
    'bg-purple-500': '#a855f7',
    'bg-pink-500': '#ec4899',
    'bg-indigo-500': '#6366f1',
    'bg-orange-500': '#f97316',
    'bg-teal-500': '#14b8a6',
    'bg-cyan-500': '#06b6d4'
  };
  return colorMap[tailwindClass] || '#808080';
};

export default function FloorLayout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Memoize bookingInfo to prevent re-creation on every render
  const bookingInfo = useMemo(() => ({
    date: state?.date || null,
    entryTime: state?.entryTime || null,
    exitTime: state?.exitTime || null,
    floor: state?.floor || null,
  }), [state]);

  // State variables
  const [memberId, setMemberId] = useState('');
  const [role, setRole] = useState('member');
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#808080');
  const [entered, setEntered] = useState(false);
  const [bookedChairs, setBookedChairs] = useState({});
  const [userBooking, setUserBooking] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allTeamMembers, setAllTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMemberPrompt, setShowAddMemberPrompt] = useState(false);
  const [showAddMemberIdPopUp, setShowAddMemberIdPopUp] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [memberDetails, setMemberDetails] = useState(null);

  // Get JWT token and decode username
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setMemberId(decoded.username);
      } catch (e) {
        console.error("Invalid token", e);
        setMessage('Invalid token. Please log in again.');
        navigate('/');
      }
    } else {
      setMessage('No token found. Please log in.');
      navigate('/');
    }
  }, [navigate]);

  // Validate booking info and fetch bookings
  useEffect(() => {
    if (!bookingInfo.floor || !bookingInfo.date || !bookingInfo.entryTime || !bookingInfo.exitTime) {
      setMessage('Please select a floor, date, entry time, and exit time.');
      setIsLoading(false);
      navigate('/datebooking');
      return;
    }
    
    setIsLoading(true);
    
    // Fetch bookings from API - filtered by date and floor
    const fetchBookings = async () => {
      try {
        // Add date and floor filters to only show bookings for the selected date/floor
        const queryParams = new URLSearchParams({
          date: bookingInfo.date,
          floor: bookingInfo.floor
        });
        
        const response = await fetch(`http://localhost:5004/api/bookings/filtered?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        
        const data = await response.json();
        setBookedChairs(data.chairs || {});
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setMessage('Failed to fetch bookings: ' + err.message);
        setBookedChairs({});
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [bookingInfo, navigate]);

  // Fetch user and team data when memberId is available
  useEffect(() => {
    if (!memberId) return;

    const fetchUserAndTeam = async () => {
      try {
        // Fetch user data
        const userRes = await fetch(`http://localhost:5004/api/bookings/users/${memberId}`);
        if (!userRes.ok) throw new Error('User not found');
        const user = await userRes.json();
        
        if (!user.username || !user.teamId) {
          throw new Error('User data incomplete - missing username or teamId');
        }

        // Fetch team data
        const teamRes = await fetch(`http://localhost:5004/api/teams/${user.teamId}`);
        if (!teamRes.ok) throw new Error('Team not found');
        const team = await teamRes.json();
        
        // Convert team color from Tailwind to hex - ensure it's always a valid hex color
        const colorValue = team.color || '#808080';
        let actualColor = '#808080'; // Default fallback
        
        if (colorValue.startsWith('#')) {
          // Already a hex color
          actualColor = colorValue;
        } else if (colorValue.includes('bg-')) {
          // Tailwind class - convert to hex
          actualColor = getColorFromTailwind(colorValue);
        } else {
          // Other color formats or invalid - use default
          actualColor = '#808080';
        }

        // Create memberDetails object with teamColor (compatible with old logic)
        const memberDetailsWithColor = {
          ...user,
          teamColor: actualColor,
          memberName: user.username // Add memberName for consistency with old logic
        };

        setMemberDetails(memberDetailsWithColor);
        setTeamName(team.teamName);
        setTeamColor(actualColor); // Ensure teamColor is always hex
        setRole(user.role); // This will be 'leader' or 'member' due to route mapping

        // Fetch team members
        const teamUsersRes = await fetch(`http://localhost:5004/api/bookings/users/team/${user.teamId}`);
        if (teamUsersRes.ok) {
          const teamUsers = await teamUsersRes.json();
          setAllTeamMembers(teamUsers.map(u => u.username));
        } else {
          console.warn('Could not fetch team members, using current user only');
          setAllTeamMembers([user.username]);
        }
        
        setTeamMembers([user.username]);
        setEntered(true);
      } catch (error) {
        console.error('Error fetching user/team data:', error);
        setMessage('Failed to load user/team info: ' + error.message);
        setEntered(false);
        setIsLoading(false);
      }
    };

    fetchUserAndTeam();
  }, [memberId]);

  // Message handling
  const showMessage = (msg) => setMessage(msg);
  const closeMessage = () => setMessage(null);

  // Function to refresh bookings
  const refreshBookings = async () => {
    try {
      const queryParams = new URLSearchParams({
        date: bookingInfo.date,
        floor: bookingInfo.floor
      });
      
      const response = await fetch(`http://localhost:5004/api/bookings/filtered?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookedChairs(data.chairs || {});
    } catch (err) {
      console.error("Failed to refresh bookings:", err);
    }
  };

  // Popup components
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
          className="header-input"
          placeholder="Enter member ID (e.g., user123)"
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

  // Chair click handler
  const handleChairClick = (chairId, tableId) => {
    console.log("=== SEAT CLICK DEBUG ===");
    console.log("ChairId:", chairId);
    console.log("Entered:", entered);
    console.log("Member Details:", memberDetails);
    console.log("Team Color:", teamColor);
    console.log("Booked Chairs:", bookedChairs);
    console.log("========================");

    if (!entered || !memberDetails) {
      showMessage('Please ensure you are logged in and have valid team data.');
      return;
    }

    if (role === 'member') {
      // Check if member already has booking
      const memberHasBooking = Object.values(bookedChairs).some(
        (chair) => chair?.memberName === memberDetails?.memberName
      );
      
      if (memberHasBooking && !bookedChairs[chairId]) {
        showMessage('You already have a booked seat.');
        return;
      }

      // Check if this seat is already booked
      if (bookedChairs[chairId]) {
        // UNBOOKING LOGIC
        if (bookedChairs[chairId].memberName === memberDetails?.memberName) {
          const dateToUse = bookingInfo.date;
          
          console.log("🔍 Unbooking with date:", {
            bookingInfoDate: bookingInfo.date,
            dateToUse: dateToUse,
            unbookingURL: `http://localhost:5004/api/bookings/unbook/${tableId}/${chairId}/${bookingInfo.floor}/${dateToUse}`
          });
          
          fetch(`http://localhost:5004/api/bookings/unbook/${tableId}/${chairId}/${bookingInfo.floor}/${dateToUse}`, {
            method: 'DELETE',
          })
            .then((response) => {
              if (!response.ok) {
                return response.json().then((errorData) => {
                  console.error('❌ Unbooking failed:', errorData);
                  throw new Error(errorData.error || 'Unbooking failed');
                });
              }
              return response.json();
            })
            .then(() => {
              console.log("✅ Unbooking successful");
              setUserBooking(null);
              // Remove success message for seat click unbooking
              // Refresh bookings after unbooking
              refreshBookings();
            })
            .catch((err) => {
              console.error('❌ Unbooking error:', err);
              showMessage('Failed to unbook seat: ' + err.message);
            });
        } else {
          showMessage('This seat is booked by another user.');
        }
      } else {
        // BOOKING LOGIC
        if (!memberDetails.memberName) {
          showMessage('Member details incomplete.');
          return;
        }
        
        const bookingDetails = {
          roomId: tableId,
          teamName,
          teamColor: memberDetails.teamColor,
          memberName: memberDetails.memberName,
          floor: bookingInfo.floor,
          date: bookingInfo.date,
          entryTime: bookingInfo.entryTime,
          exitTime: bookingInfo.exitTime,
        };
        
        fetch(`http://localhost:5004/api/bookings/member/${memberDetails.memberName}/seat/${chairId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingDetails),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(data.message || 'Booking failed');
              });
            }
            return response.json();
          })
          .then(() => {
            setUserBooking({ chairId, tableId });
            // Remove success message for seat click booking
            // Refresh bookings after successful booking
            refreshBookings();
          })
          .catch((err) => {
            console.error('Booking error:', err);
            showMessage(`Booking error: ${err.message}`);
          });
      }
    } else if (role === 'leader') {
      // Leader booking logic
      if (!selectedMember) {
        showMessage('Please select a team member to book for.');
        return;
      }

      const memberHasBooking = Object.values(bookedChairs).some(
        (chair) => chair?.memberName === selectedMember
      );
      
      if (memberHasBooking && !bookedChairs[chairId]) {
        showMessage(`${selectedMember} already has a booked seat.`);
        return;
      }

      if (bookedChairs[chairId]) {
        // UNBOOKING LOGIC FOR LEADER
        if (bookedChairs[chairId].memberName === selectedMember) {
          const dateToUse = bookingInfo.date;
          
          fetch(`http://localhost:5004/api/bookings/unbook/${tableId}/${chairId}/${bookingInfo.floor}/${dateToUse}`, {
            method: 'DELETE',
          })
            .then((response) => {
              if (!response.ok) {
                return response.json().then((errorData) => {
                  console.error('Leader unbooking failed:', errorData);
                  throw new Error(errorData.error || 'Unbooking failed');
                });
              }
              return response.json();
            })
            .then(() => {
              if (selectedMember === memberDetails?.memberName) setUserBooking(null);
              // Remove success message for seat click unbooking
              // Refresh bookings after unbooking
              refreshBookings();
            })
            .catch((err) => {
              console.error('Unbooking error:', err);
              showMessage('Failed to unbook seat: ' + err.message);
            });
        } else {
          showMessage('This seat is booked by another user.');
        }
      } else {
        // BOOKING LOGIC FOR LEADER
        const bookingDetails = {
          roomId: tableId,
          teamName,
          teamColor: memberDetails.teamColor,
          memberName: selectedMember,
          floor: bookingInfo.floor,
          date: bookingInfo.date,
          entryTime: bookingInfo.entryTime,
          exitTime: bookingInfo.exitTime,
        };
        
        fetch(`http://localhost:5004/api/bookings/leader/${memberDetails.memberName}/member/${selectedMember}/seat/${chairId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingDetails),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                throw new Error(data.message || 'Booking failed');
              });
            }
            return response.json();
          })
          .then(() => {
            if (selectedMember === memberDetails?.memberName) setUserBooking({ chairId, tableId });
            // Remove success message for seat click booking
            // Refresh bookings after successful booking
            refreshBookings();
          })
          .catch((err) => {
            console.error('Booking error:', err);
            showMessage(`Booking error: ${err.message}`);
          });
      }
    }
  };

  // Other handlers
  const handleUnbook = () => {
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.memberName;
    if (!targetMember) {
      showMessage('No member selected.');
      return;
    }

    const chairId = Object.keys(bookedChairs).find(
      (id) => bookedChairs[id]?.memberName === targetMember
    );

    if (!chairId) {
      showMessage('No seat booked to unbook.');
      return;
    }

    const tableId = chairId.split('-')[0];
    const dateToUse = bookingInfo.date;
    
    fetch(`http://localhost:5004/api/bookings/unbook/${tableId}/${chairId}/${bookingInfo.floor}/${dateToUse}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            console.error('Unbook button failed:', errorData);
            throw new Error(errorData.error || 'Unbooking failed');
          });
        }
        return response.json();
      })
      .then(() => {
        if (role === 'member' || (role === 'leader' && selectedMember === memberDetails?.memberName)) {
          setUserBooking(null);
        }
        // Remove success message for unbook button
        // Refresh bookings after unbooking
        refreshBookings();
      })
      .catch((err) => {
        console.error('Unbooking error:', err);
        showMessage(`Unbooking error: ${err.message}`);
      });
  };

  const handleSubmit = () => {
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.memberName;
    if (!targetMember) {
      showMessage('No member selected for submission.');
      return;
    }

    const bookedSeat = userBooking?.chairId || Object.keys(bookedChairs).find(
      (chairId) => bookedChairs[chairId]?.memberName === targetMember
    );

    if (!bookedSeat) {
      showMessage('Please book a seat before submitting.');
      return;
    }

    // Show success message only when Submit button is clicked
    showMessage('Seat booking submitted successfully!');

    if (role === 'member') {
      setEntered(false);
      setMemberId('');
      setTeamName('');
      setTeamColor('#808080');
      setRole('member');
      setUserBooking(null);
      setMemberDetails(null);
      setTeamMembers([]);
      setAllTeamMembers([]);
      setSelectedMember('');
    } else if (role === 'leader') {
      setSelectedMember('');
      setShowAddMemberPrompt(true);
    }
  };

  const handleCancel = () => {
    setEntered(false);
    setMemberId('');
    setTeamName('');
    setTeamColor('#808080');
    setRole('member');
    setUserBooking(null);
    setTeamMembers([]);
    setAllTeamMembers([]);
    setSelectedMember('');
    setMemberDetails(null);
    showMessage('Session canceled successfully!');
    navigate('/datebooking');
  };

  const hasBookedSeat = () => {
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.memberName;
    return Object.keys(bookedChairs).some(
      (chairId) => bookedChairs[chairId]?.memberName === targetMember
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
    setTeamColor('#808080');
    setRole('member');
    setTeamMembers([]);
    setAllTeamMembers([]);
    setSelectedMember('');
    setUserBooking(null);
    setMemberDetails(null);
    setMessage(null);
    navigate('/datebooking');
  };

  const handleAddMemberIdSubmit = async () => {
    if (newMemberId.trim()) {
      try {
        // Check if user exists and is in the same team
        const userRes = await fetch(`http://localhost:5004/api/bookings/users/${newMemberId}`);
        if (!userRes.ok) {
          setMessage('User not found with this username.');
          setNewMemberId('');
          setShowAddMemberIdPopUp(false);
          return;
        }
        
        const userData = await userRes.json();
        if (userData.teamId !== memberDetails.teamId) {
          setMessage('This user is not in your team.');
          setNewMemberId('');
          setShowAddMemberIdPopUp(false);
          return;
        }
        
        if (teamMembers.includes(userData.username)) {
          setMessage('This member is already in the team list.');
          setNewMemberId('');
          setShowAddMemberIdPopUp(false);
          return;
        }
        
        // Add member to team list
        setTeamMembers((prev) => [...prev, userData.username]);
        setSelectedMember(userData.username);
        setNewMemberId('');
        setShowAddMemberIdPopUp(false);
        setMessage(null);
        setEntered(true);
      } catch (error) {
        console.error('Error adding member:', error);
        setMessage('Failed to add member. Please try again.');
        setNewMemberId('');
        setShowAddMemberIdPopUp(false);
      }
    } else {
      setMessage('Please enter a valid username.');
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
    <LeftSidebar>
      <div className="floor-layout">
        <div className="layout-container">
          {/* Removed welcome message and booking status display */}
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
                  {allTeamMembers.map((member) => (
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
                          isUserBooked={userBooking?.chairId === chairId}
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
                          isUserBooked={userBooking?.chairId === chairId}
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
                          isUserBooked={userBooking?.chairId === chairId}
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
                          isUserBooked={userBooking?.chairId === chairId}
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
    </LeftSidebar>
  );
}