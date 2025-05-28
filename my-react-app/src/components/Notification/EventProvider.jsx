import React, { createContext, useState, useEffect } from 'react';

export const EventContext = createContext();

const EventProvider = ({ children }) => {
  const [date, setDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [eventDates, setEventDates] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);

  const fetchAllEvents = async () => {
    try {
      const res = await fetch(`/api/events`);
      const data = await res.json();
      if (data.success) {
        setAllEvents(data.events);
        const dates = data.events.map(event => event.date);
        setEventDates(dates);
      }
    } catch (err) {
      console.error('Error fetching all events:', err);
    }
  };

  const fetchEventsForDate = async (selectedDate) => {
    try {
      const formattedDate = formatDateToYMD(selectedDate);
      const res = await fetch(`/api/events/${formattedDate}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleDayClick = (value) => {
    setDate(value);
    fetchEventsForDate(value);
    setShowEventModal(true);
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  return (
    <EventContext.Provider
      value={{
        date,
        setDate,
        allEvents,
        eventDates,
        showEventModal,
        setShowEventModal,
        events,
        handleDayClick,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export default EventProvider;
