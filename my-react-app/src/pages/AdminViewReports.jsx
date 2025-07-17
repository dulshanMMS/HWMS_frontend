
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendar } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import AdminLayout from '../components/AdminLayout';
import useAuthGuard from '../components/AuthGuard';
import BookingLookup from '../components/Reports/BookingLookup';
import DailyTrendsChart from '../components/Reports/DailyTrendsChart';
import FloorUsageChart from '../components/Reports/FloorUsageChart';
import MonthlyStatsChart from '../components/Reports/MonthlyStatsChart';
import RecentBookingsTable from '../components/Reports/RecentBookingsTable';
import UserBookingTable from '../components/Reports/UserBookingTable';
import TeamLookupTable from '../components/Reports/TeamLookupTable';
import TeamColorPalette from '../components/shared/TeamColorPalette';
import api from '../config/api';

// const AdminViewReports = () => {
//   useAuthGuard('admin');
//   const [analyticsData, setAnalyticsData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [dateRange, setDateRange] = useState([null, null]);
//   const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
//   const [startDate, endDate] = dateRange;
//   const [showClearButton, setShowClearButton] = useState(false);
//   const [searchType, setSearchType] = useState('username');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [userError, setUserError] = useState(null);
//   const [userBookings, setUserBookings] = useState(null);
//   const [userLoading, setUserLoading] = useState(false);
//   const [allBookings, setAllBookings] = useState([]);
//   const [teamStats, setTeamStats] = useState(null);
//   const [teamStatsError, setTeamStatsError] = useState(null);
//   const [loadingTeamStats, setLoadingTeamStats] = useState(false);

//   //const totalDesksPerFloor = { 14: 64, 30: 64, 31: 64, 32: 64 }; // Update as needed
//   const totalDesksPerFloor = { 1: 64, 2: 64, 3: 64, 4: 64 };
//   useEffect(() => { 
//     fetchAnalyticsData();
//     fetchAllBookings();
//   }, [appliedDateRange]);

//   const handleApplyDateRange = () => {
//     if (startDate && endDate) {
//       setAppliedDateRange([startDate, endDate]);
//       setShowClearButton(true);
//     }
//   };

//   const handleClearDateRange = () => {
//     setDateRange([null, null]);
//     setAppliedDateRange([null, null]);
//     setShowClearButton(false);
//   };

//   const fetchAnalyticsData = async () => {
//     try {
//       setLoading(true);
//       const [appliedStart, appliedEnd] = appliedDateRange;
      
//       const response = await api.get('/api/reports/analytics', {
//         params: {
//           startDate: appliedStart?.toISOString(),
//           endDate: appliedEnd?.toISOString()
//         }
//       });
      
//       setAnalyticsData(response.data);
//       setError(null);
//     } catch (err) {
//       setError(`Failed to fetch analytics data: ${err.response?.data?.message || err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUserBookings = async () => {
//     const query = searchQuery.trim();
//     if (!query) {
//       setUserError('Please enter a search term');
//       return;
//     }

//     try {
//       setUserLoading(true);
//       setUserError(null);
//       setUserBookings(null);

//       const response = await axios.get('http://localhost:5000/api/reports/user-lookup', {
//         params: { username: query },
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       });

//       setUserBookings(response.data);
//     } catch (err) {
//       console.error('Error fetching user bookings:', err);
//       setUserError(`Error: Failed to fetch bookings: ${err.message}`);
//     } finally {
//       setUserLoading(false);
//     }
//   };

//   const handleSearch = async () => {
//     const query = searchQuery.trim();
//     if (!query) {
//       setUserError('Please enter a search term');
//       return;
//     }

//     if (searchType === 'team') {
//       setLoadingTeamStats(true);
//       setTeamStats(null);
//       setTeamStatsError(null);

//       try {
//         const res = await axios.get('http://localhost:5000/api/reports/team-stats', {
//           params: { teamName: query },
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           },
//         });

//         setTeamStats(res.data);
//       } catch (err) {
//         console.error('Error fetching team stats:', err);
//         setTeamStatsError(`Failed to fetch team stats: ${err.message}`);
//       } finally {
//         setLoadingTeamStats(false);
//       }
//     } else if (searchType === 'username') {
//       fetchUserBookings();
//     }
//   };

//   const fetchAllBookings = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/reports/all-bookings', {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       });
//       setAllBookings(response.data);
//     } catch (err) {
//       console.error('Error fetching all bookings:', err);
//     }
//   };

//   const getFloorUsageBookings = () => {
//     if (!appliedDateRange[0] || !appliedDateRange[1]) {
//       return allBookings.filter(booking => booking.type === 'seat');
//     }
//     const [start, end] = appliedDateRange;
//     return allBookings.filter(booking => {
//       const bookingDate = new Date(booking.date);
//       return booking.type === 'seat' && bookingDate >= start && bookingDate <= end;
//     });
//   };

//   const downloadExcel = () => {
//     const workbook = XLSX.utils.book_new();
//     const now = new Date();

//     const [appliedStart, appliedEnd] = appliedDateRange;

//     const infoSheetData = [
//       ['Downloaded At', now.toLocaleString()],
//       ['Date Range Applied', appliedStart && appliedEnd
//         ? `${appliedStart.toLocaleDateString()} to ${appliedEnd.toLocaleDateString()}`
//         : 'No date range applied'],
//     ];
//     const infoSheet = XLSX.utils.aoa_to_sheet(infoSheetData);
//     XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info');

//     const summarySheetData = [
//       ['Total Bookings', analyticsData?.overallStats?.totalBookings || 0],
//       ['Parking Bookings', analyticsData?.overallStats?.totalParking || 0],
//       ['Seat Bookings', analyticsData?.overallStats?.totalSeats || 0],
//     ];
//     const summarySheet = XLSX.utils.aoa_to_sheet(summarySheetData);
//     XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

//     const dailyTrendsSheetData = [
//       ['Date', 'Seat Bookings', 'Parking Bookings'],
//       ...(analyticsData?.dailyTrends || []).map(d => [
//         new Date(d._id.date).toLocaleDateString(),
//         d.seatsCount,
//         d.parkingCount
//       ])
//     ];
//     const dailySheet = XLSX.utils.aoa_to_sheet(dailyTrendsSheetData);
//     XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Trends');

//     const monthlyStatsSheetData = [
//       ['Month', 'Seat Bookings', 'Parking Bookings'],
//       ...(analyticsData?.monthlyStats || []).map(m => [
//         m._id.month,
//         m.seatsCount,
//         m.parkingCount
//       ])
//     ];
//     const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyStatsSheetData);
//     XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Stats');

//     const filteredBookings = getFloorUsageBookings();
//     const bookingsSheetData = [
//       [
//         'Username',
//         'Full Name',
//         'Team',
//         'Booking Type',
//         'Date',
//         'Entry Time',
//         'Exit Time',
//         'Slot Number',
//         'Floor'
//       ],
//       ...filteredBookings.map(b => [
//         b.user?.username || 'N/A',
//         b.user?.fullName || 'N/A',
//         b.team || 'No Team',
//         b.type,
//         new Date(b.date).toLocaleDateString(),
//         b.entryTime,
//         b.exitTime,
//         b.slot?.slotNumber || '',
//         b.slot?.floor || ''
//       ])
//     ];
//     const bookingsSheet = XLSX.utils.aoa_to_sheet(bookingsSheetData);
//     XLSX.utils.book_append_sheet(workbook, bookingsSheet, 'Bookings');

//     if (userBookings) {
//       const lookupSheetData = [
//         ['Username', userBookings.user?.username || ''],
//         ['Full Name', userBookings.user?.name || ''],
//         ['Team', userBookings.user?.team || ''],
//         ['Total Seat Bookings', userBookings.seatCount || 0],
//         ['Total Parking Bookings', userBookings.parkingCount || 0],
//         ['Total Bookings', (userBookings.seatCount || 0) + (userBookings.parkingCount || 0)],
//         [],
//         ['Date', 'Entry Time', 'Exit Time', 'Type', 'Slot Number', 'Floor']
//       ];

//       (userBookings.bookings || []).forEach(b => {
//         lookupSheetData.push([
//           new Date(b.date).toLocaleDateString(),
//           b.entryTime,
//           b.exitTime,
//           b.type,
//           b.slotNumber,
//           b.floor
//         ]);
//       });

//       const lookupSheet = XLSX.utils.aoa_to_sheet(lookupSheetData);
//       XLSX.utils.book_append_sheet(workbook, lookupSheet, 'Booking Lookup');
//     }

//     const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//     const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
//     saveAs(data, `AdminViewReports_${now.toISOString().slice(0, 10)}.xlsx`);
//   };

//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="flex items-center justify-center min-h-[60vh]">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//         </div>
//       );
//     }

//     if (error) {
//       return (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
//           <strong className="font-bold">Error!</strong>
//           <span className="block sm:inline ml-2">{error}</span>
//         </div>
//       );
//     }

//     return (
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
//           <h1 className="text-2xl font-semibold text-gray-800">Analytics & Reports</h1>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <FaCalendar className="text-gray-500" />
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setDateRange([date, endDate])}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                 placeholderText="Start date"
//                 dateFormat="MMM dd, yyyy"
//                 disabled={showClearButton}
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <FaCalendar className="text-gray-500" />
//               <DatePicker
//                 selected={endDate}
//                 onChange={(date) => setDateRange([startDate, date])}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                 placeholderText="End date"
//                 dateFormat="MMM dd, yyyy"
//                 disabled={showClearButton}
//               />
//             </div>
//             {!showClearButton ? (
//               <button
//                 onClick={handleApplyDateRange}
//                 disabled={!startDate || !endDate}
//                 className={`px-4 py-2 rounded-md text-white ${
//                   !startDate || !endDate 
//                     ? 'bg-gray-400 cursor-not-allowed' 
//                     : 'bg-primary hover:bg-primary-dark'
//                 } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
//               >
//                 Apply Date Range
//               </button>
//             ) : (
//               <button
//                 onClick={handleClearDateRange}
//                 className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
//               >
//                 Clear Date Range
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-white rounded-2xl shadow-sm p-6">
//             <h3 className="text-lg font-semibold text-gray-800">Total Bookings</h3>
//             <p className="text-3xl font-bold text-gray-800 mt-2">
//               {analyticsData?.overallStats?.totalBookings || 0}
//             </p>
//           </div>
//           <div className="bg-white rounded-2xl shadow-sm p-6">
//             <h3 className="text-lg font-semibold text-gray-800">Parking Bookings</h3>
//             <p className="text-3xl font-bold mt-2" style={{ color: '#9C27B0' }}>
//               {analyticsData?.overallStats?.totalParking || 0}
//             </p>
//           </div>
//           <div className="bg-white rounded-2xl shadow-sm p-6">
//             <h3 className="text-lg font-semibold text-gray-800">Seat Bookings</h3>
//             <p className="text-3xl font-bold mt-2" style={{ color: '#00BCD4' }}>
//               {analyticsData?.overallStats?.totalSeats || 0}
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <DailyTrendsChart data={analyticsData} />
//           <MonthlyStatsChart data={analyticsData} dateRange={appliedDateRange} />
//         </div>

//         <div className="flex flex-col md:flex-row items-start">
//           <div className="flex-1 h-[340px] mr-6">
//             <FloorUsageChart
//               bookings={getFloorUsageBookings()}
//               totalDesksPerFloor={totalDesksPerFloor}
//             />
//           </div>
//           <div className="self-start">
//             <TeamColorPalette />
//           </div>
//         </div>
//         <div className="mt-10">
//           <BookingLookup
//             searchType={searchType}
//             setSearchType={setSearchType}
//             searchQuery={searchQuery}
//             setSearchQuery={setSearchQuery}
//             onSearch={handleSearch}
//             error={userError}
//           />
//           {loadingTeamStats && <div>Loading team stats...</div>}
//           {teamStatsError && (
//             <div className="mt-3 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-sm">
//               {teamStatsError}
//             </div>
//           )}
//           {teamStats && searchType === 'team' && (
//             <div className="mt-6 mb-10">
//               <TeamLookupTable
//                 teamData={teamStats}
//                 onMemberClick={(member) => {
//                   setSearchType('username');
//                   setSearchQuery(member.username);
//                   fetchUserBookings();
//                 }}
//               />
//             </div>
//           )}
//           {userBookings && (
//             <div className="mb-10">
//               <UserBookingTable userBookings={userBookings} />
//             </div>
//           )}
//           <RecentBookingsTable bookings={allBookings} />
//           <button
//             onClick={downloadExcel}
//             className="fixed bottom-5 right-5 px-5 py-2 bg-green-500 text-white rounded-md shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 z-50"
//           >
//             Download Excel
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <AdminLayout>
//       {renderContent()}
//     </AdminLayout>
//   );
// };


// ... (previous imports and state setup remain the same)

const AdminViewReports = () => {
  useAuthGuard('admin');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showClearButton, setShowClearButton] = useState(false);
  const [searchType, setSearchType] = useState('username');
  const [searchQuery, setSearchQuery] = useState('');
  const [userError, setUserError] = useState(null);
  const [userBookings, setUserBookings] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [teamStatsError, setTeamStatsError] = useState(null);
  const [loadingTeamStats, setLoadingTeamStats] = useState(false);

  // Dynamically generate totalDesksPerFloor based on all unique floors in bookings
  const getTotalDesksPerFloor = (bookings) => {
    const floors = new Set(bookings.filter(b => b.type === 'seat').map(b => b.slot?.floor));
    const defaultCapacity = 64; // Default capacity per floor
    const floorMap = {};
    floors.forEach(floor => {
      floorMap[floor] = defaultCapacity;
    });
    return floorMap;
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchAllBookings();
  }, [appliedDateRange]);

  const handleApplyDateRange = () => {
    if (startDate && endDate) {
      setAppliedDateRange([startDate, endDate]);
      setShowClearButton(true);
    }
  };

  const handleClearDateRange = () => {
    setDateRange([null, null]);
    setAppliedDateRange([null, null]);
    setShowClearButton(false);
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [appliedStart, appliedEnd] = appliedDateRange;
      
      const response = await api.get('/api/reports/analytics', {
        params: {
          startDate: appliedStart?.toISOString(),
          endDate: appliedEnd?.toISOString()
        }
      });
      
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch analytics data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setUserError('Please enter a search term');
      return;
    }

    try {
      setUserLoading(true);
      setUserError(null);
      setUserBookings(null);

      const response = await axios.get('http://localhost:5000/api/reports/user-lookup', {
        params: { username: query },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setUserBookings(response.data);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setUserError(`Error: Failed to fetch bookings: ${err.message}`);
    } finally {
      setUserLoading(false);
    }
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setUserError('Please enter a search term');
      return;
    }

    if (searchType === 'team') {
      setLoadingTeamStats(true);
      setTeamStats(null);
      setTeamStatsError(null);

      try {
        const res = await axios.get('http://localhost:5000/api/reports/team-stats', {
          params: { teamName: query },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setTeamStats(res.data);
      } catch (err) {
        console.error('Error fetching team stats:', err);
        setTeamStatsError(`Failed to fetch team stats: ${err.message}`);
      } finally {
        setLoadingTeamStats(false);
      }
    } else if (searchType === 'username') {
      fetchUserBookings();
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reports/all-bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAllBookings(response.data);
    } catch (err) {
      console.error('Error fetching all bookings:', err);
    }
  };

  const getFloorUsageBookings = () => {
    if (!appliedDateRange[0] || !appliedDateRange[1]) {
      return allBookings.filter(booking => booking.type === 'seat');
    }
    const [start, end] = appliedDateRange;
    return allBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return booking.type === 'seat' && bookingDate >= start && bookingDate <= end;
    });
  };

  const downloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const now = new Date();

    const [appliedStart, appliedEnd] = appliedDateRange;

    const infoSheetData = [
      ['Downloaded At', now.toLocaleString()],
      ['Date Range Applied', appliedStart && appliedEnd
        ? `${appliedStart.toLocaleDateString()} to ${appliedEnd.toLocaleDateString()}`
        : 'No date range applied'],
    ];
    const infoSheet = XLSX.utils.aoa_to_sheet(infoSheetData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info');

    const summarySheetData = [
      ['Total Bookings', analyticsData?.overallStats?.totalBookings || 0],
      ['Parking Bookings', analyticsData?.overallStats?.totalParking || 0],
      ['Seat Bookings', analyticsData?.overallStats?.totalSeats || 0],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const dailyTrendsSheetData = [
      ['Date', 'Seat Bookings', 'Parking Bookings'],
      ...(analyticsData?.dailyTrends || []).map(d => [
        new Date(d._id.date).toLocaleDateString(),
        d.seatsCount,
        d.parkingCount
      ])
    ];
    const dailySheet = XLSX.utils.aoa_to_sheet(dailyTrendsSheetData);
    XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Trends');

    const monthlyStatsSheetData = [
      ['Month', 'Seat Bookings', 'Parking Bookings'],
      ...(analyticsData?.monthlyStats || []).map(m => [
        m._id.month,
        m.seatsCount,
        m.parkingCount
      ])
    ];
    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyStatsSheetData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Stats');

    const filteredBookings = getFloorUsageBookings();
    const bookingsSheetData = [
      [
        'Username',
        'Full Name',
        'Team',
        'Booking Type',
        'Date',
        'Entry Time',
        'Exit Time',
        'Slot Number',
        'Floor'
      ],
      ...filteredBookings.map(b => [
        b.user?.username || 'N/A',
        b.user?.fullName || 'N/A',
        b.team || 'No Team',
        b.type,
        new Date(b.date).toLocaleDateString(),
        b.entryTime,
        b.exitTime,
        b.slot?.slotNumber || '',
        b.slot?.floor || ''
      ])
    ];
    const bookingsSheet = XLSX.utils.aoa_to_sheet(bookingsSheetData);
    XLSX.utils.book_append_sheet(workbook, bookingsSheet, 'Bookings');

    if (userBookings) {
      const lookupSheetData = [
        ['Username', userBookings.user?.username || ''],
        ['Full Name', userBookings.user?.name || ''],
        ['Team', userBookings.user?.team || ''],
        ['Total Seat Bookings', userBookings.seatCount || 0],
        ['Total Parking Bookings', userBookings.parkingCount || 0],
        ['Total Bookings', (userBookings.seatCount || 0) + (userBookings.parkingCount || 0)],
        [],
        ['Date', 'Entry Time', 'Exit Time', 'Type', 'Slot Number', 'Floor']
      ];

      (userBookings.bookings || []).forEach(b => {
        lookupSheetData.push([
          new Date(b.date).toLocaleDateString(),
          b.entryTime,
          b.exitTime,
          b.type,
          b.slotNumber,
          b.floor
        ]);
      });

      const lookupSheet = XLSX.utils.aoa_to_sheet(lookupSheetData);
      XLSX.utils.book_append_sheet(workbook, lookupSheet, 'Booking Lookup');
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `AdminViewReports_${now.toISOString().slice(0, 10)}.xlsx`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      );
    }

    const floorUsageBookings = getFloorUsageBookings();
    const dynamicTotalDesksPerFloor = getTotalDesksPerFloor(floorUsageBookings);

    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Analytics & Reports</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaCalendar className="text-gray-500" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setDateRange([date, endDate])}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholderText="Start date"
                dateFormat="MMM dd, yyyy"
                disabled={showClearButton}
              />
            </div>
            <div className="flex items-center gap-2">
              <FaCalendar className="text-gray-500" />
              <DatePicker
                selected={endDate}
                onChange={(date) => setDateRange([startDate, date])}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholderText="End date"
                dateFormat="MMM dd, yyyy"
                disabled={showClearButton}
              />
            </div>
            {!showClearButton ? (
              <button
                onClick={handleApplyDateRange}
                disabled={!startDate || !endDate}
                className={`px-4 py-2 rounded-md text-white ${
                  !startDate || !endDate 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark'
                } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
              >
                Apply Date Range
              </button>
            ) : (
              <button
                onClick={handleClearDateRange}
                className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear Date Range
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Total Bookings</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {analyticsData?.overallStats?.totalBookings || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Parking Bookings</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: '#9C27B0' }}>
              {analyticsData?.overallStats?.totalParking || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Seat Bookings</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: '#00BCD4' }}>
              {analyticsData?.overallStats?.totalSeats || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DailyTrendsChart data={analyticsData} />
          <MonthlyStatsChart data={analyticsData} dateRange={appliedDateRange} />
        </div>

        <div className="flex flex-col md:flex-row items-start">
          <div className="flex-1 h-[340px] mr-6">
            <FloorUsageChart
              bookings={floorUsageBookings}
              totalDesksPerFloor={dynamicTotalDesksPerFloor}
            />
          </div>
          <div className="self-start">
            <TeamColorPalette />
          </div>
        </div>
        <div className="mt-10">
          <BookingLookup
            searchType={searchType}
            setSearchType={setSearchType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            error={userError}
          />
          {loadingTeamStats && <div>Loading team stats...</div>}
          {teamStatsError && (
            <div className="mt-3 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-sm">
              {teamStatsError}
            </div>
          )}
          {teamStats && searchType === 'team' && (
            <div className="mt-6 mb-10">
              <TeamLookupTable
                teamData={teamStats}
                onMemberClick={(member) => {
                  setSearchType('username');
                  setSearchQuery(member.username);
                  fetchUserBookings();
                }}
              />
            </div>
          )}
          {userBookings && (
            <div className="mb-10">
              <UserBookingTable userBookings={userBookings} />
            </div>
          )}
          <RecentBookingsTable bookings={allBookings} />
          <button
            onClick={downloadExcel}
            className="fixed bottom-5 right-5 px-5 py-2 bg-green-500 text-white rounded-md shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 z-50"
          >
            Download Excel
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminViewReports;



