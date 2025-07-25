import axios from "axios";
import { useEffect, useState } from "react";
import { uploadProfileImage } from "../api/firebaseUpload";
import { getProfile, updateProfile } from "../api/userApi";
import LeftSidebar from "../components/LeftSidebar";
import useTokenExpiration from "../hooks/useTokenExpiration";

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

  // NEW: State for dynamic progress bar countdown (0-100%)
  const [progressWidth, setProgressWidth] = useState(100);

  // NEW: State to track if current message is an error (for red styling)
  const [isError, setIsError] = useState(false);

  // Retrieve stored auth token from localStorage
  const token = localStorage.getItem("token");

  // NEW: Helper function to convert Tailwind color classes to hex values
  const getTailwindColorHex = (colorClass) => {
    const colorMap = {
      'bg-red-500': '#EF4444',
      'bg-blue-500': '#3B82F6',
      'bg-green-500': '#10B981',
      'bg-yellow-500': '#F59E0B',
      'bg-purple-500': '#8B5CF6',
      'bg-pink-500': '#EC4899',
      'bg-indigo-500': '#6366F1',
      'bg-orange-500': '#F97316',
      'bg-teal-500': '#14B8A6',
      'bg-cyan-500': '#06B6D4',
      'bg-emerald-500': '#10B981',
      'bg-lime-500': '#84CC16',
      'bg-amber-500': '#F59E0B',
      'bg-violet-500': '#8B5CF6',
      'bg-fuchsia-500': '#D946EF',
      'bg-rose-500': '#F43F5E',
      'bg-sky-500': '#0EA5E9',
      'bg-gray-500': '#6B7280',
      'bg-slate-500': '#64748B',
      'bg-zinc-500': '#71717A',
      'bg-neutral-500': '#737373',
      'bg-stone-500': '#78716C'
    };
    return colorMap[colorClass] || '#10B981'; // Default fallback color
  };

  // NEW: Clear sensitive profile data when token expires
  const clearSensitiveData = () => {
    setFormData({
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
    setDisplayName("");
    setTeams([]);
    setSuccessMsg("");
    setEditMode(false);
    setLoading(false);
  };

  // NEW: Use token expiration hook for automatic logout
  useTokenExpiration(clearSensitiveData);

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

  // NEW: Debug logging for team colors - helps troubleshoot color display issues
  useEffect(() => {
    
    if (formData.teamId) {
      const selectedTeam = teams.find(t => t.teamId === formData.teamId);
 
    }
  }, [teams, formData.teamId]);

  // NEW: Dynamic progress bar animation effect
  // This runs whenever successMsg changes to start the countdown
  useEffect(() => {
    if (successMsg) {
      // Reset progress to 100% when message appears
      setProgressWidth(100);
      
      // Create interval to decrease progress every 100ms for 3 seconds
      const progressInterval = setInterval(() => {
        setProgressWidth(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval);
            return 0;
          }
          // Decrease by ~3.33% every 100ms (100/30 = 3.33, since 3000ms/100ms = 30 intervals)
          return prev - (100/30);
        });
      }, 100);

      // Clean up interval when component unmounts or successMsg changes
      return () => clearInterval(progressInterval);
    }
  }, [successMsg]);

  // Update form state on input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler to toggle between edit and save mode
  const handleToggleEdit = async () => {
    if (editMode) {
      // NEW: Enhanced validation before saving - check all required fields individually
      if (!formData.firstName.trim()) {
        setIsError(true);
        setSuccessMsg("First Name is required");
        setTimeout(() => {
          setSuccessMsg("");
          setProgressWidth(100);
          setIsError(false);
        }, 3000);
        return;
      }

      if (!formData.lastName.trim()) {
        setIsError(true);
        setSuccessMsg("Last Name is required");
        setTimeout(() => {
          setSuccessMsg("");
          setProgressWidth(100);
          setIsError(false);
        }, 3000);
        return;
      }

      if (!formData.email.trim()) {
        setIsError(true);
        setSuccessMsg("Email is required");
        setTimeout(() => {
          setSuccessMsg("");
          setProgressWidth(100);
          setIsError(false);
        }, 3000);
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setIsError(true);
        setSuccessMsg("Please enter a valid email address");
        setTimeout(() => {
          setSuccessMsg("");
          setProgressWidth(100);
          setIsError(false);
        }, 3000);
        return;
      }

      // If currently editing, attempt to save updated profile data
      try {
        await updateProfile(token, formData);
        setDisplayName(`${formData.firstName} ${formData.lastName}`);
        setIsError(false); // Ensure error state is cleared on success
        setSuccessMsg("Profile updated successfully!");
        
        // Clear message after 3 seconds (progress bar will animate during this time)
        setTimeout(() => {
          setSuccessMsg("");
          setProgressWidth(100);
        }, 3000);
      } catch (err) {
        console.error(err);
        setIsError(true); // Set error state for red styling
        setSuccessMsg("Failed to update profile. Please try again.");
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          setSuccessMsg("");
          setProgressWidth(100);
          setIsError(false);
        }, 3000);
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

      setIsError(false); // Ensure error state is cleared on success
      setSuccessMsg("Profile image uploaded!");
      
      // Clear message after 3 seconds with progress animation
      setTimeout(() => {
        setSuccessMsg("");
        setProgressWidth(100);
      }, 3000);
    } catch (err) {
      console.error("Image upload failed:", err);
      setIsError(true); // Set error state for red styling
      setSuccessMsg("Image upload failed. Please try again.");
      
      setTimeout(() => {
        setSuccessMsg("");
        setProgressWidth(100);
        setIsError(false);
      }, 3000);
    }
  };

  // Show loading indicator while fetching profile
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen flex bg-green-100 font-sans">
      {/* Left sidebar navigation */}
      <LeftSidebar />
      
      <div className="flex-1 p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          
          {/* NEW: Enhanced notification message with dynamic progress bar and error handling */}
          {successMsg && (
            <div className={`fixed top-6 right-6 bg-white rounded-2xl shadow-2xl border-l-4 z-50 w-80 overflow-hidden ${isError ? 'border-red-500' : 'border-green-500'}`}>
              {/* Dynamic progress bar - red for errors, green for success */}
              <div 
                className={`h-1 transition-all duration-100 ease-linear ${isError ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${progressWidth}%` }}
              ></div>
              
              {/* Message content with appropriate icon and colors */}
              <div className="p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center animate-pulse ${isError ? 'bg-red-500' : 'bg-green-500'}`}>
                  <span className="text-white font-bold text-sm">
                    {isError ? '!' : '✓'}
                  </span>
                </div>
                <div>
                  <h4 className={`font-semibold ${isError ? 'text-red-800' : 'text-gray-800'}`}>
                    {isError ? 'Error!' : 'Success!'}
                  </h4>
                  <p className={`text-sm ${isError ? 'text-red-600' : 'text-gray-600'}`}>
                    {successMsg}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced profile header with picture and name */}
          <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 lg:gap-10 mb-8 md:mb-10 p-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-lg border-l-4 border-green-500">
            <img
              src={formData.profilePhoto || "https://i.pravatar.cc/150?img=32"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-green-100"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Hello, <span>{displayName}</span>
              </h2>
              <p className="text-gray-600">{formData.email}</p>
            </div>
          </div>

          {/* Enhanced profile form */}
          <form className="bg-gradient-to-br from-gray-50 to-white p-6 md:p-8 lg:p-10 rounded-2xl shadow-xl w-full border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
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
                      className="p-4 rounded-xl bg-white border-2 border-gray-200 text-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md"
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
                      required={field.name === 'firstName' || field.name === 'lastName' || field.name === 'email'}
                      className={`p-4 rounded-xl bg-white border-2 text-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                        // Show red border for empty required fields in edit mode
                        ((field.name === 'firstName' && !formData.firstName.trim()) ||
                         (field.name === 'lastName' && !formData.lastName.trim()) ||
                         (field.name === 'email' && !formData.email.trim())) && editMode
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200'
                      }`}
                      placeholder={
                        (field.name === 'firstName' || field.name === 'lastName' || field.name === 'email') 
                          ? `${field.label} *` 
                          : field.name === 'vehicleNumber' 
                            ? `${field.label} (optional)`
                            : field.label
                      }
                    />
                  )}
                </div>
              ))}

              {/* Separate Team selection with color indicator */}
              <div className="flex flex-col lg:col-span-2 xl:col-span-1">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  Team
                </label>
                
                {/* Container for dropdown and color indicator */}
                <div className="flex items-center gap-3">
                  <select
                    name="teamId"
                    value={formData.teamId || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="flex-1 p-4 rounded-xl bg-white border-2 border-gray-200 text-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <option value="">Select your team</option>
                    {teams.map((team) => (
                      <option key={team.teamId} value={team.teamId}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                  
                  {/* Team color indicator - shows selected team's color with enhanced fallback */}
                  {formData.teamId && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-lg ring-2 ring-gray-200 transition-all duration-300"
                        style={{ 
                          backgroundColor: getTailwindColorHex(teams.find(t => t.teamId === formData.teamId)?.color) || '#10B981'
                        }}
                        title={`Team: ${teams.find(t => t.teamId === formData.teamId)?.teamName || 'Unknown'}`}
                      ></div>
                      <span className="text-xs text-gray-500 font-medium">
                        {teams.find(t => t.teamId === formData.teamId)?.teamName || 'Unknown Team'}
                      </span>
                    </div>
                  )}
                  
                  {/* Placeholder when no team selected */}
                  {!formData.teamId && (
                    <div className="flex items-center gap-2 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300"></div>
                      <span className="text-xs text-gray-400">No team selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile image upload section */}
            <div className="flex flex-col lg:col-span-2 xl:col-span-3 mt-6">
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

            {/* Enhanced email display section */}
            <div className="mt-8 md:mt-10 p-6 bg-gradient-to-r from-blue-50 via-green-50 to-purple-50 rounded-2xl border-2 border-green-200 shadow-lg">
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

            {/* Enhanced button to toggle edit/save */}
            <div className="text-right mt-8">
              <button
                type="button"
                onClick={handleToggleEdit}
                className="px-8 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {editMode ? "SAVE" : "EDIT"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;