import axios from "axios";
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import useAuthGuard from "../components/AuthGuard";
import { toast } from "react-toastify";

import AdminHeader from "../components/AdminDashboard/AdminHeader";
import AnnouncementBox from "../components/AdminDashboard/AnnouncementBox";
import BookingChart from "../components/AdminDashboard/BookingChart";
import EventCalendar from "../components/AdminDashboard/EventCalendar";
import EventModal from "../components/AdminDashboard/EventModal";
import ProfileSummary from "../components/AdminDashboard/ProfileSummary";
import QuickStats from "../components/AdminDashboard/QuickStats";
import TodayTeamStats from "../components/AdminDashboard/TodayTeamStats";
import TeamColorPalette from "../components/shared/TeamColorPalette";

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
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/150?img=13");

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return alert("Please enter an announcement.");

    const token = localStorage.getItem("token"); // Get the token

    try {
      const res = await fetch("/api/notifications/send-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send token to backend
        },
        body: JSON.stringify({ message: announcement }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Announcement sent to all users!");
        setAnnouncement(""); // Clear the text area
      } else {
        toast.error(data?.message || "Failed to send announcement.");
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
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

  const topTeams = [...teamBookings].sort((a, b) => b.count - a.count).slice(0, 3);

  const fetchAllEvents = async () => {
    try {
      const res = await axios.get("/api/events");
      if (res.data.success) {
        setAllEvents(res.data.events);
        const dates = res.data.events.map((event) => event.date);
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

  const addEvent = async () => {
    if (!newEvent.title.trim()) return alert("Please enter a title");

    try {
      const formattedDate = formatDateToYMD(date);
      const res = await axios.post("/api/events", { ...newEvent, date: formattedDate });

      if (res.data.success) {
        alert("Event added!");
        setShowEventModal(false);
        setNewEvent({ title: "", description: "", time: "" });
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
        fetchAllEvents();
        fetchEventsForDate(date);
      } else {
        alert("Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Something went wrong");
    }
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

  const fetchTeamColors = async () => {
    try {
      const res = await axios.get("/api/teams");
      const colorMap = {};
      res.data.forEach((team) => {
        colorMap[team.teamName] = team.teamColor;
      });
      setTeamColors(colorMap);
    } catch (err) {
      console.error("Failed to load team colors", err);
    }
  };

  useEffect(() => {
    const fetchCoreData = async () => {
      await fetchTeamBookings();
      await fetchBookingCount();
      await fetchEventsForDate(date);
      await fetchTodayEvents();
    };

    fetchCoreData();
    fetchFloorBookingStats();  // One-time or infrequent
    fetchTeamColors();         // One-time or rarely needed

    const interval = setInterval(fetchCoreData, 10000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-64 flex-none">
        <AdminSidebar />
      </div>

      <div className="flex-1 bg-gray-100 overflow-y-auto p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <AdminHeader />
            <AnnouncementBox
              announcement={announcement}
              setAnnouncement={setAnnouncement}
              onSend={handleSendAnnouncement}
            />
            <TodayTeamStats topTeams={teamBookings} teamColors={teamColors} />
          </div>

          <div className="space-y-4">
            <EventCalendar
              date={date}
              setDate={setDate}
              eventDates={eventDates}
              todayEvents={todayEvents}
              onDayClick={(day) => {
                setDate(day);
                fetchEventsForDate(day);
                setShowEventModal(true);
              }}
            />
            <TeamColorPalette teamColors={teamColors} />
          </div>

          <div className="space-y-4">
            <ProfileSummary avatar={avatar} />
            <QuickStats todayBookingCount={todayBookingCount} />
            <BookingChart data={floorStats.filter(item => item.floor && item.floor.trim() !== '')} />
          </div>
        </div>
      </div>

      {showEventModal && (
        <EventModal
          date={date}
          events={events}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onClose={() => setShowEventModal(false)}
          onAdd={addEvent}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
