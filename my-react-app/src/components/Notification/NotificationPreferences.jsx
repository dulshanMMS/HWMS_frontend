import React, { useEffect, useState } from "react";
import axios from "axios";

const defaultPreferences = {
  email: true,
  push: true,
  bookingConfirmation: true,
  cancellationAlert: true,
  adminUpdates: true,
};

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/notifications/preferences", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPreferences(response.data || defaultPreferences);
      } catch (err) {
        console.error("Error loading preferences", err);
        setPreferences(defaultPreferences);
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put("/api/notifications/preferences", preferences, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Preferences saved successfully!");
      setShowForm(false);
    } catch (err) {
      console.error("Error saving preferences", err);
      setMessage("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading preferences...</p>;

  return (
    <div className="text-center mt-6">
      {!showForm && (
        <button
        onClick={() => {
          setMessage("");  // clear message on open
          setShowForm(true);
        }}
        className="flex items-center gap-2 bg-green-900 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors ml-0 md:ml-2 mt-2 md:mt-0"
      >
        Change Notification Preferences
      </button>
      
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl p-8 rounded-xl shadow-xl relative">


            {/* Close (×) Button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold focus:outline-none"
              title="Close"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-4 text-center">Notification Preferences</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.entries(preferences).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center">
                  <label className="sm:w-1/2 capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={key}
                        value="true"
                        checked={value === true}
                        onChange={() => handleChange(key, true)}
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={key}
                        value="false"
                        checked={value === false}
                        onChange={() => handleChange(key, false)}
                      />
                      No
                    </label>
                  </div>
                </div>
              ))}

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>

              {message && <p className="mt-2 text-sm text-center">{message}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences;
