import React, { useState } from "react";
import useAuthGuard from "../components/AuthGuard";
import AdminSidebar from "../components/AdminSidebar";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const AdminDashboard = () => {
  useAuthGuard("admin");

  const [date, setDate] = useState(new Date());
  
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
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Type your message"
              ></textarea>
              <div className="text-right mt-2">
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                  Send
                </button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold text-lg mb-2">Today</h2>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span>User - Belanja di pasar</span>
                  </div>
                  <span className="text-sm">08</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span>User - Naik bus umum</span>
                  </div>
                  <span className="text-sm">10</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span>User - Bayar Listrik</span>
                  </div>
                  <span className="text-sm">10</span>
                </li>
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
              <Calendar onChange={setDate} value={date} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Color Palette for teams</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "Team A", color: "bg-blue-400" },
                  { name: "Team B", color: "bg-purple-400" },
                  { name: "Team C", color: "bg-orange-400" },
                  { name: "Team D", color: "bg-yellow-400" },
                  { name: "Team E", color: "bg-green-400" },
                  { name: "Team F", color: "bg-pink-400" },
                  { name: "Team G", color: "bg-indigo-400" },
                  { name: "Team H", color: "bg-red-400" },
                  { name: "Team I", color: "bg-teal-400" },
                  { name: "Team J", color: "bg-lime-400" },
                  { name: "Team K", color: "bg-emerald-400" },
                  { name: "Team L", color: "bg-cyan-400" },
                  { name: "Team M", color: "bg-rose-400" },
                  { name: "Team N", color: "bg-amber-400" },
                  { name: "Team O", color: "bg-violet-400" },
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
                src="https://via.placeholder.com/50"
                alt="avatar"
                className="rounded-full w-12 h-12"
              />
              <div>
                <h3 className="font-semibold text-lg">Hello, Sumanya!</h3>
                <button className="text-green-600 font-medium text-sm">Profile →</button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Quick Stats</h2>
              <p className="text-2xl font-bold">28,35</p>
              <button className="text-green-600 font-medium mt-2">View Reports →</button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-2">Notifications</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="text-red-500">🔴</span>
                  <span>Booking Reminder</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-yellow-500">🟡</span>
                  <span>New Message</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-500">🔴</span>
                  <span>Upcoming Booking</span>
                </li>
              </ul>
              <div className="text-right mt-2">
                <button className="text-green-600 font-medium">View All Notifications →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


