
// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const defaultPreferences = {
//   email: true,
//   push: true,
//   bookingConfirmation: true,
//   cancellationAlert: true,
//   adminUpdates: true,
// };

// const NotificationPreferences = () => {
//   const [preferences, setPreferences] = useState(defaultPreferences);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");
//   const [showForm, setShowForm] = useState(false);

//   useEffect(() => {
//     const fetchPreferences = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           throw new Error("No authentication token found. Please log in.");
//         }
//         const response = await axios.get("/api/notifications/preferences", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setPreferences(response.data || defaultPreferences);
//       } catch (err) {
//         console.error("Error loading preferences:", err);
//         setMessage(err.message || "Failed to load preferences.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPreferences();
//   }, []);

//   const handleChange = (key, value) => {
//     setPreferences(prev => ({ ...prev, [key]: value }));
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("No authentication token found. Please log in.");
//       }
//       await axios.put("/api/notifications/preferences", preferences, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMessage("Preferences saved successfully!");
//       setShowForm(false);
//     } catch (err) {
//       console.error("Error saving preferences:", err);
//       setMessage(err.response?.data?.message || "Failed to save preferences.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <p>Loading preferences...</p>;

//   return (
//     <div className="text-center mt-6">
//       {!showForm && (
//         <button
//           onClick={() => {
//             setMessage(""); // Clear message on open
//             setShowForm(true);
//           }}
//           className="flex items-center gap-2 bg-green-900 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors ml-0 md:ml-2 mt-2 md:mt-0"
//         >
//           Change Notification Preferences
//         </button>
//       )}

//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
//           <div className="bg-white w-full max-w-4xl p-8 rounded-xl shadow-xl relative">
//             {/* Close (×) Button */}
//             <button
//               onClick={() => setShowForm(false)}
//               className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold focus:outline-none"
//               title="Close"
//             >
//               &times;
//             </button>

//             <h2 className="text-2xl font-bold mb-4 text-center">Notification Preferences</h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {Object.entries(preferences).map(([key, value]) => (
//                 <div key={key} className="flex flex-col sm:flex-row sm:items-center">
//                   <label className="sm:w-1/2 capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
//                   <div className="flex gap-4">
//                     <label className="flex items-center gap-2">
//                       <input
//                         type="radio"
//                         name={key}
//                         value="true"
//                         checked={value === true}
//                         onChange={() => handleChange(key, true)}
//                       />
//                       Yes
//                     </label>
//                     <label className="flex items-center gap-2">
//                       <input
//                         type="radio"
//                         name={key}
//                         value="false"
//                         checked={value === false}
//                         onChange={() => handleChange(key, false)}
//                       />
//                       No
//                     </label>
//                   </div>
//                 </div>
//               ))}

//               <div className="mt-6 flex justify-between">
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {saving ? "Saving..." : "Save Preferences"}
//                 </button>
//               </div>

//               {message && (
//                 <p className={`mt-2 text-sm text-center ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
//                   {message}
//                 </p>
//               )}
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationPreferences;
import React, { useEffect, useState } from "react";

const defaultPreferences = {
  email: true,
  push: true,
  bookingConfirmation: true,
  cancellationAlert: true,
  adminUpdates: true,
};

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        // Simulating API call without localStorage
        setPreferences(defaultPreferences);
      } catch (err) {
        console.error("Error loading preferences:", err);
        setMessage(err.message || "Failed to load preferences.");
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Preferences saved successfully!");
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      console.error("Error saving preferences:", err);
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
            setMessage(""); // Clear message on open
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-green-900 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors ml-0 md:ml-2 mt-2 md:mt-0"
        >
          Change Notification Preferences
        </button>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl relative">
            {/* Close (×) Button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
              title="Close"
            >
              &times;
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-semibold text-gray-800">Notification Preferences</span>
              </div>
              
              {/* <h2 className="text-lg font-medium text-gray-900 mb-2">
                Preferences for <span className="font-normal">user@example.com</span>
              </h2> */}
              <p className="text-sm text-gray-600">
                Select boxes below for information you would like to receive.
              </p>
            </div>

            <div className="p-6">
              {/* Content Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Content</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.email}
                        onChange={(e) => handleChange('email', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Email Notifications</div>
                        <div className="text-sm text-gray-600">(about 2/month)</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Thought Leadership and Analyst Reports
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Push */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.push}
                        onChange={(e) => handleChange('push', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Push Notifications</div>
                        <div className="text-sm text-gray-600">(about 1/month)</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Announcing live and online events
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Booking Confirmation */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.bookingConfirmation}
                        onChange={(e) => handleChange('bookingConfirmation', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Booking Confirmation</div>
                        <div className="text-sm text-gray-600">(about 6/year)</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Hear about major features or updates
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Cancellation Alert */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.cancellationAlert}
                        onChange={(e) => handleChange('cancellationAlert', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Cancellation Alert</div>
                        <div className="text-sm text-gray-600">(about 1/week)</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Blogs, insights and news updates
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Admin Updates */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.adminUpdates}
                        onChange={(e) => handleChange('adminUpdates', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">I need a break</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Suspend emails for 3 months
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Unsubscribe from all</div>
                        <div className="text-sm text-gray-500 mt-1">
                          You'll receive no further updates
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Update Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? "Saving..." : "Update Preferences"}
                </button>
              </div>

              {message && (
                <div className={`mt-4 p-3 rounded-md text-sm text-center ${
                  message.includes("successfully") 
                    ? "bg-green-50 text-green-800" 
                    : "bg-red-50 text-red-800"
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences;