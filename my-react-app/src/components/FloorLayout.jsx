/* eslint-disable no-undef */
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Seat from './Seat';
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

  // Prevent scrolling when component mounts
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalDocumentOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalDocumentOverflow;
    };
  }, []);

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
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Check for persisted booking submission state on component mount (USER-SPECIFIC)
  useEffect(() => {
    if (!memberId) return; // Wait for memberId to be available
    
    const submissionKey = `booking_submitted_${memberId}_${bookingInfo.date}_${bookingInfo.floor}`;
    const isSubmitted = localStorage.getItem(submissionKey) === 'true';
    if (isSubmitted) {
      setBookingSubmitted(true);
    } else {
      setBookingSubmitted(false); // Reset for different users
    }
  }, [memberId, bookingInfo.date, bookingInfo.floor]);

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
    
    const fetchBookings = async () => {
      try {
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
        const userRes = await fetch(`http://localhost:5004/api/bookings/users/${memberId}`);
        if (!userRes.ok) throw new Error('User not found');
        const user = await userRes.json();
        
        if (!user.username || !user.teamId) {
          throw new Error('User data incomplete - missing username or teamId');
        }

        const teamRes = await fetch(`http://localhost:5004/api/teams/${user.teamId}`);
        if (!teamRes.ok) throw new Error('Team not found');
        const team = await teamRes.json();
        
        const colorValue = team.color || '#808080';
        let actualColor = '#808080';
        
        if (colorValue.startsWith('#')) {
          actualColor = colorValue;
        } else if (colorValue.includes('bg-')) {
          actualColor = getColorFromTailwind(colorValue);
        } else {
          actualColor = '#808080';
        }

        const memberDetailsWithColor = {
          ...user,
          teamColor: actualColor,
          userName: user.username  // ✅ CHANGED: memberName → userName
        };

        setMemberDetails(memberDetailsWithColor);
        setTeamName(team.teamName);
        setRole(user.role);

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
  const showMessage = (msg) => {
    setMessage(msg);
  };
  
  const closeMessage = () => {
    setMessage(null);
  };

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
    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-8 min-w-96 min-h-48 flex flex-col justify-center items-center border-2 border-green-400 animate-pop-in">
        <p className="mb-4 text-gray-800 text-xl font-semibold text-center">
          {message}
        </p>
        {children || (
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );

  const AddMemberIdPopUp = ({ onSubmit, onCancel, onChange, value }) => (
    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 min-w-96 flex flex-col justify-center items-center border-2 border-green-400">
        <p className="mb-6 text-gray-800 text-xl font-semibold text-center">
          Enter the member ID of the new team member:
        </p>
        <input
          className="w-full max-w-xs px-4 py-2 border-2 border-green-300 rounded-lg text-base mb-6 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
          placeholder="Enter member ID (e.g., user123)"
          value={value}
          onChange={onChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          autoFocus
        />
        <div className="flex gap-4">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
            onClick={onSubmit}
          >
            Enter
          </button>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Chair click handler
  const handleChairClick = (chairId, tableId) => {
    if (bookingSubmitted) {
      return;
    }

    if (!entered || !memberDetails) {
      showMessage('Please ensure you are logged in and have valid team data.');
      return;
    }

    if (role === 'member') {
      const memberHasBooking = Object.values(bookedChairs).some(
        (chair) => chair?.userName === memberDetails?.userName  // ✅ CHANGED: memberName → userName
      );
      
      if (memberHasBooking && !bookedChairs[chairId]) {
        showMessage('You already have a booked seat.');
        return;
      }

      if (bookedChairs[chairId]) {
        if (bookedChairs[chairId].userName === memberDetails?.userName) {  // ✅ CHANGED: memberName → userName
          const dateToUse = bookingInfo.date;
          
          fetch(`http://localhost:5004/api/bookings/unbook/${tableId}/${chairId}/${bookingInfo.floor}/${dateToUse}`, {
            method: 'DELETE',
          })
            .then((response) => {
              if (!response.ok) {
                return response.json().then((errorData) => {
                  throw new Error(errorData.error || 'Unbooking failed');
                });
              }
              return response.json();
            })
            .then(() => {
              setUserBooking(null);
              refreshBookings();
            })
            .catch((err) => {
              showMessage('Failed to unbook seat: ' + err.message);
            });
        } else {
          showMessage('This seat is booked by another user.');
        }
      } else {
        if (!memberDetails.userName) {  // ✅ CHANGED: memberName → userName
          showMessage('Member details incomplete.');
          return;
        }
        
        const bookingDetails = {
          roomId: tableId,
          teamName,
          teamColor: memberDetails.teamColor,
          userName: memberDetails.userName,  // ✅ CHANGED: memberName → userName
          floor: bookingInfo.floor,
          date: bookingInfo.date,
          entryTime: bookingInfo.entryTime,
          exitTime: bookingInfo.exitTime,
        };
        
        fetch(`http://localhost:5004/api/bookings/member/${memberDetails.userName}/seat/${chairId}`, {  // ✅ CHANGED: memberName → userName
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
            refreshBookings();
          })
          .catch((err) => {
            showMessage(`Booking error: ${err.message}`);
          });
      }
    } else if (role === 'leader') {
      if (!selectedMember) {
        showMessage('Please select a team member to book for.');
        return;
      }

      const memberHasBooking = Object.values(bookedChairs).some(
        (chair) => chair?.userName === selectedMember  // ✅ CHANGED: memberName → userName
      );
      
      if (memberHasBooking && !bookedChairs[chairId]) {
        showMessage(`${selectedMember} already has a booked seat.`);
        return;
      }

      if (bookedChairs[chairId]) {
        if (bookedChairs[chairId].userName === selectedMember) {  // ✅ CHANGED: memberName → userName
          const dateToUse = bookingInfo.date;
          
          fetch(`http://localhost:5004/api/bookings/unbook/${tableId}/${chairId}/${bookingInfo.floor}/${dateToUse}`, {
            method: 'DELETE',
          })
            .then((response) => {
              if (!response.ok) {
                return response.json().then((errorData) => {
                  throw new Error(errorData.error || 'Unbooking failed');
                });
              }
              return response.json();
            })
            .then(() => {
              if (selectedMember === memberDetails?.userName) setUserBooking(null);  // ✅ CHANGED: memberName → userName
              refreshBookings();
            })
            .catch((err) => {
              showMessage('Failed to unbook seat: ' + err.message);
            });
        } else {
          showMessage('This seat is booked by another user.');
        }
      } else {
        const bookingDetails = {
          roomId: tableId,
          teamName,
          teamColor: memberDetails.teamColor,
          userName: selectedMember,  // ✅ CHANGED: memberName → userName
          floor: bookingInfo.floor,
          date: bookingInfo.date,
          entryTime: bookingInfo.entryTime,
          exitTime: bookingInfo.exitTime,
        };
        
        fetch(`http://localhost:5004/api/bookings/leader/${memberDetails.userName}/member/${selectedMember}/seat/${chairId}`, {  // ✅ CHANGED: memberName → userName
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
            if (selectedMember === memberDetails?.userName) setUserBooking({ chairId, tableId });  // ✅ CHANGED: memberName → userName
            refreshBookings();
          })
          .catch((err) => {
            showMessage(`Booking error: ${err.message}`);
          });
      }
    }
  };

  // Handler functions
  const handleUnbook = () => {
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.userName;  // ✅ CHANGED: memberName → userName
    if (!targetMember) {
      showMessage('No member selected.');
      return;
    }

    const chairId = Object.keys(bookedChairs).find(
      (id) => bookedChairs[id]?.userName === targetMember  // ✅ CHANGED: memberName → userName
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
            throw new Error(errorData.error || 'Unbooking failed');
          });
        }
        return response.json();
      })
      .then(() => {
        if (role === 'member' || (role === 'leader' && selectedMember === memberDetails?.userName)) {  // ✅ CHANGED: memberName → userName
          setUserBooking(null);
        }
        refreshBookings();
      })
      .catch((err) => {
        showMessage(`Unbooking error: ${err.message}`);
      });
  };

  const handleSubmit = () => {
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.userName;  // ✅ CHANGED: memberName → userName
    if (!targetMember) {
      showMessage('No member selected for submission.');
      return;
    }

    const bookedSeat = userBooking?.chairId || Object.keys(bookedChairs).find(
      (chairId) => bookedChairs[chairId]?.userName === targetMember  // ✅ CHANGED: memberName → userName
    );

    if (!bookedSeat) {
      showMessage('Please book a seat before submitting.');
      return;
    }

    // Set booking as submitted and persist to localStorage with user-specific key
    setBookingSubmitted(true);
    const submissionKey = `booking_submitted_${memberId}_${bookingInfo.date}_${bookingInfo.floor}`;
    localStorage.setItem(submissionKey, 'true');
    
    showMessage('Seat booking submitted successfully!');

    if (role === 'leader') {
      setSelectedMember('');
      setShowAddMemberPrompt(true);
    }
  };

  const handleCancel = () => {
    if (bookingSubmitted) {
      return;
    }
    
    // Clear the submission state from localStorage when canceling (user-specific)
    const submissionKey = `booking_submitted_${memberId}_${bookingInfo.date}_${bookingInfo.floor}`;
    localStorage.removeItem(submissionKey);
    
    setEntered(false);
    setMemberId('');
    setTeamName('');
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
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.userName;  // ✅ CHANGED: memberName → userName
    return Object.keys(bookedChairs).some(
      (chairId) => bookedChairs[chairId]?.userName === targetMember  // ✅ CHANGED: memberName → userName
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
    
    if (!bookingSubmitted) {
      // Clear the submission state from localStorage when navigating away (user-specific)
      const submissionKey = `booking_submitted_${memberId}_${bookingInfo.date}_${bookingInfo.floor}`;
      localStorage.removeItem(submissionKey);
      
      setEntered(false);
      setMemberId('');
      setTeamName('');
      setRole('member');
      setTeamMembers([]);
      setAllTeamMembers([]);
      setSelectedMember('');
      setUserBooking(null);
      setMemberDetails(null);
      setMessage(null);
      navigate('/datebooking');
    }
  };

  const handleAddMemberIdSubmit = async () => {
    if (newMemberId.trim()) {
      try {
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
      <div className="w-full h-screen bg-green-50 flex items-center justify-center overflow-hidden">
        <p className="text-gray-800 text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!entered && !isLoading && !bookingSubmitted) {
    return (
      <div className="w-full h-screen bg-green-50 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-gray-800 text-lg font-semibold">Please complete your booking information</p>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
            onClick={() => navigate('/datebooking')}
          >
            Go to Booking
          </button>
        </div>
      </div>
    );
  }

  const shouldShowLayout = entered || bookingSubmitted;

  return (
    <div className="w-full h-screen bg-green-50 flex items-center justify-center overflow-hidden relative">
      {shouldShowLayout ? (
        <div className="flex flex-col items-center justify-center gap-4 w-full h-full p-4 max-h-screen overflow-hidden">
        
          {entered && role === 'leader' && !bookingSubmitted && (
            <div className="bg-white rounded-lg shadow-md p-2 flex flex-row items-center gap-3 border border-gray-300 flex-shrink-0">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-700">Book a seat for:</label>
                <select
                  className="px-2 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:border-green-500 focus:outline-none"
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
              <button 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-lg text-xs"
                onClick={addTeamMember}
              >
                Add Team Member
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 flex-shrink-0 mx-auto">
            
            <div className="flex flex-col gap-2">
              {['T1', 'T2', 'T3', 'T4'].map((tableId, index) => (
                <div key={tableId} className="bg-white rounded-lg border border-gray-300 shadow-sm p-3">
                  
                  <div className="flex justify-center gap-2 mb-2">
                    {Array.from({ length: 4 }, (_, i) => {
                      const chairId = `${tableId}-chair${i + 1}`;
                      return (
                        <Seat
                          key={i}
                          chairId={chairId}
                          tableId={tableId}
                          bookedChairs={bookedChairs}
                          onClick={!bookingSubmitted ? () => handleChairClick(chairId, tableId) : () => {}}
                          label={`Seat-${i + 1}`}
                          isUserBooked={!bookingSubmitted && userBooking?.chairId === chairId}
                        />
                      );
                    })}
                  </div>
                  
                  <div className="bg-green-50 text-center py-1 text-sm font-semibold text-gray-700 rounded mb-2">
                    Table {index + 1}
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: 4 }, (_, i) => {
                      const chairId = `${tableId}-chair${i + 5}`;
                      return (
                        <Seat
                          key={i + 4}
                          chairId={chairId}
                          tableId={tableId}
                          bookedChairs={bookedChairs}
                          onClick={!bookingSubmitted ? () => handleChairClick(chairId, tableId) : () => {}}
                          label={`Seat-${i + 5}`}
                          isUserBooked={!bookingSubmitted && userBooking?.chairId === chairId}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border-2 border-green-400 rounded-xl flex items-center justify-center" style={{width: '200px', height: '530px'}}>
              <span className="text-gray-800 font-bold text-lg text-center">
                Lobby
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {['T5', 'T6', 'T7', 'T8'].map((tableId, index) => (
                <div key={tableId} className="bg-white rounded-lg border border-gray-300 shadow-sm p-3">
                  
                  <div className="flex justify-center gap-2 mb-2">
                    {Array.from({ length: 4 }, (_, i) => {
                      const chairId = `${tableId}-chair${i + 1}`;
                      return (
                        <Seat
                          key={i}
                          chairId={chairId}
                          tableId={tableId}
                          bookedChairs={bookedChairs}
                          onClick={!bookingSubmitted ? () => handleChairClick(chairId, tableId) : () => {}}
                          label={`Seat-${i + 1}`}
                          isUserBooked={!bookingSubmitted && userBooking?.chairId === chairId}
                        />
                      );
                    })}
                  </div>
                  
                  <div className="bg-green-50 text-center py-1 text-sm font-semibold text-gray-700 rounded mb-2">
                    Table {index + 5}
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: 4 }, (_, i) => {
                      const chairId = `${tableId}-chair${i + 5}`;
                      return (
                        <Seat
                          key={i + 4}
                          chairId={chairId}
                          tableId={tableId}
                          bookedChairs={bookedChairs}
                          onClick={!bookingSubmitted ? () => handleChairClick(chairId, tableId) : () => {}}
                          label={`Seat-${i + 5}`}
                          isUserBooked={!bookingSubmitted && userBooking?.chairId === chairId}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {shouldShowLayout && !bookingSubmitted && (
            <div className="bg-white rounded-lg shadow-md p-3 flex flex-row gap-4 border border-gray-300 flex-shrink-0">
              <button 
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg text-sm"
                onClick={handleUnbook}
              >
                Unbook
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={!hasBookedSeat()}
              >
                Submit
              </button>
              <button 
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg text-sm"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-gray-800 text-lg font-semibold">Loading your session...</p>
        </div>
      )}

      {message && <PopUp message={message} onClose={closeMessage} />}
      {showAddMemberPrompt && (
        <PopUp message="Do you want to book for another member?">
          <div className="flex gap-4">
            <button 
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
              onClick={handleAddMemberPromptYes}
            >
              Yes
            </button>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
              onClick={handleAddMemberPromptNo}
            >
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

      <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pop-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}