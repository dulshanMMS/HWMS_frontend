

import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendar } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { X } from 'lucide-react';

import AdminSidebar from '../components/AdminSidebar';
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

const AdminViewReports = () => {
  useAuthGuard('admin');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showClearButton, setShowClearButton] = useState(false);
  const [searchType, setSearchType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [userError, setUserError] = useState(null);
  const [userBookings, setUserBookings] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [teamStatsError, setTeamStatsError] = useState(null);
  const [loadingTeamStats, setLoadingTeamStats] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

 
const handleSearch = async (overrideQuery) => {
  const query = overrideQuery || searchQuery.trim();
  if (!query) {
    setUserError('Please enter a search term');
    return;
  }
  if (searchType === 'team') {
    setLoadingTeamStats(true);
    setTeamStats(null);
    setTeamStatsError(null);
    try {
      const [appliedStart, appliedEnd] = appliedDateRange;
      const res = await api.get('/api/reports/team-stats', {
        params: {
          teamName: query,
          startDate: appliedStart?.toISOString(),
          endDate: appliedEnd?.toISOString(),
        },
      });
      setTeamStats(res.data);
    } catch (err) {
      console.error('Error fetching team stats:', err);
      setTeamStatsError(`Failed to fetch team stats: ${err.message}`);
    } finally {
      setLoadingTeamStats(false);
    }
  } else if (searchType === 'name') {
    fetchUserBookings(query);
  }
};

const fetchUserBookings = async (query) => {
  if (!query) {
    setUserError('Please enter a search term');
    return;
  }
  try {
    setUserLoading(true);
    setUserError(null);
    setUserBookings(null);
    console.log('Fetching user bookings for:', query);
    const response = await api.get('/api/reports/user-lookup', {
      params: { name: query },
    });
    console.log('User bookings response:', response.data);
    setUserBookings(response.data);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    setUserError(`Error: Failed to fetch bookings: ${err.message}`);
  } finally {
    setUserLoading(false);
  }
};

  const handleClearSearch = () => {
    setSearchQuery('');
    setUserBookings(null);
    setTeamStats(null);
    setUserError(null);
    setTeamStatsError(null);
  };

  



const fetchAllBookings = async () => {
  try {
    const response = await api.get('/api/reports/all-bookings');
    setAllBookings(response.data);
  } catch (err) {
    console.error('Error fetching all bookings:', err);
    setError('Failed to fetch recent bookings. Please try again later.');
    setAllBookings([]);
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

    // Info Sheet
    const infoSheetData = [
      ['Downloaded At', now.toLocaleString()],
      ['Date Range Applied', appliedStart && appliedEnd
        ? `${appliedStart.toLocaleDateString()} to ${appliedEnd.toLocaleDateString()}`
        : 'No date range applied'],
      ['Search Type', searchType || 'N/A'],
      ['Search Query', searchQuery || 'N/A'],
    ];
    const infoSheet = XLSX.utils.aoa_to_sheet(infoSheetData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info');

    // Summary Sheet
    const summarySheetData = [
      ['Total Bookings', analyticsData?.overallStats?.totalBookings || 0],
      ['Parking Bookings', analyticsData?.overallStats?.totalParking || 0],
      ['Seat Bookings', analyticsData?.overallStats?.totalSeats || 0],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Daily Trends Sheet
    const dailyTrendsSheetData = [
      ['Date', 'Seat Bookings', 'Parking Bookings'],
      ...(analyticsData?.dailyTrends || []).map(d => [
        new Date(d._id.date).toLocaleDateString(),
        d.seatsCount || 0,
        d.parkingCount || 0
      ])
    ];
    const dailySheet = XLSX.utils.aoa_to_sheet(dailyTrendsSheetData);
    XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Trends');

    // Monthly Stats Sheet
    const monthlyStatsSheetData = [
      ['Month', 'Seat Bookings', 'Parking Bookings'],
      ...(analyticsData?.monthlyStats || []).map(m => [
        m._id.month,
        m.seatsCount || 0,
        m.parkingCount || 0
      ])
    ];
    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyStatsSheetData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Stats');

    // All Bookings Sheet
    const allBookingsSheetData = [
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
      ...allBookings.map(b => [
        b.user?.username || 'N/A',
        b.user?.fullName || 'N/A',
        b.team || 'No Team',
        b.type,
        new Date(b.date).toLocaleDateString(),
        b.entryTime || 'N/A',
        b.exitTime || 'N/A',
        b.slot?.slotNumber || 'N/A',
        b.slot?.floor || 'N/A'
      ])
    ];
    const allBookingsSheet = XLSX.utils.aoa_to_sheet(allBookingsSheetData);
    XLSX.utils.book_append_sheet(workbook, allBookingsSheet, 'All Bookings');

    // Floor Usage Sheet
    const floorUsageBookings = getFloorUsageBookings();
    const floorUsageSheetData = [
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
      ...floorUsageBookings.map(b => [
        b.user?.username || 'N/A',
        b.user?.fullName || 'N/A',
        b.team || 'No Team',
        b.type,
        new Date(b.date).toLocaleDateString(),
        b.entryTime || 'N/A',
        b.exitTime || 'N/A',
        b.slot?.slotNumber || 'N/A',
        b.slot?.floor || 'N/A'
      ])
    ];
    const floorUsageSheet = XLSX.utils.aoa_to_sheet(floorUsageSheetData);
    XLSX.utils.book_append_sheet(workbook, floorUsageSheet, 'Floor Usage');

    // User Booking Lookup Sheet
    if (userBookings) {
      const lookupSheetData = [
        ['Username', userBookings.user?.username || 'N/A'],
        ['Full Name', userBookings.user?.name || 'N/A'],
        ['Team', userBookings.user?.team || 'N/A'],
        ['Total Seat Bookings', userBookings.seatCount || 0],
        ['Total Parking Bookings', userBookings.parkingCount || 0],
        ['Total Bookings', (userBookings.seatCount || 0) + (userBookings.parkingCount || 0)],
        [],
        ['Date', 'Entry Time', 'Exit Time', 'Type', 'Slot Number', 'Floor']
      ];

      (userBookings.bookings || []).forEach(b => {
        lookupSheetData.push([
          new Date(b.date).toLocaleDateString(),
          b.entryTime || 'N/A',
          b.exitTime || 'N/A',
          b.type,
          b.slotNumber || 'N/A',
          b.floor || 'N/A'
        ]);
      });

      const lookupSheet = XLSX.utils.aoa_to_sheet(lookupSheetData);
      XLSX.utils.book_append_sheet(workbook, lookupSheet, 'Booking Lookup');
    }

    // Team Stats Sheet
    if (teamStats) {
      const teamStatsSheetData = [
        ['Team Name', teamStats.team.name || 'N/A'],
        ['Total Members', teamStats.members?.length || 0],
        ['Total Seat Bookings', teamStats.team.totalSeatBookings || 0],
        ['Total Parking Bookings', teamStats.team.totalParkingBookings || 0],
        ['Total Bookings', (teamStats.team.totalSeatBookings || 0) + (teamStats.team.totalParkingBookings || 0)],
        [],
        ['Username', 'Full Name', 'Seat Bookings', 'Parking Bookings']
      ];

      (teamStats.members || []).forEach(member => {
        teamStatsSheetData.push([
          member.username || 'N/A',
          member.name || 'N/A',
          member.seatCount || 0,
          member.parkingCount || 0
        ]);
      });

      const teamStatsSheet = XLSX.utils.aoa_to_sheet(teamStatsSheetData);
      XLSX.utils.book_append_sheet(workbook, teamStatsSheet, 'Team Stats');
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `AdminViewReports_${now.toISOString().slice(0, 10)}.xlsx`);
    setIsModalOpen(false);
  };

  const downloadCSV = () => {
    const now = new Date();
    const [appliedStart, appliedEnd] = appliedDateRange;

    // Combine all relevant data into a single CSV
    const csvData = [];

    // Summary
    csvData.push(['Summary']);
    csvData.push(['Total Bookings', analyticsData?.overallStats?.totalBookings || 0]);
    csvData.push(['Parking Bookings', analyticsData?.overallStats?.totalParking || 0]);
    csvData.push(['Seat Bookings', analyticsData?.overallStats?.totalSeats || 0]);
    csvData.push([]);

    // Daily Trends
    csvData.push(['Daily Trends']);
    csvData.push(['Date', 'Seat Bookings', 'Parking Bookings']);
    (analyticsData?.dailyTrends || []).forEach(d => {
      csvData.push([
        new Date(d._id.date).toLocaleDateString(),
        d.seatsCount || 0,
        d.parkingCount || 0
      ]);
    });
    csvData.push([]);

    // Monthly Stats
    csvData.push(['Monthly Stats']);
    csvData.push(['Month', 'Seat Bookings', 'Parking Bookings']);
    (analyticsData?.monthlyStats || []).forEach(m => {
      csvData.push([
        m._id.month,
        m.seatsCount || 0,
        m.parkingCount || 0
      ]);
    });
    csvData.push([]);

    // All Bookings
    csvData.push(['All Bookings']);
    csvData.push([
      'Username',
      'Full Name',
      'Team',
      'Booking Type',
      'Date',
      'Entry Time',
      'Exit Time',
      'Slot Number',
      'Floor'
    ]);
    allBookings.forEach(b => {
      csvData.push([
        b.user?.username || 'N/A',
        b.user?.fullName || 'N/A',
        b.team || 'No Team',
        b.type,
        new Date(b.date).toLocaleDateString(),
        b.entryTime || 'N/A',
        b.exitTime || 'N/A',
        b.slot?.slotNumber || 'N/A',
        b.slot?.floor || 'N/A'
      ]);
    });
    csvData.push([]);

    // Floor Usage
    const floorUsageBookings = getFloorUsageBookings();
    csvData.push(['Floor Usage']);
    csvData.push([
      'Username',
      'Full Name',
      'Team',
      'Booking Type',
      'Date',
      'Entry Time',
      'Exit Time',
      'Slot Number',
      'Floor'
    ]);
    floorUsageBookings.forEach(b => {
      csvData.push([
        b.user?.username || 'N/A',
        b.user?.fullName || 'N/A',
        b.team || 'No Team',
        b.type,
        new Date(b.date).toLocaleDateString(),
        b.entryTime || 'N/A',
        b.exitTime || 'N/A',
        b.slot?.slotNumber || 'N/A',
        b.slot?.floor || 'N/A'
      ]);
    });
    csvData.push([]);

    // User Booking Lookup
    if (userBookings) {
      csvData.push(['Booking Lookup']);
      csvData.push(['Username', userBookings.user?.username || 'N/A']);
      csvData.push(['Full Name', userBookings.user?.name || 'N/A']);
      csvData.push(['Team', userBookings.user?.team || 'N/A']);
      csvData.push(['Total Seat Bookings', userBookings.seatCount || 0]);
      csvData.push(['Total Parking Bookings', userBookings.parkingCount || 0]);
      csvData.push(['Total Bookings', (userBookings.seatCount || 0) + (userBookings.parkingCount || 0)]);
      csvData.push([]);
      csvData.push(['Date', 'Entry Time', 'Exit Time', 'Type', 'Slot Number', 'Floor']);
      (userBookings.bookings || []).forEach(b => {
        csvData.push([
          new Date(b.date).toLocaleDateString(),
          b.entryTime || 'N/A',
          b.exitTime || 'N/A',
          b.type,
          b.slotNumber || 'N/A',
          b.floor || 'N/A'
        ]);
      });
      csvData.push([]);
    }

    // Team Stats
    if (teamStats) {
      csvData.push(['Team Stats']);
      csvData.push(['Team Name', teamStats.team.name || 'N/A']);
      csvData.push(['Total Members', teamStats.members?.length || 0]);
      csvData.push(['Total Seat Bookings', teamStats.team.totalSeatBookings || 0]);
      csvData.push(['Total Parking Bookings', teamStats.team.totalParkingBookings || 0]);
      csvData.push(['Total Bookings', (teamStats.team.totalSeatBookings || 0) + (teamStats.team.totalParkingBookings || 0)]);
      csvData.push([]);
      csvData.push(['Username', 'Full Name', 'Seat Bookings', 'Parking Bookings']);
      (teamStats.members || []).forEach(member => {
        csvData.push([
          member.username || 'N/A',
          member.name || 'N/A',
          member.seatCount || 0,
          member.parkingCount || 0
        ]);
      });
    }

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(csvBlob, `AdminViewReports_${now.toISOString().slice(0, 10)}.csv`);
    setIsModalOpen(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-6 ml-8">Analytics & Reports</h1>
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
  onClear={handleClearSearch}
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
              <TeamLookupTable teamData={teamStats} />
            </div>
          )}
          {userBookings && (
            <div className="mb-10">
              <UserBookingTable userBookings={userBookings} />
            </div>
          )}
          <RecentBookingsTable bookings={allBookings} />
          <div className="relative">
            <button
              onClick={() => setIsModalOpen(true)}
              className="fixed bottom-5 right-5 px-5 py-2 bg-indigo-500 text-white rounded-md shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 z-50"
            >
              Download
            </button>

            {isModalOpen && (
              <div className="fixed bottom-20 right-5 z-50">
                <div 
                  className="bg-white rounded-lg p-6 w-80 shadow-xl transform transition-all duration-300 ease-in-out scale-0 opacity-0"
                  style={{ animation: isModalOpen ? 'modalFadeIn 0.3s forwards' : 'modalFadeOut 0.3s forwards' }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Download Options</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={downloadExcel}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Download Excel
                    </button>
                    <button
                      onClick={downloadCSV}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminSidebar>
      <div>
        {renderContent()}
      </div>
    </AdminSidebar>
  );
};

export default AdminViewReports;