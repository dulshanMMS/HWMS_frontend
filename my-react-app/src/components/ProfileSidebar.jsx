import React, { useEffect, useState } from "react";
import { getProfile } from "../api/userApi";
import NotificationsList from "./profilesidebar/NotificationsList";
import ProfileGreeting from "./profilesidebar/ProfileGreeting";
import axios from "axios";

/**
 * ProfileSidebar component represents the right sidebar panel in the user dashboard.
 * It displays user profile info and notifications.
 *
 * Props:
 *  - isOpen (boolean): Controls whether sidebar is visible on mobile devices.
 */
const ProfileSidebar = ({ isOpen }) => {
  // Stores fetched user profile data (name, photo, etc.)
  const [userProfile, setUserProfile] = useState(null);

  // Stores the next upcoming booking (after today)
  const [nextUpcomingBooking, setNextUpcomingBooking] = useState(null);

  // Number of bookings for the current day
  const [todaysBookingCount, setTodaysBookingCount] = useState(0);

  // Array of bookings for today (used for display & notifications)
  const [todayBookings, setTodayBookings] = useState([]);

  // Array of user notifications fetched from backend
  const [userNotifications, setUserNotifications] = useState([]);

  // Fetch user profile and booking info on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Get user profile info from backend API
    getProfile(token)
      .then((data) => setUserProfile(data))
      .catch((err) =>
        console.error("Failed to load sidebar user profile:", err)
      );

    // Get all user bookings from backend API
    axios
      .get("http://localhost:6001/api/calendar/user-view", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const all = res.data || [];

        // Format today's date as 'YYYY-MM-DD' to compare with booking dates
        const todayStr = new Date(new Date().setDate(new Date().getDate()))
          .toISOString()
          .split("T")[0];

        // Filter bookings that occur today
        const todayFiltered = all.filter((b) => b.date === todayStr);
        setTodayBookings(todayFiltered);
        setTodaysBookingCount(todayFiltered.length);

        // Find upcoming bookings after today, sorted ascending by date
        const upcomingBookings = all
          .filter((b) => b.date > todayStr)
          .sort((a, b) => (a.date > b.date ? 1 : -1));

        // Set next upcoming booking or null if none
        setNextUpcomingBooking(
          upcomingBookings.length > 0 ? upcomingBookings[0] : null
        );

        console.log("Today's bookings count:", todayFiltered.length);
      })
      .catch((err) => console.error("Failed to load bookings:", err));
  }, []);

  // Fetch notifications for logged-in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:6001/api/notifications/user/own", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Extract notifications array safely or fallback to empty array
        const notifications = Array.isArray(res.data.notifications)
          ? res.data.notifications
          : [];

        setUserNotifications(notifications);

        if (notifications.length === 0) {
          console.warn("No notifications found in API response.");
        }
      })
      .catch((err) => console.error("Failed to load notifications:", err));
  }, []);

  // Do not render sidebar if it’s closed (mostly for mobile UX)
  if (!isOpen) return null;

  return (
    <aside className="h-full flex flex-col p-6 bg-white gap-y-6 overflow-y-auto">
      {/* Profile info header */}
      <ProfileGreeting userProfile={userProfile} />

      {/* Notifications list including booking reminders */}
      <NotificationsList
        todayBookings={todayBookings}
        upcomingBooking={nextUpcomingBooking}
        userNotifications={userNotifications}
      />
    </aside>
  );
};

export default ProfileSidebar;
