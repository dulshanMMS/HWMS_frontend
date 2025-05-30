import React from "react";
import { FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/**
 * ProfileGreeting shows a friendly greeting, user’s profile photo,
 * and a button linking to the full profile page.
 *
 * Props:
 * - userProfile (object|null): User data including name and photo URL.
 */
const ProfileGreeting = ({ userProfile }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-4">
      {/* Greeting text */}
      <p className="text-sm text-gray-600">Hello,</p>

      {/* User's first name or loading placeholder */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {userProfile ? `${userProfile.firstName}!` : "Loading..."}
      </h2>

      {/* Profile photo or fallback avatar */}
      <img
        src={
          userProfile?.profilePhoto
            ? userProfile.profilePhoto
            : "https://i.pravatar.cc/150?img=32"
        }
        alt="Profile"
        className="w-20 h-20 rounded-full mx-auto mb-4"
      />

      {/* Button to navigate to profile page */}
      <button
        className="w-full bg-gray-100 text-sm font-semibold text-gray-800 py-3 rounded-xl shadow flex items-center justify-between px-4 hover:bg-gray-200"
        onClick={() => navigate("/profile")}
      >
        Profile <FiChevronRight className="text-xl" />
      </button>
    </div>
  );
};

export default ProfileGreeting;
