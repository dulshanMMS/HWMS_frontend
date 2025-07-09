import React from "react";

/**
 * NotificationItem displays a single notification in a list.
 *
 * Props:
 * - icon (string): Emoji or icon representing the notification type.
 * - color (string): Tailwind CSS background color class for styling.
 * - title (string): Notification title text to display.
 */
const NotificationItem = ({ icon, color, title }) => (
  <li className={`flex items-start p-3 rounded-lg ${color}`}>
    {/* Icon/emoji for notification */}
    <span className="text-xl mr-3">{icon}</span>

    {/* Notification title and (optional) description */}
    <div>
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      {/* Empty paragraph reserved for description if needed */}
      <p className="text-xs text-gray-600"></p>
    </div>
  </li>
);

export default NotificationItem;
