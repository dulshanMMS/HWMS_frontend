import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaPlus, FaTimes, FaCalendar, FaFilter } from 'react-icons/fa';
import moment from 'moment';

const EventCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: new Date(),
    description: '',
    type: 'meeting'
  });
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'booking', title: 'Booking Reminder', message: 'Lorem ipsum dolor sit amet, consetetur' },
    { id: 2, type: 'message', title: 'New Message', message: 'Lorem ipsum dolor sit amet, consetetur' },
    { id: 3, type: 'booking', title: 'Upcoming Booking', message: 'Lorem ipsum dolor sit amet, consetetur' }
  ]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  const handleCreateEvent = () => {
    setEventForm({
      title: '',
      date: date,
      description: '',
      type: 'meeting'
    });
    setShowEventModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventForm)
      });

      if (response.ok) {
        fetchEvents();
        setShowEventModal(false);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const hasEvents = (date) => {
    return events.some(event => 
      moment(event.date).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')
    );
  };

  return (
    <div className="w-full max-w-md">
      {/* Event Calendar Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <FaCalendar className="text-gray-500" />
            <input
              type="text"
              placeholder="Select date range"
              className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <FaFilter />
            </button>
          </div>
        </div>

        <div className="p-4">
          <Calendar
            onChange={setDate}
            value={date}
            className="w-full"
            tileClassName={({ date }) => 
              hasEvents(date) 
                ? 'has-events'
                : ''
            }
          />
        </div>
      </div>

      {/* Event List Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          <button
            onClick={() => {}}
            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
          >
            View All Notifications
            <span className="text-lg">→</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-full ${
                notification.type === 'booking' 
                  ? 'bg-red-100' 
                  : 'bg-yellow-100'
              }`}>
                {notification.type === 'booking' ? '!' : '✉'}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                <p className="text-sm text-gray-500">{notification.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Event Button - Fixed Position */}
      <button
        onClick={handleCreateEvent}
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
      >
        <FaPlus className="w-5 h-5" />
      </button>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Add Event</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={moment(eventForm.date).format('YYYY-MM-DD')}
                  onChange={(e) => setEventForm({...eventForm, date: new Date(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Custom styles for react-calendar */
        :global(.react-calendar) {
          border: none;
          font-family: inherit;
          width: 100%;
        }
        
        :global(.react-calendar__tile.has-events) {
          position: relative;
          font-weight: bold;
        }
        
        :global(.react-calendar__tile.has-events::after) {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background-color: #052E19;
          border-radius: 50%;
        }
        
        :global(.react-calendar__tile--now) {
          background: #e5e7eb;
        }
        
        :global(.react-calendar__tile--active) {
          background: #052E19 !important;
          color: white;
        }
        
        :global(.react-calendar__tile--active:enabled:hover,
                .react-calendar__tile--active:enabled:focus) {
          background: #052E19;
        }
        
        :global(.react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus) {
          background-color: #f3f4f6;
        }

        :global(.react-calendar__navigation button) {
          font-size: 1.2em;
          color: #374151;
        }

        :global(.react-calendar__month-view__weekdays) {
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.75em;
          color: #6B7280;
        }

        :global(.react-calendar__month-view__days__day--weekend) {
          color: #EF4444;
        }
      `}</style>
    </div>
  );
};

export default EventCalendar; 