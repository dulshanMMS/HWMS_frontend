import { useState, useEffect } from 'react';
import api from '../../config/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const BookingPrediction = () => {
  const [timePeriod, setTimePeriod] = useState('month');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timePeriods = [
    { value: 'week', label: 'Past 1 Week' },
    { value: 'month', label: 'Past 1 Month' },
    { value: '3months', label: 'Past 3 Months' }
  ];

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Fetch predictions for the selected day with retry logic
  useEffect(() => {
    fetchPredictions();
  }, [timePeriod, dayOfWeek]);

  const fetchPredictions = async (retries = 3, delay = 1000) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/reports/predictions', {
        params: { timePeriod, dayOfWeek }
      });
      console.log('API Response:', response.data); // Debug API response
      setPredictions(response.data);
    } catch (err) {
      if (retries > 0 && (err.message === 'Network Error' || err.code === 'ECONNABORTED')) {
        console.log(`Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchPredictions(retries - 1, delay * 2);
      }
      setError(`Failed to fetch predictions: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for pie charts
  const getPieChartData = (data, type) => {
    const floorData = data?.[type] || [];
    const labels = floorData.map(item => `Floor ${item.floor}`);
    const counts = floorData.map(item => item.count);
    const colors = [
      'rgba(147, 51, 234, 0.6)', // Purple-600
      'rgba(192, 132, 252, 0.6)', // Purple-400
      'rgba(237, 233, 254, 0.6)', // Purple-100
      'rgba(103, 232, 249, 0.6)', // Cyan-300
      'rgba(34, 211, 238, 0.6)', // Cyan-400
    ];

    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color.replace('0.6', '1')),
          borderWidth: 1,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: 'Arial, sans-serif',
          },
          color: '#374151', // Gray-700
        },
      },
      tooltip: {
        backgroundColor: 'rgba(107, 33, 168, 0.8)', // Purple-800
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-3xl font-bold text-gray-900 mb-4 mt-6 ml-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 animate-bounce-cute">
        Booking Predictions for {dayOfWeek} (Based on {timePeriods.find(t => t.value === timePeriod)?.label})
      </h3>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 animate-scale-in">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="w-full border border-purple-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-purple-50"
          >
            {timePeriods.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full border border-purple-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-purple-50"
          >
            {daysOfWeek.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </div>
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 animate-pulse-cute"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}
      {predictions && (
        <div className="animate-fade-in">
          <h4 className="text-md font-medium text-gray-700 mb-2">
            <span className="text-purple-600 font-bold animate-glow-cute">Predicted</span> Bookings
          </h4>
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <table className="w-full text-sm text-left text-gray-700">
              <thead>
                <tr className="bg-purple-100 rounded-t-lg">
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Total Bookings', count: predictions.predictions.totalBookings },
                  { type: 'Seat Bookings', count: predictions.predictions.seatBookings },
                  { type: 'Parking Bookings', count: predictions.predictions.parkingBookings }
                ].map(({ type, count }, index) => (
                  <tr
                    key={type}
                    className="hover:bg-purple-100 hover:scale-105 transition-all duration-300 rounded-lg"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="p-3">{type}</td>
                    <td className="p-3 text-right">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">
                <span className="text-purple-600 font-bold animate-glow-cute">Seating</span> Bookings
              </h4>
              {predictions.predictions.seatBookingsByFloor?.length > 0 ? (
                <div className="h-64">
                  <Pie
                    data={getPieChartData(predictions.predictions, 'seatBookingsByFloor')}
                    options={chartOptions}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">No seating booking data available</p>
              )}
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">
                <span className="text-purple-600 font-bold animate-glow-cute">Parking</span> Bookings
              </h4>
              {predictions.predictions.parkingBookingsByFloor?.length > 0 ? (
                <div className="h-64">
                  <Pie
                    data={getPieChartData(predictions.predictions, 'parkingBookingsByFloor')}
                    options={chartOptions}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">No parking booking data available</p>
              )}
            </div>
          </div>
        </div>
      )}
      <style>
        {`
          @keyframes bounce-cute {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }
          .animate-bounce-cute {
            animation: bounce-cute 1.5s ease-in-out infinite;
          }

          @keyframes scale-in {
            0% {
              transform: scale(0.95);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-scale-in {
            animation: scale-in 0.5s ease-out forwards;
          }

          @keyframes fade-in {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }

          @keyframes pulse-cute {
            0%, 100% {
              transform: scale(1);
              border-color: rgba(168, 85, 247, 0.5);
            }
            50% {
              transform: scale(1.2);
              border-color: rgba(168, 85, 247, 0.8);
            }
          }
          .animate-pulse-cute {
            animation: pulse-cute 1s ease-in-out infinite;
          }

          @keyframes glow-cute {
            0%, 100% {
              text-shadow: 0 0 2px rgba(147, 51, 234, 0.5);
            }
            50% {
              text-shadow: 0 0 8px rgba(147, 51, 234, 0.8);
            }
          }
          .animate-glow-cute {
            animation: glow-cute 1.5s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default BookingPrediction;