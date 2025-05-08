import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/userApi";
import { FiChevronRight } from "react-icons/fi";

const Sidebar = ({ isOpen }) => {
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate(); // navigation issue

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (token) {
      getProfile(token)
        .then((data) => setUserProfile(data))
        .catch((err) => console.error("Failed to load sidebar user", err));
    }
  }, []);

  if (!isOpen) return null; // Hide sidebar on mobile if closed

  return (
    <aside className="h-full flex flex-col p-6 bg-white gap-y-6 overflow-y-auto">
      {/*remove space between top and bottom of right sidebar*/}
      {/*TOP SECTION Profile*/}
      <div className="text-center mb-4">
        {" "}
        {/*remove space between top and bottom of right sidebar*/}
        {/* Greeting */}
        <p className="text-sm text-gray-600">Hello,</p>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {userProfile ? `${userProfile.firstName}!` : "Loading..."}
        </h2>
        <img
          src={
            userProfile?.profilePhoto
              ? userProfile.profilePhoto
              : "https://i.pravatar.cc/150?img=32"
          }
          alt="Profile"
          className="w-20 h-20 rounded-full mx-auto mb-4"
        />
        {/* Profile Button */}
        <button
          className="w-full bg-gray-100 text-sm font-semibold text-gray-800 py-3 rounded-xl shadow flex items-center justify-between px-4 hover:bg-gray-200"
          onClick={() => navigate("/profile")}
        >
          Profile <FiChevronRight className="text-xl" />
        </button>
      </div>
      {/* === BOTTOM SECTION: Notifications === */}
      <div className="mt-2">
        {/*remove space between top and bottom of right sidebar*/}/
        {/* Notifications Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Notifications</h3>
          <button className="bg-gray-100 text-sm font-medium py-2 px-4 rounded-xl shadow hover:bg-gray-200 flex items-center gap-2">
            View All <FiChevronRight />
          </button>
        </div>
        {/* Notifications List */}
        <ul className="space-y-3">
          {[
            { icon: "❗", color: "bg-red-100", title: "Booking Reminder" },
            { icon: "📩", color: "bg-yellow-100", title: "New Message" },
            { icon: "📅", color: "bg-pink-100", title: "Upcoming Booking" },
          ].map((notif, idx) => (
            <li
              key={idx}
              className={`flex items-start p-3 rounded-lg ${notif.color}`}
            >
              {/* Icon */}
              <span className="text-xl mr-3">{notif.icon}</span>

              {/* Notification Details */}
              <div>
                <h4 className="font-semibold text-sm mb-1">{notif.title}</h4>
                <p className="text-xs text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
