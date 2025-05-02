import React, { useState } from "react";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);

  const toggleEdit = () => setEditMode(!editMode);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <img
          src="https://i.pravatar.cc/150?img=32"
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Hello, <span>Sumanya Hearath</span>
          </h2>
          <p className="text-gray-600">sumanyaherath@gmail.com</p>
        </div>
      </div>

      {/* Profile Form */}
      <form className="bg-white p-6 rounded-2xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fields */}
          {[
            { label: "Full Name", type: "text", value: "Alexa Rawles" },
            { label: "Nick Name", type: "text", value: "Ale" },
            {
              label: "Gender",
              type: "select",
              options: ["Male", "Female", "Other"],
              value: "Female",
            },
            {
              label: "Country",
              type: "select",
              options: ["Sri Lanka", "India", "USA"],
              value: "Sri Lanka",
            },
            {
              label: "Language",
              type: "select",
              options: ["sinhala", "english", "tamil"],
              value: "sinhala",
            },
            {
              label: "Time Zone",
              type: "select",
              options: ["Time zone", "GMT+5:30", "GMT+0"],
              value: "Time zone",
            },
            {
              label: "Program",
              type: "select",
              options: ["Program1", "Program2"],
              value: "Program1",
            },
            { label: "Vehicle No", type: "text", value: "BHM6362" },
          ].map((field, idx) => (
            <div className="flex flex-col" key={idx}>
              <label className="text-sm font-semibold text-gray-600 mb-1">
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  defaultValue={field.value}
                  disabled={!editMode}
                  className="p-3 rounded-lg bg-gray-100 text-sm"
                >
                  {field.options.map((opt, i) => (
                    <option key={i}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  defaultValue={field.value}
                  disabled={!editMode}
                  className="p-3 rounded-lg bg-gray-100 text-sm"
                />
              )}
            </div>
          ))}
        </div>

        {/* Email Block */}
        <div className="mt-8">
          <p className="font-semibold">My Email Address</p>
          <div className="flex items-center gap-3 mt-2 bg-gray-100 p-4 rounded-lg">
            <span className="text-xl">📧</span>
            <div>
              <p className="font-medium text-gray-800">
                sumanyaherath@gmail.com
              </p>
              <small className="text-gray-500"></small>
            </div>
          </div>
        </div>

        <div className="text-right mt-8">
          <button
            type="button"
            onClick={toggleEdit}
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
