import React from "react";
import { FaUser, FaUsers, FaCar, FaCircle } from "react-icons/fa";
import MessagingButton from "../MessagingButton";

/**
 * UserProfileSummary displays a welcome message, user info,
 * and profile photo if available with modern styling.
 *
 * Props:
 * - userProfile (object|null): user data fetched from backend.
 *
 * Shows a loading message if userProfile is null.
 */
const UserProfileSummary = ({ userProfile }) => {
  // Show loading message while userProfile data is not yet available
  if (!userProfile) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  // Determine online status (you can replace this with real logic)
  const isOnline = true; // This would come from your backend/socket connection

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-green-50 rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center gap-6">
        {/* Profile Photo Section */}
        <div className="relative">
          {userProfile.profilePhoto ? (
            <img
              src={userProfile.profilePhoto}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center border-4 border-white shadow-lg">
              <FaUser className="text-white text-2xl" />
            </div>
          )}

          {/* Online Status Indicator */}
          <div className="absolute -bottom-1 -right-1 flex items-center">
            <FaCircle
              className={`text-xs ${
                isOnline ? "text-green-500" : "text-gray-400"
              }`}
            />
            <div
              className={`w-3 h-3 rounded-full border-2 border-white ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="flex-1 space-y-3">
          {/* Welcome Message */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Welcome back, {userProfile.firstName}! 👋
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              {userProfile.firstName} {userProfile.lastName}
            </p>
          </div>

          {/* User Details */}
          <div className="flex flex-wrap gap-4 text-sm">
            {/* Team Information */}
            <div className="flex items-center gap-2 bg-white bg-opacity-70 px-3 py-2 rounded-xl shadow-sm border border-gray-100">
              <FaUsers className="text-blue-500" />
              <span className="text-gray-600">Team:</span>
              <span className="font-semibold text-blue-700">
                {userProfile.teamName || "No Team"}
              </span>
            </div>

            {/* Vehicle Information */}
            {userProfile.vehicleNumber && (
              <div className="flex items-center gap-2 bg-white bg-opacity-70 px-3 py-2 rounded-xl shadow-sm border border-gray-100">
                <FaCar className="text-green-500" />
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-semibold text-green-700">
                  {userProfile.vehicleNumber}
                </span>
              </div>
            )}

            {/*Messaging Access */}
            <MessagingButton position="relative" size="sm" />

            {/* Status Badge */}
            <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-xl border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium text-xs">
                {isOnline ? "Active Now" : "Away"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="hidden lg:flex flex-col gap-2">
          <button className="p-2 bg-white bg-opacity-80 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group">
            <FaUser className="text-gray-600 group-hover:text-blue-500 transition-colors" />
          </button>
          <button className="p-2 bg-white bg-opacity-80 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group">
            <FaUsers className="text-gray-600 group-hover:text-green-500 transition-colors" />
          </button>
        </div> */}
      </div>

      {/* Bottom Border Animation */}
      <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full opacity-20"></div>
    </div>
  );
};

export default UserProfileSummary;
