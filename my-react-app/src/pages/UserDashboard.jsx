import React from "react";
import Sidebar from "../components/Sidebar";
import LeftSidebar from "../components/LeftSidebar";

const UserDashboard = () => {
  // Get current date information
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return (
    <div className="w-full min-h-screen flex flex-row">
      {/* LEFT SIDEBAR */}
      <LeftSidebar />
      {/*MAIN CONTENT*/}
      <div className="flex flex-col flex-1 p-6 lg:p-10 gap-6">
        {/* Dashboard Heading */}
        <h1 className="text-4xl font-bold">Dashboard</h1>

        {/* Top Summary Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Card: Total Bookings */}
          <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-[300px]">
            <p className="text-lg font-semibold mb-2">Your Total Bookings</p>
            <p className="text-4xl font-bold">285</p>
          </div>

          {/* Card: Calendar */}
          <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-[300px]">
            <p className="text-sm font-medium mb-1 text-right">
              Event Calendar
            </p>
            <p className="text-lg font-semibold text-right mb-4">
              {today.toLocaleString("default", { month: "long" })} {currentYear}
            </p>

            {/* Calendar */}
            <div className="grid grid-cols-7 text-center font-medium text-sm mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Calendar: Dates */}
            <div className="grid grid-cols-7 gap-2 text-sm">
              {Array.from({ length: 31 }, (_, i) => {
                const date = new Date(currentYear, currentMonth, i + 1);
                const isToday =
                  date.getDate() === currentDay &&
                  date.getMonth() === currentMonth &&
                  date.getFullYear() === currentYear;

                return (
                  <div
                    key={i}
                    className={`h-10 flex items-center justify-center rounded-lg font-medium cursor-pointer transition-colors duration-200 ${
                      isToday
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-10 border-b">
          {[
            { name: "Bookings", active: true },
            { name: "Seat Bookings" },
            { name: "Parking Bookings" },
          ].map((tab, idx) => (
            <button
              key={idx}
              className={`pb-2 font-medium text-sm ${
                tab.active
                  ? "border-b-2 border-green-700 text-black"
                  : "text-gray-500"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Booking Cards Section */}
        <div className="flex flex-wrap gap-6">
          {/* Example Booking Cards */}
          {["Today’s Schedule", "Yesterday’s Schedule"].map((title, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-6 w-[260px]"
            >
              <p className="font-semibold mb-2">{title}</p>
              <p className="text-green-700 text-sm font-medium mb-1">
                Desk 5A-9
              </p>
              <p className="text-sm text-gray-500 mb-2">
                4th floor, Conference Room, NetOffice
              </p>
              <p className="text-xs text-gray-600 whitespace-pre-line">
                Feb 07, 2022 9 AM to 6 PM
              </p>
            </div>
          ))}

          {/* View All History Button */}
          <div className="flex items-center">
            <button className="px-4 py-2 bg-white rounded-xl shadow border font-semibold text-sm">
              View All Booking History →
            </button>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="w-[320px] min-h-screen bg-white border-l border-gray-200 shadow-md">
        <Sidebar />
      </div>
    </div>
  );
};

export default UserDashboard;
