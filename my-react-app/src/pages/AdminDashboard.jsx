import React, { useState, useEffect } from "react";
import useAuthGuard from "../components/AuthGuard";
import AdminSidebar from "../components/AdminSidebar";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import avatar from '../assets/profile_photo.jpg';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from 'recharts';
import TeamColorPalette from "../components/TeamColorPalette";

const formatDateToYMD = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

const AdminDashboard = () => {
  useAuthGuard("admin");

  const [date, setDate] = useState(new Date());
  const [todayBookingCount, setTodayBookingCount] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [teamBookings, setTeamBookings] = useState([]);
  const [floorStats, setFloorStats] = useState([]);
  const [allEvents, setAllEvents] = useState([]); 
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", time: "" });
  const [todayEvents, setTodayEvents] = useState([]);
  const [eventDates, setEventDates] = useState([]);
  const [teamColors, setTeamColors] = useState({});

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return alert("Please enter an announcement.");
  
    try {
      const res = await fetch("/api/notifications/send-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: announcement }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Announcement sent to all users!");
        setAnnouncement(""); 
      } else {
        alert(data?.message || "Failed to send announcement.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  const fetchEventsForDate = async (selectedDate) => {
    try {
      const formattedDate = formatDateToYMD(selectedDate);
      const res = await axios.get(`/api/events/${formattedDate}`); 
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };
  //quick stat
  const fetchBookingCount = async () => {
    try {
      const res = await axios.get("/api/bookings/count/today");
      if (res.data.success) {
        setTodayBookingCount(res.data.count);
      }
    } catch (err) {
      console.error("Error fetching today's booking count:", err);
    }
  };
  //Today part
  const fetchTeamBookings = async () => {
    try {
      const res = await axios.get("/api/bookings/count-by-team/today");
      if (res.data.success) {
        setTeamBookings(res.data.teams); 
      }
    } catch (err) {
      console.error("Error fetching team-wise booking count:", err);
    }
  };

  const topTeams = [...teamBookings]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  //Event calendar
  const fetchAllEvents = async () => {
    try {
      const res = await axios.get(`/api/events`);
      if (res.data.success) {
        setAllEvents(res.data.events);

        const dates = res.data.events.map(event => event.date);
        setEventDates(dates);
      }
    } catch (err) {
      console.error("Error fetching all events:", err);
    }
  };

  const fetchTodayEvents = async () => {
    const today = formatDateToYMD(new Date());
    try {
      const res = await axios.get(`/api/events/${today}`);
      if (res.data.success) {
        setTodayEvents(res.data.events);
      }
    } catch (err) {
      console.error("Error fetching today's events:", err);
    }
  };

  const handleDayClick = (value) => {
    setDate(value);
    fetchEventsForDate(value);
    setShowEventModal(true);
  };

  const addEvent = async () => {
    if (!newEvent.title.trim()) return alert("Please enter a title");
  
    try {
      const formattedDate = formatDateToYMD(date);
      const res = await axios.post("/api/events", {
        ...newEvent,
        date: formattedDate
      });
  
      if (res.data.success) {
        alert("Event added!");
        setShowEventModal(false);
        setNewEvent({ title: "", description: "" });
        fetchAllEvents();
        fetchEventsForDate(date);
      }
    } catch (err) {
      console.error("Error adding event:", err);
      alert("Something went wrong");
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
  
    try {
      const res = await axios.delete(`/api/events/${eventId}`);
      if (res.data.success) {
        alert("Event deleted");
        fetchAllEvents();                // Refresh calendar highlights
        fetchEventsForDate(date);        // Refresh modal list
      } else {
        alert("Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Something went wrong");
    }
  };

  // Booking chart
  const fetchFloorBookingStats = async () => {
    try {
      const res = await axios.get("/api/bookings/count-by-floor");
      if (res.data.success) {
        setFloorStats(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching floor booking stats:", err);
    }
  };

  //Removes entries with empty floor values for the chart
  const filteredData = floorStats.filter(item => item.floor && item.floor.trim() !== '');

  const fetchTeamColors = async () => {
      try {
        const res = await axios.get('/api/teams');
        const colorMap = {};
        res.data.forEach(team => {
          colorMap[team.teamName] = team.teamColor;
        });
        setTeamColors(colorMap);
      } catch (err) {
        console.error("Failed to load team colors", err);
      }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchTeamBookings();
      await fetchBookingCount();
      await fetchEventsForDate(date);
      await fetchFloorBookingStats();
      await fetchAllEvents(); 
      await fetchTodayEvents(); 
      await fetchTeamColors();
    };
  
    fetchAllData(); 
  
    const interval = setInterval(() => {
      fetchAllData(); 
    }, 10000);
  
    return () => clearInterval(interval); 
  }, [date]);

  
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-64 flex-none">
        <AdminSidebar />
      </div>
      {/*Left Column*/}
      <div className="flex-1 bg-gray-100 overflow-y-auto p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-xl text-gray-600">Admin</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Announcement</label>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Type your announcement here..."
                className="w-full p-2 border rounded resize-none h-28 mb-2"
              />
              <div className="text-right mt-2">
                <button onClick={handleSendAnnouncement} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                  Send
                </button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold text-lg mb-2">Today</h2>
              <ul className="space-y-2">
                {topTeams.map((team, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${teamColors[team.name]}`}></span>
                      <span>{team.name}</span>
                    </div>
                    <span className="text-sm">{team.count}</span>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-4">
                <button className="text-green-600 font-medium">View All Bookings →</button>
              </div>
            </div>
          </div>
          {/*Middle Column*/}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Event Calendar</h2>
              <Calendar
                onClickDay={handleDayClick}
                value={date}
                tileClassName={({ date: tileDate }) => {
                  const today = new Date();
                  const isToday =
                    tileDate.getDate() === today.getDate() &&
                    tileDate.getMonth() === today.getMonth() &&
                    tileDate.getFullYear() === today.getFullYear();

                  const isEventDay = eventDates.includes(formatDateToYMD(tileDate));

                  if (isToday) return "bg-green-300 text-white rounded-full";
                  if (isEventDay) return "bg-yellow-200 font-semibold rounded-lg";
                  return null;
                }}
              />
              <div className="mt-4">
                <h3 className="font-semibold">Today's Events:</h3>
                {todayEvents.length > 0 ? (
                  <ul className="list-disc ml-4 text-sm mt-1">
                    {todayEvents.map((event, idx) => (
                      <li key={idx}>{event.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No special events today.</p>
                )}
              </div>
            </div>

            {/* Color Palette for Teams */}
            <TeamColorPalette teamColors={teamColors} />
          </div>
          {/*Right column*/}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
              <img
                src={avatar}
                alt="avatar"
                className="rounded-full w-12 h-12"
              />
              <div>
                <h3 className="font-semibold text-lg">Hello, Wiley!</h3>
                <button className="text-green-600 font-medium text-sm">Profile →</button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Quick Stats</h2>
              <p className="text-3xl font-bold text-black-600">
                {todayBookingCount !== null ? todayBookingCount : "Loading..."}
              </p>
              <button className="text-green-600 font-medium mt-2">View Reports →</button>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md h-[300px]">
              <h2 className="text-lg font-semibold mb-4">Bookings Count</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="floor">
                    <Label value="Floors" offset={-5} position="insideBottom" />
                  </XAxis>
                  <YAxis allowDecimals={false}>
                    <Label value="Booking Count" angle={-90} position="insideLeft" dy={30} />
                  </YAxis>
                  <Tooltip />
                  <Bar dataKey="count" fill="#166534" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/*Adding event box*/}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
          <h2 className="text-lg font-bold mb-2">Events on {date.toDateString()}</h2>

          {events.length > 0 ? (
            <ul className="text-sm list-disc ml-4 mb-4">
              {events.map((ev, idx) => (
                <li key={idx} className="flex justify-between items-start">
                  <div>
                    <strong>{ev.title}</strong> {ev.time && `at ${ev.time}`}
                    {ev.description && ` - ${ev.description}`}
                  </div>
                  <button
                    onClick={() => deleteEvent(ev._id)}
                    className="text-red-600 hover:underline ml-2 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mb-4">No events yet. Add one below!</p>
          )}

          <hr className="my-2" />
          <h3 className="font-semibold mb-1">Add New Event</h3>
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <textarea
              className="w-full p-2 border rounded resize-none"
              placeholder="Event Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            ></textarea>
            <div className="flex justify-between mt-4">
              <button onClick={() => setShowEventModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              <button onClick={addEvent} className="bg-blue-500 text-white px-4 py-2 rounded">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
