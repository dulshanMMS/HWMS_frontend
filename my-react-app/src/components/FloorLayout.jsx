/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Seat from './Seat';
import { jwtDecode } from "jwt-decode";
import RatingModal from "./ratingModal";

// Utility functions
const TAILWIND_COLORS = {
  'bg-red-500': '#ef4444', 'bg-blue-500': '#3b82f6', 'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308', 'bg-purple-500': '#a855f7', 'bg-pink-500': '#ec4899',
  'bg-indigo-500': '#6366f1', 'bg-orange-500': '#f97316', 'bg-teal-500': '#14b8a6',
  'bg-cyan-500': '#06b6d4', 'bg-gray-500': '#6b7280', 'bg-slate-500': '#64748b',
  'bg-amber-500': '#f59e0b', 'bg-lime-500': '#84cc16', 'bg-emerald-500': '#10b981',
  'bg-sky-500': '#0ea5e9', 'bg-violet-500': '#8b5cf6', 'bg-fuchsia-500': '#d946ef',
  'bg-rose-500': '#f43f5e'
};

const ensureHexColor = (color) => {
  if (!color) return '#808080';
  if (color.startsWith('#')) return color;
  return TAILWIND_COLORS[color] || '#808080';
};

const timesOverlap = (start1, end1, start2, end2) => {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const [s1, e1, s2, e2] = [start1, end1, start2, end2].map(parseTime);
  return s1 < e2 && s2 < e1;
};

const isUserAdmin = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    const decoded = jwtDecode(token);
    return decoded.role === 'admin' || decoded.isAdmin === true;
  } catch (error) {
    return false;
  }
};

const getCurrentUserName = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    const decoded = jwtDecode(token);
    return decoded.userName || decoded.username;
  } catch (error) {
    return null;
  }
};

// API functions
const api = {
  async fetchBookings(date, floor) {
    const response = await fetch(`http://localhost:5000/api/bookings/filtered?date=${date}&floor=${floor}`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async fetchUser(userId) {
    const response = await fetch(`http://localhost:5000/api/bookings/users/${userId}`);
    if (!response.ok) throw new Error('User not found');
    return response.json();
  },

  async fetchTeam(teamId) {
    const response = await fetch(`http://localhost:5000/api/teams`);
    if (!response.ok) throw new Error('Failed to fetch teams');
    
    const teams = await response.json();
    const team = teams.find(t => t.teamId === teamId);
    
    if (!team) throw new Error('Team not found');
    return team;
  },

  async bookSeat(chairId, bookingDetails) {
    const isAdmin = isUserAdmin();
    const currentUserName = getCurrentUserName();
    
    const endpoint = isAdmin 
      ? `/api/bookings/admin/${currentUserName}/seat/${chairId}`
      : `/api/bookings/member/${currentUserName}/seat/${chairId}`;
    
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingDetails),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Booking failed');
    }
    return response.json();
  },

  async unbookSeat(tableId, chairId, floor, date) {
    const isAdmin = isUserAdmin();
    const endpoint = isAdmin 
      ? `/api/bookings/admin/unbook/${tableId}/${chairId}/${floor}/${date}`
      : `/api/bookings/unbook/${tableId}/${chairId}/${floor}/${date}`;
    
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Unbooking failed');
    }
    return response.json();
  }
};

// Custom hooks
const useAuth = () => {
  const [memberId, setMemberId] = useState('');
  const [userRole, setUserRole] = useState('user');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setMemberId(decoded.userName || decoded.username);
      setUserRole(decoded.role || 'user');
    } catch (e) {
      navigate('/');
    }
  }, [navigate]);

  return { memberId, userRole };
};

const useUserData = (memberId) => {
  const [memberDetails, setMemberDetails] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;

    const fetchUserData = async () => {
      try {
        const user = await api.fetchUser(memberId);
        if (!user.userName || !user.teamId) {
          throw new Error('User data incomplete');
        }

        const team = await api.fetchTeam(user.teamId);
        const teamColor = ensureHexColor(team.color);
        
        setMemberDetails({ ...user, teamColor, userName: user.userName });
        setTeamName(team.teamName);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [memberId]);

  return { memberDetails, teamName, loading };
};

// Popup components
const PopUp = ({ message, onClose, children }) => (
  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-2 border-green-400 transform translate-y-16">
      <p className="mb-4 text-gray-800 text-lg font-semibold text-center">{message}</p>
      {children || (
        <div className="flex justify-center">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-lg"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      )}
    </div>
  </div>
);

// Table component
const TableComponent = ({ tableId, index, seatSize = "normal", bookedChairs, onChairClick, userBooking, disabled, selectedSeat }) => {
  const sizeClasses = {
    small: { seat: "w-12 h-6", table: "p-1", gap: "gap-1" },
    medium: { seat: "w-14 h-7", table: "p-1", gap: "gap-1" },
    normal: { seat: "w-16 h-8", table: "p-2", gap: "gap-2" }
  };

  const classes = sizeClasses[seatSize];

  const renderSeats = (startIndex, count) => 
    Array.from({ length: count }, (_, i) => {
      const chairId = `${tableId}-chair${startIndex + i}`;
      return (
        <div key={i} className={classes.seat}>
          <Seat
            chairId={chairId}
            tableId={tableId}
            bookedChairs={bookedChairs}
            onClick={disabled ? () => {} : () => onChairClick(chairId, tableId)}
            label={`Seat-${startIndex + i}`}
            isUserBooked={!disabled && (userBooking?.chairId === chairId || selectedSeat === chairId)}
            seatSize={seatSize}
          />
        </div>
      );
    });

  return (
    <div className={`bg-white rounded-lg border border-gray-300 shadow-sm ${classes.table}`}>
      <div className={`flex justify-center ${classes.gap} mb-1`}>
        {renderSeats(1, 4)}
      </div>
      
      <div className="bg-green-50 text-center py-1 text-xs font-semibold text-gray-700 rounded mb-1">
        Table {index + 1}
      </div>
      
      <div className={`flex justify-center ${classes.gap}`}>
        {renderSeats(5, 4)}
      </div>
    </div>
  );
};

// Main component
export default function FloorLayout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { memberId, userRole } = useAuth();
  const { memberDetails, teamName, loading: userLoading } = useUserData(memberId);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  const bookingInfo = useMemo(() => ({
    date: state?.date || null,
    entryTime: state?.entryTime || null,
    exitTime: state?.exitTime || null,
    floor: state?.floor || null,
  }), [state]);

  const [bookedChairs, setBookedChairs] = useState({});
  const [originalBookedChairs, setOriginalBookedChairs] = useState({}); // Track original state  
  const [localChanges, setLocalChanges] = useState({}); // Track what user changed locally
  const [userBooking, setUserBooking] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Use ref to track local changes for interval access
  const localChangesRef = useRef({});
  const isUpdatingRef = useRef(false);

  // Fetch userId for RatingModal
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error('No token found in localStorage');
          setMessage('Please log in to submit ratings.');
          return;
        }
        const profile = await api.fetchUser(memberId);
        if (!profile._id) {
          console.error('No userId found in profile:', profile);
          setMessage('Unable to fetch user profile.');
          return;
        }
        setUserId(profile._id);
      } catch (error) {
        console.error('Failed to fetch user profile:', error.message);
        setMessage('Failed to fetch user profile. Please log in again.');
      }
    };

    if (memberId) {
      fetchUserProfile();
    }
  }, [memberId]);

  // Prevent scrolling
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  // Initialize component state
  useEffect(() => {
    if (!memberId || !bookingInfo.date || !bookingInfo.floor) return;
    
    setBookingSubmitted(false);
    setSelectedSeat(null);
    setUserBooking(null);
    setLocalChanges({});
    
    // Clean up any old localStorage entries
    Object.keys(localStorage)
      .filter(key => key.startsWith('booking_submitted_'))
      .forEach(key => localStorage.removeItem(key));
    
  }, [memberId, bookingInfo]);

  // Main booking fetch effect
  useEffect(() => {
    if (!bookingInfo.floor || !bookingInfo.date || !bookingInfo.entryTime || !bookingInfo.exitTime) {
      setMessage('Please select booking details.');
      setIsLoading(false);
      navigate('/datebooking');
      return;
    }

    if (userLoading) return;

    const fetchBookings = async () => {
      // Absolutely prevent any updates if local changes exist
      if (Object.keys(localChangesRef.current).length > 0 || isUpdatingRef.current) {
        console.log('🛑 BLOCKED: API call blocked due to local changes');
        return;
      }

      try {
        isUpdatingRef.current = true;
        
        const data = await api.fetchBookings(bookingInfo.date, bookingInfo.floor);
        const filteredChairs = {};

        if (data.chairs) {
          Object.entries(data.chairs).forEach(([chairId, booking]) => {
            filteredChairs[chairId] = {
              ...booking,
              userName: booking.userName,
              teamColor: ensureHexColor(booking.teamColor),
              timeSlot: booking.timeSlot || `${booking.entryTime} - ${booking.exitTime}`,
              isFromDatabase: true
            };
          });
        }

        // Double check before updating - prevent race conditions
        if (Object.keys(localChangesRef.current).length > 0) {
          console.log('🛑 BLOCKED: Race condition prevented');
          return;
        }

        // Store original state from database
        setOriginalBookedChairs(filteredChairs);
        
        // Only update if absolutely no local changes
        setBookedChairs(prev => {
          const merged = { ...filteredChairs };
          
          if (!bookingSubmitted) {
            Object.entries(prev).forEach(([chairId, booking]) => {
              if (!filteredChairs[chairId] && booking.isVisualOnly) {
                merged[chairId] = booking;
              }
            });
          }
          
          return merged;
        });

        // Allow editing immediately when user returns later
        setBookingSubmitted(false);
        
        console.log('✅ API Update Applied');
        // Check submission state with 30-second timeout
        const submissionKey = `booking_submitted_${memberId}_${bookingInfo.date}_${bookingInfo.floor}`;
        const justSubmitted = localStorage.getItem(submissionKey);
        const submissionTime = localStorage.getItem(`${submissionKey}_time`);
        
        if (justSubmitted && submissionTime) {
          const timeDiff = Date.now() - parseInt(submissionTime);
          if (timeDiff < 30000) {
            setBookingSubmitted(true);
          } else {
            localStorage.removeItem(submissionKey);
            localStorage.removeItem(`${submissionKey}_time`);
            setBookingSubmitted(false);
          }
        }
        
      } catch (err) {
        setMessage('Failed to fetch bookings: ' + err.message);
      } finally {
        isUpdatingRef.current = false;
      }
    };

    // Only fetch on initial load and periodically when no local changes
    if (isLoading) {
      fetchBookings().finally(() => setIsLoading(false));
    }

    const interval = setInterval(() => {
      // Triple check using ref to ensure current value
      if (Object.keys(localChangesRef.current).length === 0 && !isUpdatingRef.current) {
        console.log('🔄 Auto refresh triggered');
        fetchBookings();
      } else {
        console.log('🛑 Auto refresh blocked - local changes exist');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [bookingInfo, navigate, memberDetails?.userName, userLoading, memberId, bookingSubmitted]); // Removed localChanges dependency to prevent re-runs

  // Event handlers
  const showMessage = (msg) => setMessage(msg);
  const closeMessage = () => setMessage(null);

  const handleChairClick = (chairId, tableId) => {
    console.log('🔵 CHAIR CLICKED:', chairId);
    
    if (bookingSubmitted || !memberDetails) {
      console.log('❌ Click blocked - submitted or no member details');
      return;
    }

    const currentBooking = bookedChairs[chairId];
    
    if (currentBooking) {
      if (currentBooking.userName === memberDetails.userName) {
        console.log('🔴 User clicking own seat to unbook');
        
        if (currentBooking.isFromDatabase) {
          // Database booking - mark for local unbooking (don't call API immediately)
          const newLocalChanges = {
            ...localChanges,
            [chairId]: { action: 'unbook', originalData: currentBooking }
          };
          
          setLocalChanges(newLocalChanges);
          localChangesRef.current = newLocalChanges; // Update ref immediately
          
          console.log('🔴 UNBOOK LOCAL:', chairId);
          
          // Remove from display locally
          setBookedChairs(prev => {
            const updated = { ...prev };
            delete updated[chairId];
            return updated;
          });
          
          setSelectedSeat(null);
          setUserBooking(null);
        } else if (currentBooking.isVisualOnly) {
          // Visual-only booking - just remove locally
          const newLocalChanges = { ...localChanges };
          delete newLocalChanges[chairId];
          
          setLocalChanges(newLocalChanges);
          localChangesRef.current = newLocalChanges; // Update ref immediately
          
          setBookedChairs(prev => {
            const updated = { ...prev };
            delete updated[chairId];
            return updated;
          });
          
          setSelectedSeat(null);
          setUserBooking(null);
        }
      } else {
        console.log('❌ Cannot unbook someone else\'s seat');
      }
      return;
    } else {
      console.log('🟢 Booking available seat');
      
      // Seat is available - check if user already has a seat
      const userCurrentBookings = Object.entries(bookedChairs).filter(([seatId, booking]) => 
        booking.userName === memberDetails.userName
      );
      
      if (userCurrentBookings.length > 0) {
        const existingBooking = userCurrentBookings[0];
        showMessage(`You already have a seat selected/booked (${existingBooking[0]}). Please unbook your existing seat first before selecting a new one.`);
        console.log('❌ User already has a booking:', existingBooking[0]);
        return;
      }
      
      // Create visual booking - NO API CALL
      setSelectedSeat(chairId);
      setUserBooking({ chairId, tableId });
      
      const visualChairData = {
        userName: memberDetails.userName,
        teamColor: ensureHexColor(memberDetails.teamColor),
        teamName,
        teamId: memberDetails.teamId,
        entryTime: bookingInfo.entryTime,
        exitTime: bookingInfo.exitTime,
        timeSlot: `${bookingInfo.entryTime} - ${bookingInfo.exitTime}`,
        date: bookingInfo.date,
        floor: bookingInfo.floor,
        isVisualOnly: true
      };
      
      // Track local change - NO API CALL HERE
      const newLocalChanges = {
        ...localChanges,
        [chairId]: { action: 'book', data: visualChairData }
      };
      
      setLocalChanges(newLocalChanges);
      localChangesRef.current = newLocalChanges; // Update ref immediately
      
      console.log('🟢 BOOK LOCAL ONLY:', chairId, '- NO API CALL MADE');
      
      setBookedChairs(prev => ({ ...prev, [chairId]: visualChairData }));
    }
  };

  const handleUnbook = () => {
    if (!memberDetails?.userName) return;

    const userBookedSeat = Object.keys(bookedChairs).find(chairId => 
      bookedChairs[chairId]?.userName === memberDetails.userName
    );
    
    if (!userBookedSeat) return;

    const booking = bookedChairs[userBookedSeat];
    
    if (booking.isFromDatabase) {
      // Database booking - mark for local unbooking (don't call API)
      const newLocalChanges = {
        ...localChanges,
        [userBookedSeat]: { action: 'unbook', originalData: booking }
      };
      
      setLocalChanges(newLocalChanges);
      localChangesRef.current = newLocalChanges; // Update ref immediately
    } else {
      // Visual booking - just remove locally
      const newLocalChanges = { ...localChanges };
      delete newLocalChanges[userBookedSeat];
      
      setLocalChanges(newLocalChanges);
      localChangesRef.current = newLocalChanges; // Update ref immediately
    }
    
    // Remove from display
    setBookedChairs(prev => {
      const updated = { ...prev };
      delete updated[userBookedSeat];
      return updated;
    });
    
    setSelectedSeat(null);
    setUserBooking(null);
  };

  const hasBookedSeat = () => {
    return memberDetails?.userName && Object.keys(localChanges).length > 0;
  };

  const handleSubmit = async () => {
    if (!memberDetails?.userName) {
      showMessage('No user logged in for submission.');
      return;
    }

    if (Object.keys(localChanges).length === 0) {
      showMessage('No changes to submit.');
      return;
    }

    try {
      // Process all local changes and apply to database
      for (const [chairId, change] of Object.entries(localChanges)) {
        const tableId = chairId.split('-')[0];
        
        if (change.action === 'book') {
          // Book the seat
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

          await api.bookSeat(chairId, bookingDetails);
          
        } else if (change.action === 'unbook') {
          // Unbook the seat
          await api.unbookSeat(tableId, chairId, bookingInfo.floor, bookingInfo.date);
        }
      }

      // Clear local changes and show only database state after successful submission
      setLocalChanges({});
      localChangesRef.current = {}; // Clear ref immediately
      setSelectedSeat(null);
      
      console.log('✅ SUBMIT: Local changes cleared, showing final DB state');
      
      // Refresh to show final database state
      const data = await api.fetchBookings(bookingInfo.date, bookingInfo.floor);
      const finalChairs = {};
      
      if (data.chairs) {
        Object.entries(data.chairs).forEach(([chairId, booking]) => {
          finalChairs[chairId] = {
            ...booking,
            userName: booking.userName,
            teamColor: ensureHexColor(booking.teamColor),
            timeSlot: booking.timeSlot || `${booking.entryTime} - ${booking.exitTime}`,
            isFromDatabase: true
          };
        });
      }
      
      setBookedChairs(finalChairs);
      setOriginalBookedChairs(finalChairs);
      setBookingSubmitted(true);
      
      const submissionKey = `booking_submitted_${memberId}_${bookingInfo.date}_${bookingInfo.floor}`;
      localStorage.setItem(submissionKey, 'true');
      localStorage.setItem(`${submissionKey}_time`, Date.now().toString());
      
      showMessage('All changes submitted successfully!');
      
      // Show rating modal occasionally
      if (Math.random() < 0.1) setIsRatingOpen(true);
      
    } catch (err) {
      showMessage('Submission failed: ' + err.message);
    }
  };

  const handleCancel = () => {
    if (bookingSubmitted) return;
    
    // Clear all local changes and show only database state
    setLocalChanges({});
    localChangesRef.current = {}; // Clear ref immediately
    setBookedChairs(originalBookedChairs);
    setSelectedSeat(null);
    setUserBooking(null);
    
    console.log('🔄 CANCEL: Local changes cleared');
    
    // Navigate back
    navigate('/datebooking');
  };

  if (isLoading || userLoading) {
    return (
      <div className="w-full h-screen bg-green-50 flex items-center justify-center">
        <p className="text-gray-800 text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!memberDetails && !bookingSubmitted) {
    return (
      <div className="w-full h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-800 text-lg font-semibold mb-4">Please complete your booking information</p>
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

  const tableIds = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];

  return (
    <div className="w-full h-screen bg-green-50 overflow-hidden relative">
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col items-center justify-center gap-6 w-full min-h-screen py-8">
          
          <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 text-center w-full max-w-2xl shadow-sm">
            <p className="text-base font-semibold text-blue-800">
              📅 Booking for: {bookingInfo.date}  | 🕐 Time: {bookingInfo.entryTime} - {bookingInfo.exitTime} | 🏢 Floor {bookingInfo.floor}
              {userRole === 'admin' && <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-sm">ADMIN</span>}
            </p>
          </div>

          <div className="w-full flex justify-center">
            <div className="block md:hidden w-full max-w-sm px-4">
              <div className="flex flex-col gap-4 mb-8">
                {tableIds.slice(0, 4).map((tableId, index) => (
                  <TableComponent 
                    key={tableId}
                    tableId={tableId} 
                    index={index} 
                    seatSize="small"
                    bookedChairs={bookedChairs}
                    onChairClick={handleChairClick}
                    userBooking={userBooking}
                    selectedSeat={selectedSeat}
                    disabled={bookingSubmitted}
                  />
                ))}
              </div>
              
              <div className="bg-green-50 border-2 border-green-400 rounded-xl flex items-center justify-center h-20 mb-8 shadow-sm">
                <span className="text-gray-800 font-bold text-base">Lobby</span>
              </div>
              
              <div className="flex flex-col gap-4">
                {tableIds.slice(4).map((tableId, index) => (
                  <TableComponent 
                    key={tableId}
                    tableId={tableId} 
                    index={index + 4} 
                    seatSize="small"
                    bookedChairs={bookedChairs}
                    onChairClick={handleChairClick}
                    userBooking={userBooking}
                    selectedSeat={selectedSeat}
                    disabled={bookingSubmitted}
                  />
                ))}
              </div>
            </div>

            <div className="hidden md:block lg:hidden w-full max-w-4xl px-6">
              <div className="flex flex-col items-center gap-8">
                <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
                  {tableIds.slice(0, 4).map((tableId, index) => (
                    <TableComponent 
                      key={tableId}
                      tableId={tableId} 
                      index={index} 
                      seatSize="medium"
                      bookedChairs={bookedChairs}
                      onChairClick={handleChairClick}
                      userBooking={userBooking}
                      selectedSeat={selectedSeat}
                      disabled={bookingSubmitted}
                    />
                  ))}
                </div>
                
                <div className="bg-green-50 border-2 border-green-400 rounded-xl flex items-center justify-center w-80 h-32 shadow-sm">
                  <span className="text-gray-800 font-bold text-xl">Lobby</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
                  {tableIds.slice(4).map((tableId, index) => (
                    <TableComponent 
                      key={tableId}
                      tableId={tableId} 
                      index={index + 4} 
                      seatSize="medium"
                      bookedChairs={bookedChairs}
                      onChairClick={handleChairClick}
                      userBooking={userBooking}
                      selectedSeat={selectedSeat}
                      disabled={bookingSubmitted}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center w-full max-w-7xl px-8">
              <div className="flex items-center gap-12">
                <div className="flex flex-col gap-5">
                  {tableIds.slice(0, 4).map((tableId, index) => (
                    <TableComponent 
                      key={tableId}
                      tableId={tableId} 
                      index={index}
                      bookedChairs={bookedChairs}
                      onChairClick={handleChairClick}
                      userBooking={userBooking}
                      selectedSeat={selectedSeat}
                      disabled={bookingSubmitted}
                    />
                  ))}
                </div>

                <div className="bg-green-50 border-2 border-green-400 rounded-xl flex items-center justify-center w-56 h-[520px] shadow-lg">
                  <span className="text-gray-800 font-bold text-2xl">Lobby</span>
                </div>

                <div className="flex flex-col gap-5">
                  {tableIds.slice(4).map((tableId, index) => (
                    <TableComponent 
                      key={tableId}
                      tableId={tableId} 
                      index={index + 4}
                      bookedChairs={bookedChairs}
                      onChairClick={handleChairClick}
                      userBooking={userBooking}
                      selectedSeat={selectedSeat}
                      disabled={bookingSubmitted}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {!bookingSubmitted && (
            <div className="bg-green-100 border border-green-300 rounded-xl p-6 w-full max-w-md shadow-sm">
              <div className="flex gap-3 justify-center">
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg"
                  onClick={handleUnbook}
                >
                  Unbook
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg disabled:bg-gray-400"
                  onClick={handleSubmit}
                  disabled={!hasBookedSeat()}
                >
                  Submit
                </button>
                <button 
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 px-6 rounded-lg"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {bookingSubmitted && (
            <div className="bg-green-100 border border-green-300 rounded-xl p-6 text-center w-full max-w-md shadow-sm">
              <p className="text-green-800 font-semibold text-lg mb-4">✅ Booking Submitted Successfully!</p>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg"
                onClick={() => navigate('/datebooking')}
              >
                Make Another Booking
              </button>
            </div>
          )}

          <RatingModal
            isOpen={isRatingOpen}
            onClose={() => setIsRatingOpen(false)}
            onSubmit={async (data) => {
              try {
                const response = await fetch('/api/ratings/submit-rating', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, bookingType: 'seating', ...data }),
                });
                return response;
              } catch (error) {
                console.error('Fetch error in onSubmit:', error.message);
                throw error;
              }
            }}
            userId={userId}
            bookingType="seating"
          />

          {message && <PopUp message={message} onClose={closeMessage} />}
        </div>
      </div>
    </div>
  );
}
//ghcgcjjhcv
//fyfgkgkgg
//fyjfgfgg