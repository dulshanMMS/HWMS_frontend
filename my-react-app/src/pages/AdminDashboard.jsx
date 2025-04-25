import React, { useState, useEffect } from "react";
import useAuthGuard from "../components/AuthGuard";
import AdminSidebar from "../components/AdminSidebar";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import avatar from '../assets/profile_photo.jpg';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from 'recharts';

const AdminDashboard = () => {
  useAuthGuard("admin");

  const [date, setDate] = useState(new Date());
  const [todayBookingCount, setTodayBookingCount] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [teamBookings, setTeamBookings] = useState([]);
  const [floorStats, setFloorStats] = useState([]);

  const teamColors = {
    "Team A": "bg-blue-400",
    "Team B": "bg-purple-400",
    "Team C": "bg-orange-400",
    "Team D": "bg-yellow-200",
    "Team E": "bg-green-400",
    "Team F": "bg-pink-400",
    "Team G": "bg-indigo-300",
    "Team H": "bg-red-400",
    "Team I": "bg-teal-400",
    "Team J": "bg-lime-400",
    "Team K": "bg-yellow-700",
    "Team L": "bg-stone-400",
    "Team M": "bg-red-600",
    "Team N": "bg-amber-400",
    "Team O": "bg-violet-600",
  };

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

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return alert("Please enter an announcement.");
  
    try {
      const res = await fetch("/api/notifications/send-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: announcement,
        }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Announcement sent to all users!");
        setAnnouncement(""); // Clear the input
      } else {
        alert(data?.message || "Failed to send announcement.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    fetchEventsForDate(newDate); // Fetch events on date change
  };

  const fetchEventsForDate = async (selectedDate) => {
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // format to YYYY-MM-DD
      const res = await axios.get(`/api/bookings/events/${formattedDate}`); 
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };


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

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchTeamBookings();
      await fetchBookingCount();
      await fetchEventsForDate(date);
      await fetchFloorBookingStats();
    };
  
    fetchAllData(); // Fetch initially
  
    const interval = setInterval(() => {
      fetchAllData(); // Refresh every 10s
    }, 10000);
  
    return () => clearInterval(interval); // Cleanup
  }, [date]);

console.log("todayBookingCount", todayBookingCount);
console.log("events", events);
console.log("date", date);

const topTeams = [...teamBookings]
  .sort((a, b) => b.count - a.count)
  .slice(0, 3);

const filteredData = floorStats.filter(item => item.floor && item.floor.trim() !== '');
  
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-64 flex-none">
        <AdminSidebar />
      </div>
      <div className="flex-1 bg-gray-100 overflow-y-auto p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-xl text-gray-600">Admin</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Announcement
              </label>
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
            <div className="bg-white p-4 rounded-lg shadow">
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

          {/* Middle Column */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Event Calendar</h2>
              <Calendar onChange={handleDateChange} value={date} />
              {events.length > 0 ? (
                <div className="mt-4">
                  <h3 className="font-semibold text-lg">Events for {date.toDateString()}</h3>
                  <ul className="space-y-2">
                    {events.map((event, idx) => (
                      <li key={idx} className="p-4 bg-white rounded-lg shadow">
                        <h4 className="font-semibold text-md">{event.title}</h4>
                        <p>{event.description}</p>
                        <p><strong>Time:</strong> {event.time}</p>
                        <p><strong>Status:</strong> {event.status}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-gray-600">No events for this day.</p>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Color Palette for teams</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "Team A", color: "bg-blue-400" },
                  { name: "Team B", color: "bg-purple-400" },
                  { name: "Team C", color: "bg-orange-400" },
                  { name: "Team D", color: "bg-yellow-200" },
                  { name: "Team E", color: "bg-green-400" },
                  { name: "Team F", color: "bg-pink-400" },
                  { name: "Team G", color: "bg-indigo-300" },
                  { name: "Team H", color: "bg-red-400" },
                  { name: "Team I", color: "bg-teal-400" },
                  { name: "Team J", color: "bg-lime-400" },
                  { name: "Team K", color: "bg-yellow-700" },
                  { name: "Team L", color: "bg-stone-400" },
                  { name: "Team M", color: "bg-red-600" },
                  { name: "Team N", color: "bg-amber-400" },
                  { name: "Team O", color: "bg-violet-600" },
                ].map((team, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className={`w-4 h-4 rounded-full ${team.color}`}></span>
                    <span>{team.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
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
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Quick Stats</h2>
              <p className="text-3xl font-bold text-black-600">
                {todayBookingCount !== null ? todayBookingCount : "Loading..."}
              </p>
              <button className="text-green-600 font-medium mt-2">View Reports →</button>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md h-[300px]">
              <h2 className="text-lg font-semibold mb-4">Bookings Count</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="floor">
                    <Label value="Floors" offset={-5} position="insideBottom" />
                  </XAxis>
                  <YAxis allowDecimals={false}>
                    <Label value="Booking Count" angle={-90} position="insideLeft" />
                  </YAxis>
                  <Tooltip />
                  <Bar dataKey="count" fill="#166534" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


