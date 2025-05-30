import axios from "axios";
import { useEffect, useState } from "react";
import { uploadProfileImage } from "../api/firebaseUpload";
import { getProfile, updateProfile } from "../api/userApi";
import LeftSidebar from "../components/LeftSidebar";

const Profile = () => {
  // State to hold the user profile form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nickName: "",
    gender: "",
    country: "",
    language: "",
    timeZone: "",
    teamId: "",
    vehicleNumber: "",
    email: "",
    profilePhoto: "",
  });

  // Toggles edit mode for the form (view vs edit)
  const [editMode, setEditMode] = useState(false);

  // Loading state while fetching profile data
  const [loading, setLoading] = useState(true);

  // Success or error message shown for notifications
  const [successMsg, setSuccessMsg] = useState("");

  // Display name for greeting (concatenation of first + last name)
  const [displayName, setDisplayName] = useState("");

  // List of teams fetched from backend API
  const [teams, setTeams] = useState([]);

  // Retrieve stored auth token from localStorage
  const token = localStorage.getItem("token");

  // Load user profile data when component mounts or token changes
  useEffect(() => {
    if (!token) {
      // No token means user not logged in, skip loading
      setLoading(false);
      return;
    }

    // Fetch profile using API function
    getProfile(token)
      .then((data) => {
        // Populate form data with received profile info
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          nickName: data.nickName || "",
          gender: data.gender || "",
          country: data.country || "",
          language: data.language || "",
          timeZone: data.timeZone || "",
          teamId: data.teamId || "",
          vehicleNumber: data.vehicleNumber || "",
          email: data.email || "",
          profilePhoto: data.profilePhoto || "",
        });
        setDisplayName(`${data.firstName} ${data.lastName}`);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setLoading(false);
      });
  }, [token]);

  // Load list of teams for team selection dropdown on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/teams") // Replace URL if backend URL differs
      .then((res) => setTeams(res.data))
      .catch((err) => console.error("Failed to load teams:", err));
  }, []);

  // Update form state on input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler to toggle between edit and save mode
  const handleToggleEdit = async () => {
    if (editMode) {
      // If currently editing, attempt to save updated profile data
      try {
        await updateProfile(token, formData);
        setDisplayName(`${formData.firstName} ${formData.lastName}`);
        setSuccessMsg("Profile updated successfully!");
        // Clear message after 3 seconds
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err) {
        console.error(err);
        setSuccessMsg("Failed to update profile.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    }
    // Toggle edit mode state
    setEditMode(!editMode);
  };

  // Handler for uploading profile image to Firebase storage
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Compose userId from email (or use actual user ID if available)
      const userId = "user_" + formData.email;
      // Upload image file and get back URL
      const url = await uploadProfileImage(file, userId);
      // Update profile photo URL in form data state
      setFormData({ ...formData, profilePhoto: url });

      setSuccessMsg("Profile image uploaded!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Image upload failed:", err);
      setSuccessMsg("Image upload failed.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  // Show loading indicator while fetching profile
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      {/* Left sidebar navigation */}
      <div className="w-64">
        <LeftSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-8 relative">
        {/* Notification message (success or error) */}
        {successMsg && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-600 text-green-700 px-4 py-2 rounded shadow-md z-50 w-fit max-w-md text-center">
            {successMsg}
          </div>
        )}

        {/* Profile header with picture and name */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src={formData.profilePhoto || "https://i.pravatar.cc/150?img=32"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Hello, <span>{displayName}</span>
            </h2>
            <p className="text-gray-600">{formData.email}</p>
          </div>
        </div>

        {/* Profile form */}
        <form className="bg-white p-6 rounded-2xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Map over form fields except team, which is rendered separately */}
            {[
              { label: "First Name", name: "firstName", type: "text" },
              { label: "Last Name", name: "lastName", type: "text" },
              { label: "Nick Name", name: "nickName", type: "text" },
              {
                label: "Gender",
                name: "gender",
                type: "select",
                options: ["Male", "Female", "Other"],
              },
              {
                label: "Country",
                name: "country",
                type: "select",
                options: ["Sri Lanka", "India", "USA"],
              },
              {
                label: "Language",
                name: "language",
                type: "select",
                options: ["sinhala", "english", "tamil"],
              },
              {
                label: "Time Zone",
                name: "timeZone",
                type: "select",
                options: ["GMT+5:30", "GMT+0"],
              },
              { label: "Vehicle No", name: "vehicleNumber", type: "text" },
            ].map((field, idx) => (
              <div className="flex flex-col" key={idx}>
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="p-3 rounded-lg bg-gray-100 text-sm"
                  >
                    {field.options.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type="text"
                    value={formData[field.name]}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="p-3 rounded-lg bg-gray-100 text-sm"
                  />
                )}
              </div>
            ))}

            {/* Separate Team selection */}
            <div className="flex flex-col mb-6 max-w-xs">
              <label className="text-sm font-semibold text-gray-600 mb-1">
                Team
              </label>
              <select
                name="teamId"
                value={formData.teamId || ""}
                onChange={handleChange}
                disabled={!editMode}
                className={`p-3 rounded-lg text-sm ${
                  teams.find((t) => t.teamId === formData.teamId)?.color ||
                  "bg-gray-100"
                }`}
              >
                <option value="">Select your team</option>
                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Profile image upload */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">
              Upload Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={!editMode}
              className="p-2 text-sm bg-gray-100 rounded"
            />
          </div>

          {/* Display user's email */}
          <div className="mt-8">
            <p className="font-semibold">My Email Address</p>
            <div className="flex items-center gap-3 mt-2 bg-gray-100 p-4 rounded-lg">
              <span className="text-xl">📧</span>
              <div>
                <p className="font-medium text-gray-800">{formData.email}</p>
                <small className="text-gray-500">
                  This is your login email.
                </small>
              </div>
            </div>
          </div>

          {/* Button to toggle edit/save */}
          <div className="text-right mt-8">
            <button
              type="button"
              onClick={handleToggleEdit}
              className="px-6 py-2 rounded-lg text-white font-bold bg-green-700 hover:bg-green-800"
            >
              {editMode ? "SAVE" : "EDIT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
