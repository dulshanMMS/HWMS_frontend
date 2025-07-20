import React from "react";
import { FiChevronRight } from "react-icons/fi";
import { FaCar, FaChair, FaMapMarkerAlt } from "react-icons/fa";
import NotificationItem from "./NotificationItem";

/**
 * NotificationsList renders notification sections including:
 * - Booking reminders for today's bookings
 * - New messages
 * - Upcoming booking details
 *
 * Props:
 * - todayBookings (array): bookings for the current day
 * - upcomingBooking (object|null): next upcoming booking info
 * - userNotifications (array): general notifications/messages
 */
const NotificationsList = ({
  todayBookings = [],
  upcomingBooking = null,
  userNotifications = [],
}) => {
  // Ensure userNotifications is an array (fallback to empty array)
  const safeUserNotifications = Array.isArray(userNotifications)
    ? userNotifications
    : [];

  // Count of today's bookings for display
  const count = todayBookings.length;

  // Example of other notifications (currently only "New Message")
  const otherNotifications = [
    { icon: "📩", color: "bg-yellow-100", title: "New Message" },
  ];

  return (
    <div className="mt-2">
      {/* Header with title and 'View All' button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Notifications</h3>
        <button className="bg-gray-100 text-sm font-medium py-2 px-4 rounded-xl shadow hover:bg-gray-200 flex items-center gap-2">
          View All <FiChevronRight />
        </button>
      </div>

      {/* Booking Reminder Section */}
      <div className="bg-red-100 p-3 rounded-lg mb-4 max-h-64 overflow-auto">
        <h4 className="font-semibold mb-2">
          {count > 0 ? `Booking Reminder (${count})` : "Booking Reminder"}
        </h4>

        {count === 0 ? (
          <p className="text-sm text-gray-700">No bookings today.</p>
        ) : (
          // Show up to 5 booking reminders with enhanced display
          todayBookings.slice(0, 5).map((booking, idx) => (
            <div
              key={idx}
              className="mb-3 p-2 bg-white rounded border-l-4 border-red-400"
            >
              <div className="flex items-start gap-2">
                {/* Booking type icon */}
                <div className="mt-1">
                  {booking.type === "seat" ? (
                    <FaChair className="text-green-500 text-sm" />
                  ) : (
                    <FaCar className="text-blue-500 text-sm" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {booking.type === "seat" ? "Seat" : "Parking"}:{" "}
                    {booking.details}
                  </p>

                  {/* Enhanced location display */}
                  {booking.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt className="text-gray-400 text-xs" />
                      <p className="text-xs text-gray-600">
                        {booking.location}
                      </p>
                    </div>
                  )}

                  {/* Fallback floor display */}
                  {!booking.location && booking.floor && (
                    <div className="flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt className="text-gray-400 text-xs" />
                      <p className="text-xs text-gray-600">
                        Floor: {booking.floor}
                      </p>
                    </div>
                  )}

                  {/* Time display */}
                  {booking.entryTime && booking.exitTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      🕐 {booking.entryTime} - {booking.exitTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {count > 5 && <p className="text-sm text-gray-700">...and more</p>}
      </div>

      {/* New Messages Section */}
      <div className="bg-yellow-100 p-3 rounded-lg mb-4 max-h-64 overflow-auto">
        <h4 className="font-semibold mb-2">
          New Message{" "}
          {userNotifications.length > 0 ? `(${userNotifications.length})` : ""}
        </h4>

        {userNotifications.length === 0 ? (
          <p className="text-sm text-gray-700">No new messages.</p>
        ) : (
          // Show up to 5 messages
          safeUserNotifications.slice(0, 5).map((notif, idx) => (
            <div key={idx} className="mb-3 text-sm text-gray-700">
              <p className="font-medium">{notif.title}</p>
              <p className="text-xs text-gray-600">{notif.message}</p>
              <p className="text-xs text-gray-500">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}

        {userNotifications.length > 5 && (
          <p className="text-sm text-gray-700">...and more</p>
        )}
      </div>

      {/* Upcoming Booking Section */}
      <div className="bg-pink-100 p-3 rounded-lg mb-4 max-h-64 overflow-auto">
        <h4 className="font-semibold mb-2">Upcoming Booking</h4>
        {upcomingBooking ? (
          <div className="p-2 bg-white rounded border-l-4 border-pink-400">
            <div className="flex items-start gap-2">
              {/* Booking type icon */}
              <div className="mt-1">
                {upcomingBooking.type === "seat" ? (
                  <FaChair className="text-green-500 text-sm" />
                ) : (
                  <FaCar className="text-blue-500 text-sm" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-medium text-pink-800 text-sm">
                  {upcomingBooking.type === "seat" ? "Seat" : "Parking"}:{" "}
                  {upcomingBooking.details}
                </p>

                {/* Enhanced location display */}
                {upcomingBooking.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <FaMapMarkerAlt className="text-gray-400 text-xs" />
                    <p className="text-xs text-gray-600">
                      {upcomingBooking.location}
                    </p>
                  </div>
                )}

                {/* Fallback floor display */}
                {!upcomingBooking.location && upcomingBooking.floor && (
                  <div className="flex items-center gap-1 mt-1">
                    <FaMapMarkerAlt className="text-gray-400 text-xs" />
                    <p className="text-xs text-gray-600">
                      Floor: {upcomingBooking.floor}
                    </p>
                  </div>
                )}

                {/* Time and date display */}
                {upcomingBooking.entryTime && upcomingBooking.exitTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    🕐 {upcomingBooking.entryTime} - {upcomingBooking.exitTime}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  📅 Date: {upcomingBooking.date}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700">No upcoming bookings.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
