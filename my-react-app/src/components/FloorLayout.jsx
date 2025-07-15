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

// Helper function to check if times overlap
const timesOverlap = (start1, end1, start2, end2) => {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1Min = parseTime(start1);
  const end1Min = parseTime(end1);
  const start2Min = parseTime(start2);
  const end2Min = parseTime(end2);
  
  return start1Min < end2Min && start2Min < end1Min;
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

  // CLEAR localStorage on component mount to reset booking state
  useEffect(() => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('booking_submitted_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    setBookingSubmitted(false);
  }, []);

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

  // Validate booking info and fetch bookings with TIME FILTERING
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
        
        const response = await fetch(`http://localhost:5000/api/bookings/filtered?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        
        const data = await response.json();
        
        const filteredChairs = {};
        
        if (data.chairs) {
          Object.keys(data.chairs).forEach(chairId => {
            const booking = data.chairs[chairId];
            
            const overlaps = timesOverlap(
              booking.entryTime, 
              booking.exitTime, 
              bookingInfo.entryTime, 
              bookingInfo.exitTime
            );
            
            if (overlaps) {
              filteredChairs[chairId] = booking;
            }
          });
        }
        
        setBookedChairs(filteredChairs);
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
        const userRes = await fetch(`http://localhost:5000/api/bookings/users/${memberId}`);
        if (!userRes.ok) throw new Error('User not found');
        const user = await userRes.json();
        
        if (!user.username || !user.teamId) {
          throw new Error('User data incomplete - missing username or teamId');
        }

        const teamRes = await fetch(`http://localhost:5000/api/teams/${user.teamId}`);
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
          userName: user.username
        };

        setMemberDetails(memberDetailsWithColor);
        setTeamName(team.teamName);
        setRole(user.role);

        const teamUsersRes = await fetch(`http://localhost:5000/api/bookings/users/team/${user.teamId}`);
        if (teamUsersRes.ok) {
          const teamUsers = await teamUsersRes.json();
          setAllTeamMembers(teamUsers.map(u => u.username));
        } else {
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

  // Function to refresh bookings with TIME FILTERING
  const refreshBookings = async () => {
    try {
      const queryParams = new URLSearchParams({
        date: bookingInfo.date,
        floor: bookingInfo.floor
      });
      
      const response = await fetch(`http://localhost:5000/api/bookings/filtered?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      
      const filteredChairs = {};
      
      if (data.chairs) {
        Object.keys(data.chairs).forEach(chairId => {
          const booking = data.chairs[chairId];
          
          const overlaps = timesOverlap(
            booking.entryTime, 
            booking.exitTime, 
            bookingInfo.entryTime, 
            bookingInfo.exitTime
          );
          
          if (overlaps) {
            filteredChairs[chairId] = booking;
          }
        });
      }
      
      setBookedChairs(filteredChairs);
    } catch (err) {
      console.error("Failed to refresh bookings:", err);
    }
  };

  // Popup components
  const PopUp = ({ message, onClose, children }) => (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto flex flex-col justify-center items-center border-2 border-green-400 animate-pop-in">
        <p className="mb-4 text-gray-800 text-sm sm:text-lg lg:text-xl font-semibold text-center">
          {message}
        </p>
        {children || (
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg text-sm sm:text-base"
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );

  const AddMemberIdPopUp = ({ onSubmit, onCancel, onChange, value }) => (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md flex flex-col justify-center items-center border-2 border-green-400">
        <p className="mb-4 sm:mb-6 text-gray-800 text-sm sm:text-lg lg:text-xl font-semibold text-center">
          Enter the member ID of the new team member:
        </p>
        <input
          className="w-full px-3 sm:px-4 py-2 border-2 border-green-300 rounded-lg text-sm sm:text-base mb-4 sm:mb-6 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
          placeholder="Enter member ID (e.g., user123)"
          value={value}
          onChange={onChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          autoFocus
        />
        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
          <button 
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg text-sm sm:text-base"
            onClick={onSubmit}
          >
            Enter
          </button>
          <button 
            className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg text-sm sm:text-base"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Responsive Table Component with your specified strategy
  const TableComponent = ({ tableId, index, seatSize = "normal" }) => {
    const getSeatClasses = () => {
      switch (seatSize) {
        case "small":
          return "w-12 h-6"; // Mobile: 12x6 as specified
        case "medium": 
          return "w-14 h-7"; // Tablet: medium-sized
        default:
          return "w-16 h-8"; // Desktop: full-sized
      }
    };

    // Minimal padding and compact spacing
    const getTableClasses = () => {
      if (seatSize === "small") {
        return "bg-white rounded-lg border border-gray-300 shadow-sm p-1"; // Minimal padding
      } else if (seatSize === "medium") {
        return "bg-white rounded-lg border border-gray-300 shadow-sm p-1"; // Minimal padding
      } else {
        return "bg-white rounded-lg border border-gray-300 shadow-sm p-2"; // Slightly more for desktop
      }
    };

    const getGapClasses = () => {
      if (seatSize === "small") {
        return "gap-1";
      } else if (seatSize === "medium") {
        return "gap-1";
      } else {
        return "gap-2";
      }
    };

    const getMarginClasses = () => {
      return "mb-1"; // Minimal margin for all sizes
    };

    return (
      <div className={getTableClasses()}>
        <div className={`flex justify-center ${getGapClasses()} ${getMarginClasses()}`}>
          {Array.from({ length: 4 }, (_, i) => {
            const chairId = `${tableId}-chair${i + 1}`;
            return (
              <div key={i} className={getSeatClasses()}>
                <Seat
                  chairId={chairId}
                  tableId={tableId}
                  bookedChairs={bookedChairs}
                  onClick={!bookingSubmitted ? () => handleChairClick(chairId, tableId) : () => {}}
                  label={`Seat-${i + 1}`}
                  isUserBooked={!bookingSubmitted && userBooking?.chairId === chairId}
                  seatSize={seatSize}
                />
              </div>
            );
          })}
        </div>
        
        <div className={`bg-green-50 text-center py-1 text-xs font-semibold text-gray-700 rounded ${getMarginClasses()}`}>
          Table {index + 1}
        </div>
        
        <div className={`flex justify-center ${getGapClasses()}`}>
          {Array.from({ length: 4 }, (_, i) => {
            const chairId = `${tableId}-chair${i + 5}`;
            return (
              <div key={i + 4} className={getSeatClasses()}>
                <Seat
                  chairId={chairId}
                  tableId={tableId}
                  bookedChairs={bookedChairs}
                  onClick={!bookingSubmitted ? () => handleChairClick(chairId, tableId) : () => {}}
                  label={`Seat-${i + 5}`}
                  isUserBooked={!bookingSubmitted && userBooking?.chairId === chairId}
                  seatSize={seatSize}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Chair click handler
  const handleChairClick = (chairId, tableId) => {
    if (bookingSubmitted) return;
    if (!entered || !memberDetails) {
      showMessage('Please ensure you are logged in and have valid team data.');
      return;
    }
  
    if (role === 'member') {
      if (bookedChairs[chairId]) {
        if (bookedChairs[chairId].userName === memberDetails?.userName) {
          const dateToUse = bookingInfo.date;
          
          fetch(`http://localhost:5000/api/bookings/unbook/${tableId}/${chairId}/${bookingInfo.floor}/${dateToUse}`, {
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
        if (!memberDetails.userName) {
          showMessage('Member details incomplete.');
          return;
        }
        
        const bookingDetails = {
          roomId: tableId,
          teamName,
          teamColor: memberDetails.teamColor,
          userName: memberDetails.userName,
          floor: bookingInfo.floor,
          date: bookingInfo.date,
          entryTime: bookingInfo.entryTime,
          exitTime: bookingInfo.exitTime,
        };
        
        fetch(`http://localhost:5000/api/bookings/member/${memberDetails.userName}/seat/${chairId}`, {
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
    }
  };

  // Handler functions
  const handleUnbook = () => {
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.userName;
    if (!targetMember) {
      showMessage('No member selected.');
      return;
    }

    const chairId = Object.keys(bookedChairs).find(
      (id) => bookedChairs[id]?.userName === targetMember
    );

    if (!chairId) {
      showMessage('No seat booked to unbook.');
      return;
    }

    const tableId = chairId.split('-')[0];
    const dateToUse = bookingInfo.date;
    
    fetch(`http://localhost:5000/api/bookings/unbook/${tableId}/${chairId}/${bookingInfo.floor}/${dateToUse}`, {
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
        if (role === 'member' || (role === 'leader' && selectedMember === memberDetails?.userName)) {
          setUserBooking(null);
        }
        refreshBookings();
      })
      .catch((err) => {
        showMessage(`Unbooking error: ${err.message}`);
      });
  };

  const handleSubmit = () => {
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.userName;
    if (!targetMember) {
      showMessage('No member selected for submission.');
      return;
    }

    const bookedSeat = userBooking?.chairId || Object.keys(bookedChairs).find(
      (chairId) => bookedChairs[chairId]?.userName === targetMember
    );

    if (!bookedSeat) {
      showMessage('Please book a seat before submitting.');
      return;
    }

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
    if (bookingSubmitted) return;
    
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
    const targetMember = role === 'leader' ? selectedMember : memberDetails?.userName;
    return Object.keys(bookedChairs).some(
      (chairId) => bookedChairs[chairId]?.userName === targetMember
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
        const userRes = await fetch(`http://localhost:5000/api/bookings/users/${newMemberId}`);
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
      <div className="w-full h-screen bg-green-50 flex items-center justify-center overflow-hidden m-0 p-0">
        <p className="text-gray-800 text-base sm:text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!entered && !isLoading && !bookingSubmitted) {
    return (
      <div className="w-full h-screen bg-green-50 flex items-center justify-center overflow-hidden p-4 m-0">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-gray-800 text-base sm:text-lg font-semibold">Please complete your booking information</p>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg text-sm sm:text-base"
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
    <div className="w-full h-screen bg-green-50 overflow-auto relative m-0 p-0">
      {shouldShowLayout ? (
        <div className="flex flex-col items-center justify-center gap-6 w-full min-h-screen py-8">
          
          {/* Booking Information Header - Perfectly Centered */}
          <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 text-center w-full max-w-2xl mx-auto shadow-sm">
            <p className="text-sm md:text-base font-semibold text-blue-800">
              📅 Booking for: {bookingInfo.date} | 🕐 Time: {bookingInfo.entryTime} - {bookingInfo.exitTime} | 🏢 Floor {bookingInfo.floor}
            </p>
          </div>
        
          {/* Leader Controls - Centered */}
          {entered && role === 'leader' && !bookingSubmitted && (
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-300 w-full max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-center">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Book for:</label>
                  <select
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:border-green-500 focus:outline-none min-w-48"
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
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm whitespace-nowrap"
                  onClick={addTeamMember}
                >
                  Add Member
                </button>
              </div>
            </div>
          )}

          {/* Main Floor Layout - Perfectly Centered */}
          <div className="w-full flex justify-center items-center">
            {/* Mobile Layout (320-768px): Single column with stacked tables */}
            <div className="block md:hidden w-full max-w-sm px-4">
              <div className="flex flex-col gap-4 mb-8">
                {/* First 4 tables */}
                {['T1', 'T2', 'T3', 'T4'].map((tableId, index) => (
                  <div key={tableId} className="flex justify-center">
                    <TableComponent 
                      tableId={tableId} 
                      index={index} 
                      seatSize="small"
                    />
                  </div>
                ))}
              </div>
              
              {/* Mobile Lobby - Centered */}
              <div className="bg-green-50 border-2 border-green-400 rounded-xl flex items-center justify-center h-20 mb-8 mx-auto max-w-xs shadow-sm">
                <span className="text-gray-800 font-bold text-base text-center">Lobby</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* Last 4 tables */}
                {['T5', 'T6', 'T7', 'T8'].map((tableId, index) => (
                  <div key={tableId} className="flex justify-center">
                    <TableComponent 
                      tableId={tableId} 
                      index={index + 4} 
                      seatSize="small"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tablet Layout (768-1024px): Two-column layout */}
            <div className="hidden md:block lg:hidden w-full max-w-4xl px-6">
              <div className="flex flex-col items-center gap-8">
                <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
                  {/* Tables T1-T4 */}
                  {['T1', 'T2', 'T3', 'T4'].map((tableId, index) => (
                    <div key={tableId} className="flex justify-center">
                      <TableComponent 
                        tableId={tableId} 
                        index={index} 
                        seatSize="medium"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Tablet Lobby - Centered */}
                <div className="bg-green-50 border-2 border-green-400 rounded-xl flex items-center justify-center w-80 h-32 shadow-sm">
                  <span className="text-gray-800 font-bold text-xl text-center">Lobby</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
                  {/* Tables T5-T8 */}
                  {['T5', 'T6', 'T7', 'T8'].map((tableId, index) => (
                    <div key={tableId} className="flex justify-center">
                      <TableComponent 
                        tableId={tableId} 
                        index={index + 4} 
                        seatSize="medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Layout (1024px+): Three-column layout - Better Centered */}
            <div className="hidden lg:flex lg:items-center lg:justify-center w-full max-w-7xl px-8">
              <div className="flex items-center justify-center gap-12">
                {/* Left Tables */}
                <div className="flex flex-col gap-5">
                  {['T1', 'T2', 'T3', 'T4'].map((tableId, index) => (
                    <TableComponent 
                      key={tableId} 
                      tableId={tableId} 
                      index={index} 
                      seatSize="normal"
                    />
                  ))}
                </div>

                {/* Desktop Lobby - Perfectly Centered */}
                <div className="bg-green-50 border-2 border-green-400 rounded-xl flex items-center justify-center w-56 h-[520px] shadow-lg">
                  <span className="text-gray-800 font-bold text-2xl text-center">Lobby</span>
                </div>

                {/* Right Tables */}
                <div className="flex flex-col gap-5">
                  {['T5', 'T6', 'T7', 'T8'].map((tableId, index) => (
                    <TableComponent 
                      key={tableId} 
                      tableId={tableId} 
                      index={index + 4} 
                      seatSize="normal"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons - Perfectly Centered */}
          {!bookingSubmitted && (
            <div className="bg-green-100 border border-green-300 rounded-xl p-6 text-center w-full max-w-md mx-auto mt-6 shadow-sm">
              <div className="flex gap-3 justify-center">
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors"
                  onClick={handleUnbook}
                >
                  Unbook
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  onClick={handleSubmit}
                  disabled={!hasBookedSeat()}
                >
                  Submit
                </button>
                <button 
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Success Message - Perfectly Centered */}
          {bookingSubmitted && (
            <div className="bg-green-100 border border-green-300 rounded-xl p-6 text-center w-full max-w-xl mx-auto mt-6 shadow-sm">
              <p className="text-green-800 font-semibold text-lg mb-4">✅ Booking Submitted Successfully!</p>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg text-sm transition-colors"
                onClick={() => navigate('/datebooking')}
              >
                Make Another Booking
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 text-center h-screen">
          <p className="text-gray-800 text-base sm:text-lg font-semibold">Loading your session...</p>
        </div>
      )}

      {/* Popups */}
      {message && <PopUp message={message} onClose={closeMessage} />}
      {showAddMemberPrompt && (
        <PopUp message="Do you want to book for another member?">
          <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
            <button 
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg text-sm sm:text-base"
              onClick={handleAddMemberPromptYes}
            >
              Yes
            </button>
            <button 
              className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg text-sm sm:text-base"
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