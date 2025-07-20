import React from "react";
import {
  FaCar,
  FaChair,
  FaClock,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";

/**
 * BookingDetailsPanel displays detailed booking information for a selected date
 * Shows both parking and seating bookings with enhanced details
 *
 * Props:
 * - selectedDate (string): The selected date in YYYY-MM-DD format
 * - bookings (array): Array of booking objects for the selected date
 * - events (array): Array of event objects for the selected date
 * - onClose (function): Callback to close the details panel
 */
const BookingDetailsPanel = ({
  selectedDate,
  bookings = [],
  events = [],
  onClose,
}) => {
  // Format the selected date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Separate bookings by type
  const parkingBookings = bookings.filter((b) => b.type === "parking");
  const seatBookings = bookings.filter((b) => b.type === "seat");

  // Get total count
  const totalBookings = bookings.length;
  const totalEvents = events.length;

  if (!selectedDate) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-[320px]">
        <div className="text-center text-gray-500 py-8">
          <FaCalendarAlt className="mx-auto text-4xl mb-3 text-gray-300" />
          <p className="text-sm">
            Click on a calendar date to view booking details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-[320px] max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Date Details</h3>
          <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FaCar className="text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Parking</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {parkingBookings.length}
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FaChair className="text-green-500" />
            <span className="text-sm font-medium text-green-700">Seating</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {seatBookings.length}
          </p>
        </div>
      </div>

      {/* Events Section */}
      {events.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaCalendarAlt className="text-purple-500" />
            Events ({events.length})
          </h4>
          <div className="space-y-2">
            {events.map((event, idx) => (
              <div
                key={idx}
                className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded"
              >
                <h5 className="font-medium text-purple-800">{event.title}</h5>
                {event.time && (
                  <p className="text-sm text-purple-600 flex items-center gap-1 mt-1">
                    <FaClock className="text-xs" />
                    {event.time}
                  </p>
                )}
                {event.description && (
                  <p className="text-sm text-purple-700 mt-1">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parking Bookings Section */}
      {parkingBookings.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaCar className="text-blue-500" />
            Parking Bookings ({parkingBookings.length})
          </h4>
          <div className="space-y-3">
            {parkingBookings.map((booking, idx) => (
              <div
                key={idx}
                className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-blue-800">
                      {booking.details}
                    </h5>
                    {booking.location && (
                      <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt className="text-xs" />
                        {booking.location}
                      </p>
                    )}
                    {booking.entryTime && booking.exitTime && (
                      <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                        <FaClock className="text-xs" />
                        {booking.entryTime} - {booking.exitTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seating Bookings Section */}
      {seatBookings.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaChair className="text-green-500" />
            Seating Bookings ({seatBookings.length})
          </h4>
          <div className="space-y-3">
            {seatBookings.map((booking, idx) => (
              <div
                key={idx}
                className="bg-green-50 border-l-4 border-green-400 p-3 rounded"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-green-800">
                      {booking.details}
                    </h5>
                    {booking.location && (
                      <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt className="text-xs" />
                        {booking.location}
                      </p>
                    )}
                    {booking.entryTime && booking.exitTime && (
                      <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                        <FaClock className="text-xs" />
                        {booking.entryTime} - {booking.exitTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No bookings or events message */}
      {totalBookings === 0 && totalEvents === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">📅</div>
          <p className="text-gray-500 text-sm">
            No bookings or events for this date
          </p>
        </div>
      )}

      {/* Footer with quick actions */}
      {(totalBookings > 0 || totalEvents > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Total: {totalBookings} bookings, {totalEvents} events
            </span>
            {totalBookings > 0 && (
              <button className="text-blue-500 hover:text-blue-600 font-medium">
                View All →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsPanel;
