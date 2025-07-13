// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const RecentBookingsTable = ({ bookings }) => {
//   const [teams, setTeams] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // Limit to the most recent 10 bookings
//   const recentBookings = bookings.slice(0, 10);

//   // Fetch team colors on component mount
//   useEffect(() => {
//     fetchTeams();
//   }, []);

//   const fetchTeams = async () => {
//     try {
//       const response = await axios.get('/api/teams');
//       setTeams(response.data);
//     } catch (error) {
//       console.error('Failed to fetch team colors:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to get team display name without color dot
//   const renderTeamName = (booking) => {
//     const teamName = getTeamName(booking);
    
//     if (!teamName || teamName === 'No Team') {
//       return (
//         <span className="text-sm font-medium text-gray-500">No Team</span>
//       );
//     }
    
//     return (
//       <span className="text-sm font-medium">{teamName}</span>
//     );
//   };

//   // Function to get username from booking data
//   const getUsername = (booking) => {
//     if (booking.user?.fullName) return booking.user.fullName;
//     if (booking.user?.name) return booking.user.name;
//     if (booking.user?.username) return booking.user.username;
//     if (booking.userName) return booking.userName;
//     return 'Unknown User';
//   };

//   // Function to get team name from booking data
//   const getTeamName = (booking) => {
//     if (booking.team && booking.team !== 'No Team') return booking.team;
//     if (booking.user?.team && booking.user.team !== 'No Team') return booking.user.team;
//     return 'No Team';
//   };

//   console.log('Recent Bookings Sample:', recentBookings[0]);
//   console.log('Teams:', teams);

//   if (loading) {
//     return (
//       <div className="bg-white rounded-lg shadow p-4 mb-6">
//         <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-lg shadow p-4 mb-6">
//       <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
      
//       {recentBookings.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           No recent bookings found
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   USER
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   TEAM
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   TYPE
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   DATE
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   SLOT
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   TIME
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {recentBookings.map((booking, index) => (
//                 <tr key={booking._id} className="hover:bg-gray-50">

//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">
//                       {getUsername(booking)}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {renderTeamName(booking)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                       booking.type === 'seat' 
//                         ? 'bg-cyan-100 text-cyan-800' 
//                         : 'bg-purple-100 text-purple-800'
//                     }`}>
//                       {booking.type}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(booking.date).toLocaleDateString('en-US', {
//                       year: 'numeric',
//                       month: 'short',
//                       day: 'numeric'
//                     })}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {booking.slot ? 
//                       `${booking.slot.slotNumber} (Floor ${booking.slot.floor})` : 
//                       'N/A'
//                     }
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {booking.entryTime} - {booking.exitTime}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RecentBookingsTable;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecentBookingsTable = ({ bookings }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Limit to the most recent 10 bookings
  const recentBookings = bookings.slice(0, 10);

  // Fetch team colors on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch team colors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get team display name without color dot
  const renderTeamName = (booking) => {
    const teamName = getTeamName(booking);
    
    if (!teamName || teamName === 'No Team') {
      return (
        <span className="text-sm font-medium text-gray-500">No Team</span>
      );
    }
    
    return (
      <span className="text-sm font-medium">{teamName}</span>
    );
  };

  // Function to get username from booking data
  const getUsername = (booking) => {
    if (booking.user?.fullName) return booking.user.fullName;
    if (booking.user?.name) return booking.user.name;
    if (booking.user?.username) return booking.user.username;
    if (booking.userName) return booking.userName;
    if (booking.booking?.userName) return booking.booking.userName;
    return 'Unknown User';
  };

  // Function to get team name from booking data - Updated to handle multiple data structures
  const getTeamName = (booking) => {
    // Check direct team property first
    if (booking.team && booking.team !== 'No Team') return booking.team;
    
    // Check booking.booking.team (for recent bookings API response)
    if (booking.booking?.team && booking.booking.team !== 'No Team') return booking.booking.team;
    
    // Check user.team
    if (booking.user?.team && booking.user.team !== 'No Team') return booking.user.team;
    
    // Check booking.booking object for team info
    if (booking.booking?.user?.team && booking.booking.user.team !== 'No Team') {
      return booking.booking.user.team;
    }
    
    return 'No Team';
  };

  // Function to get booking type
  const getBookingType = (booking) => {
    if (booking.type) return booking.type;
    if (booking.slotType) return booking.slotType === 'seating' ? 'seat' : booking.slotType;
    return 'unknown';
  };

  // Function to get booking date
  const getBookingDate = (booking) => {
    const date = booking.date || booking.booking?.date;
    return date ? new Date(date) : new Date();
  };

  // Function to get slot info
  const getSlotInfo = (booking) => {
    const slotNumber = booking.slot?.slotNumber || booking.slotNumber;
    const floor = booking.slot?.floor || booking.floor;
    
    if (slotNumber && floor) {
      return `${slotNumber} (Floor ${floor})`;
    }
    return 'N/A';
  };

  // Function to get time info
  const getTimeInfo = (booking) => {
    const entryTime = booking.entryTime || booking.booking?.entryTime;
    const exitTime = booking.exitTime || booking.booking?.exitTime;
    
    if (entryTime && exitTime) {
      return `${entryTime} - ${exitTime}`;
    }
    return 'N/A';
  };

  console.log('Recent Bookings Sample:', recentBookings[0]);
  console.log('Teams:', teams);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
      
      {recentBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recent bookings found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TEAM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TYPE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLOT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TIME
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking, index) => (
                <tr key={booking._id || booking.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getUsername(booking)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderTeamName(booking)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getBookingType(booking) === 'seat' 
                        ? 'bg-cyan-100 text-cyan-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {getBookingType(booking)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getBookingDate(booking).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getSlotInfo(booking)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTimeInfo(booking)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentBookingsTable;