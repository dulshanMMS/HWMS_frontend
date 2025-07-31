import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosInstance";
import AdminSidebar from "../components/AdminSidebar";
import useAuthGuard from "../components/AuthGuard";
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
import MessageDrawer from "../components/AdminDashboard/MessageDrawer";

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessageBox, setShowMessageBox] = useState(false);

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return toast.warning("Please enter an announcement.");
    try {
      const res = await api.post("/announcements", { message: announcement });
      if (res.data) {
        toast.success("📢 Announcement sent!");
        setAnnouncement("");
      }
    } catch (error) {
      toast.error("❌ Failed to send announcement.");
    }
  };

  const fetchCoreData = async () => {
    try {
      const [teamBookingRes, bookingCountRes, allEventRes, floorStatsRes, teamColorsRes] = await Promise.all([
        api.get("/bookings/count-by-team/today"),
        api.get("/bookings/count/today"),
        api.get("/events"),
        api.get("/bookings/count-by-floor"),
        api.get("/teams"),
      ]);

      if (teamBookingRes.data.success) setTeamBookings(teamBookingRes.data.teams);
      if (bookingCountRes.data.success) setTodayBookingCount(bookingCountRes.data.count);

      const allEv = allEventRes.data.events;
      const todayStr = formatDateToYMD(new Date());
      setAllEvents(allEv);
      setEventDates(allEv.map(e => e.date));
      setTodayEvents(allEv.filter(e => e.date === todayStr));
      setEvents(allEv.filter(e => e.date === formatDateToYMD(date)));

      setParkingStats(floorStatsRes.data.parking);
      setSeatingStats(floorStatsRes.data.seating);

      const colorMap = {};
      teamColorsRes.data.forEach(team => colorMap[team.teamName] = team.teamColor);
      setTeamColors(colorMap);

      const token = localStorage.getItem("token");
      if (token) {
        const profile = await getProfile(token);
        setUserProfile({ firstName: profile.firstName || "Admin", profilePhoto: profile.profileImage || null });

        const msgRes = await api.get("/support/grouped");
        const allRequests = msgRes.data.groupedRequests.flatMap(group => group.requests);
        const unread = allRequests.filter(r => r.status === "pending");
        setUnreadCount(unread.length);
      }
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
    }
  };

  const addEvent = async () => {
    if (!newEvent.title.trim()) return toast.warning("Please enter a title");

    try {
      const formattedDate = formatDateToYMD(date);
      const res = await api.post("/events", { ...newEvent, date: formattedDate });

      if (res.data.success) {
        toast.success("✅ Event added!");
        setShowEventModal(false);
        setNewEvent({ title: "", description: "", time: "" });
        fetchCoreData();
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
      const res = await api.delete(`/events/${eventId}`);
      if (res.data.success) {
        toast.success("🗑️ Event deleted");
        fetchCoreData();
      } else {
        toast.error("❌ Failed to delete event.");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Something went wrong while deleting event.");
    }
  };

  useEffect(() => {
    fetchCoreData();
    const interval = setInterval(fetchCoreData, 30000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <AdminSidebar>
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 min-h-screen">
        <div className="mb-6 animate-fade-in">
          <AdminHeader userProfile={userProfile} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <div className="space-y-6 order-3 md:order-3 xl:order-1">
            <BookingChart />
            <TodayTeamStats topTeams={teamBookings} />
                             
          </div>

          <div className="space-y-6 order-2 md:order-2 xl:order-2">
            <EventCalendar
              date={date}
              setDate={setDate}
              eventDates={eventDates}
              todayEvents={todayEvents}
              onDayClick={(day) => {
                setDate(day);
                setShowEventModal(true);
              }}
            />
            <AnnouncementBox announcement={announcement} setAnnouncement={setAnnouncement} onSend={handleSendAnnouncement} />
          </div>

          <div className="space-y-6 order-1 md:order-1 xl:order-3">
            <div className="bg-white rounded-2xl shadow-xl p-6 animate-slide-up">
              <ProfileGreeting userProfile={userProfile} />             
            </div>
            <QuickStats todayBookingCount={todayBookingCount} />
            <TeamColorPalette teamColors={teamColors} />
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

        {showMessageBox && (
          <MessageDrawer
            onClose={() => setShowMessageBox(false)}
            setUnreadCount={setUnreadCount}
          />
        )}

        <div
          className="fixed bottom-6 right-6 z-50 cursor-pointer group"
          onClick={() => setShowMessageBox(!showMessageBox)}
        >
          <div className="relative bg-green-700 shadow-2xl hover:scale-105 hover:bg-green-900 transition-all duration-300 ease-in-out p-4 rounded-full ring-2 ring-green-600 ring-offset-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-white group-hover:text-white transition duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {!showMessageBox ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              )}
            </svg>

            {unreadCount > 0 && !showMessageBox && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse shadow-md">
                {unreadCount}
              </span>
            )}

            {/* <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm bg-green-900 text-white px-3 py-1 rounded-lg shadow">
              {showMessageBox ? "Close Messages" : "Open Messages"}
            </div> */}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminDashboard;
