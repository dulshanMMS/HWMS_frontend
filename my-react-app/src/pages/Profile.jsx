import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../api/userApi";
import { uploadProfileImage } from "../api/firebaseUpload";

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nickName: "",
    gender: "",
    country: "",
    language: "",
    timeZone: "",
    program: "",
    vehicleNumber: "",
    email: "",
    profilePhoto: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      getProfile(token)
        .then((data) => {
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            nickName: data.nickName || "",
            gender: data.gender || "",
            country: data.country || "",
            language: data.language || "",
            timeZone: data.timeZone || "",
            program: data.program || "",
            vehicleNumber: data.vehicleNumber || "",
            email: data.email || "",
            profilePhoto: data.profilePhoto || "",
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error loading profile:", err);
          setLoading(false);
        });
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleEdit = async () => {
    if (editMode) {
      try {
        await updateProfile(token, formData);
        alert("Profile updated successfully!");
      } catch (err) {
        alert("Failed to update profile.");
        console.error(err);
      }
    }
    setEditMode(!editMode);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const userId = "user_" + formData.email; // or actual user ID if available
      const url = await uploadProfileImage(file, userId);
      setFormData({ ...formData, profilePhoto: url });
      alert("Profile image uploaded!");
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <img
          src={formData.profilePhoto || "https://i.pravatar.cc/150?img=32"}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Hello,{" "}
            <span>
              {formData.firstName} {formData.lastName}
            </span>
          </h2>
          <p className="text-gray-600">{formData.email}</p>
        </div>
      </div>

      {/* Profile Form */}
      <form className="bg-white p-6 rounded-2xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            {
              label: "Program",
              name: "program",
              type: "select",
              options: ["Program1", "Program2"],
            },
            { label: "Vehicle No", name: "vehicleNumber", type: "text" },
            // { label: "Profile Photo URL", name: "profilePhoto", type: "text" },
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

          {/* Upload Image */}
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
        </div>

        {/* Email Display */}
        <div className="mt-8">
          <p className="font-semibold">My Email Address</p>
          <div className="flex items-center gap-3 mt-2 bg-gray-100 p-4 rounded-lg">
            <span className="text-xl">📧</span>
            <div>
              <p className="font-medium text-gray-800">{formData.email}</p>
              <small className="text-gray-500">This is your login email.</small>
            </div>
          </div>
        </div>

        {/* Edit/Save Button */}
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
  );
};

export default Profile;
