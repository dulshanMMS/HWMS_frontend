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
import ProfileGreeting from "../components/profilesidebar/ProfileGreeting";
import { getProfile } from "../api/userApi";
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
  const [allEvents, setAllEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", time: "" });
  const [todayEvents, setTodayEvents] = useState([]);
  const [eventDates, setEventDates] = useState([]);
  const [teamColors, setTeamColors] = useState({});
  const [parkingStats, setParkingStats] = useState([]);
  const [seatingStats, setSeatingStats] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return toast.warning("Please enter an announcement.");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/notifications/send-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: announcement }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("📢 Announcement sent!");
        setAnnouncement("");
      } else {
        toast.error(data?.message || "Failed to send announcement.");
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
      toast.error("Something went wrong!");
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

  const addEvent = async () => {
    if (!newEvent.title.trim()) return toast.warning("Please enter a title");

    try {
      const formattedDate = formatDateToYMD(date);
      const res = await axios.post("/api/events", { ...newEvent, date: formattedDate });

      if (res.data.success) {
        toast.success("✅ Event added!");
        setShowEventModal(false);
        setNewEvent({ title: "", description: "", time: "" });

        // Refresh events
        const updated = await axios.get("/api/events");
        if (updated.data.success) {
          const updatedEvents = updated.data.events;
          setAllEvents(updatedEvents);
          setEventDates(updatedEvents.map(e => e.date));
          setEvents(updatedEvents.filter(e => e.date === formattedDate));
          setTodayEvents(updatedEvents.filter(e => e.date === formatDateToYMD(new Date())));
        }
      } else {
        toast.error("❌ Failed to add event.");
      }
    } catch (err) {
      console.error("Error adding event:", err);
      toast.error("Something went wrong while adding event.");
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await axios.delete(`/api/events/${eventId}`);
      if (res.data.success) {
        toast.success("🗑️ Event deleted");

        const updated = await axios.get("/api/events");
        if (updated.data.success) {
          const updatedEvents = updated.data.events;
          setAllEvents(updatedEvents);
          setEventDates(updatedEvents.map(e => e.date));
          setEvents(updatedEvents.filter(e => e.date === formatDateToYMD(date)));
          setTodayEvents(updatedEvents.filter(e => e.date === formatDateToYMD(new Date())));
        }
      } else {
        toast.error("❌ Failed to delete event.");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Something went wrong while deleting event.");
    }
  };

  useEffect(() => {
    const fetchCoreData = async () => {
      try {
        const [
          teamBookingRes,
          bookingCountRes,
          allEventRes,
          floorStatsRes,
          teamColorsRes
        ] = await Promise.all([
          axios.get("/api/bookings/count-by-team/today"),
          axios.get("/api/bookings/count/today"),
          axios.get("/api/events"),
          axios.get("/api/bookings/count-by-floor"),
          axios.get("/api/teams"),
        ]);

        if (teamBookingRes.data.success) setTeamBookings(teamBookingRes.data.teams);
        if (bookingCountRes.data.success) setTodayBookingCount(bookingCountRes.data.count);

        if (allEventRes.data.success) {
          const allEvents = allEventRes.data.events;
          setAllEvents(allEvents);
          setEventDates(allEvents.map(e => e.date));

          const todayStr = formatDateToYMD(new Date());
          setTodayEvents(allEvents.filter(e => e.date === todayStr));
          setEvents(allEvents.filter(e => e.date === formatDateToYMD(date)));
        }

        if (floorStatsRes.data.success) {
          setParkingStats(floorStatsRes.data.parking);
          setSeatingStats(floorStatsRes.data.seating);
        }

        const colorMap = {};
        teamColorsRes.data.forEach(team => {
          colorMap[team.teamName] = team.teamColor;
        });
        setTeamColors(colorMap);

        const token = localStorage.getItem("token");
        if (token) {
          const profile = await getProfile(token);
          setUserProfile({
            firstName: profile.firstName || "User",
            profilePhoto: profile.profileImage || null,
          });
        }
      } catch (err) {
        console.error("❌ Error fetching dashboard data:", err);
      }
    };

    fetchCoreData();
    const interval = setInterval(fetchCoreData, 30000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <AdminSidebar>
      <div className="bg-gray-100 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="space-y-4 order-3 md:order-3 xl:order-1">
            <AdminHeader />
            <AnnouncementBox
              announcement={announcement}
              setAnnouncement={setAnnouncement}
              onSend={handleSendAnnouncement}
            />
            <TodayTeamStats topTeams={teamBookings} />
          </div>

          <div className="space-y-4 order-2 md:order-2 xl:order-2">
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

          <div className="space-y-4 order-1 md:order-1 xl:order-3">
            <div className="relative bg-white rounded-xl shadow-md p-6 w-full max-w-md mx-auto">
              <ProfileGreeting userProfile={userProfile} />
            </div>
            <QuickStats todayBookingCount={todayBookingCount} />
            <BookingChart parkingData={parkingStats} seatingData={seatingStats} />
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
    </AdminSidebar>
  );
};

export default AdminDashboard;
