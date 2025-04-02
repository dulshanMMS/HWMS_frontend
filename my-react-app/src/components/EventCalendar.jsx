import React, { useState, useEffect } from 'react';
{/*import { Calendar, momentLocalizer } from 'react-big-calendar';*/}
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import '../styles/EventCalendar.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const localizer = momentLocalizer(moment);

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    description: '',
    type: 'meeting' // meeting, reminder, deadline
  });
  const [date, setDate] = useState(new Date());

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
        setEvents(data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        })));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      start: event.start,
      end: event.end,
      description: event.description,
      type: event.type
    });
    setShowEventModal(true);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setEventForm({
      title: '',
      start: new Date(),
      end: new Date(),
      description: '',
      type: 'meeting'
    });
    setShowEventModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = selectedEvent 
        ? `http://localhost:5000/api/events/${selectedEvent._id}`
        : 'http://localhost:5000/api/events';
      
      const response = await fetch(url, {
        method: selectedEvent ? 'PUT' : 'POST',
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

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/events/${selectedEvent._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchEvents();
        setShowEventModal(false);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Calendar</h2>
      <div className="calendar-wrapper">
        <Calendar
          onChange={setDate}
          value={date}
          className="w-full bg-white rounded-lg shadow-sm"
          tileClassName={({ date, view }) => 
            view === 'month' ? 'text-sm p-2 hover:bg-primary hover:text-white transition-colors duration-200' : ''
          }
          navigationLabel={({ date, label, locale, view }) => (
            <span className="text-gray-700 font-medium">{label}</span>
          )}
          prevLabel={<span className="text-primary">←</span>}
          nextLabel={<span className="text-primary">→</span>}
          minDetail="month"
        />
      </div>
      
      <style jsx>{`
        /* Custom styles for react-calendar that can't be handled by Tailwind */
        :global(.react-calendar) {
          border: none;
          font-family: inherit;
        }
        
        :global(.react-calendar__navigation) {
          margin-bottom: 1rem;
        }
        
        :global(.react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus) {
          background-color: #f3f4f6;
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
      `}</style>

      <div className="event-calendar">
        <div className="calendar-header">
          <h2>Event Calendar</h2>
          <button className="add-event-btn" onClick={handleCreateEvent}>
            <FaPlus /> Add Event
          </button>
        </div>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectEvent={handleEventSelect}
          eventPropGetter={(event) => ({
            className: `event-${event.type}`
          })}
        />

        {showEventModal && (
          <div className="event-modal-overlay">
            <div className="event-modal">
              <h3>{selectedEvent ? 'Edit Event' : 'Create Event'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={moment(eventForm.start).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => setEventForm({...eventForm, start: new Date(e.target.value)})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={moment(eventForm.end).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => setEventForm({...eventForm, end: new Date(e.target.value)})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                  >
                    <option value="meeting">Meeting</option>
                    <option value="reminder">Reminder</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    rows="3"
                  />
                </div>

                <div className="modal-actions">
                  {selectedEvent && (
                    <button type="button" className="delete-btn" onClick={handleDelete}>
                      <FaTrash /> Delete
                    </button>
                  )}
                  <button type="button" className="cancel-btn" onClick={() => setShowEventModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <FaEdit /> {selectedEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendar; 