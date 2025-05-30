import React from "react";

/**
 * UserProfileSummary displays a welcome message, user info,
 * and profile photo if available.
 *
 * Props:
 * - userProfile (object|null): user data fetched from backend.
 *
 * Shows a loading message if userProfile is null.
 */
const UserProfileSummary = ({ userProfile }) => {
  // Show loading message while userProfile data is not yet available
  if (!userProfile) {
    return <p className="text-gray-500 text-sm">Loading your profile...</p>;
  }

  return (
    <div className="text-lg font-medium text-gray-600">
      {/* Welcome message with user's first and last name */}
      Welcome, {userProfile.firstName} {userProfile.lastName}!
      {/* Display user's team and vehicle number */}
      <div className="text-sm text-gray-500">
        Team: {userProfile.teamName || "N/A"} | Vehicle No:{" "}
        {userProfile.vehicleNumber}
      </div>
      {/* Show profile photo if available */}
      {userProfile.profilePhoto && (
        <img
          src={userProfile.profilePhoto}
          alt="Profile"
          className="w-16 h-16 rounded-full border mt-2"
        />
      )}
    </div>
  );
};

export default UserProfileSummary;
