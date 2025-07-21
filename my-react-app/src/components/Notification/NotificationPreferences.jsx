

// import React, { useEffect, useState } from "react";

// const defaultPreferences = {
//   bookingConfirmation: { email: true, inApp: true },
//   cancellationAlert: { email: true, inApp: true },
//   adminAnnouncements: { email: true, inApp: true },
//   bookingReminder: { email: true, inApp: true }
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
//         const response = await fetch('/api/notifications/preferences', {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         const data = await response.json();
//         setPreferences(data || defaultPreferences);
//       } catch (err) {
//         console.error("Error loading preferences:", err);
//         setMessage(err.message || "Failed to load preferences.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPreferences();
//   }, []);

//   const handleChange = (category, type, value) => {
//     setPreferences(prev => ({
//       ...prev,
//       [category]: { ...prev[category], [type]: value }
//     }));
//   };

//   const handleSubmit = async () => {
//     setSaving(true);
//     try {
//       const response = await fetch('/api/notifications/preferences', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify({
//           ...preferences,
//           bookingReminder: { ...preferences.bookingReminder, inApp: true }
//         })
//       });
//       const data = await response.json();
//       setPreferences(data);
//       setMessage("Preferences saved successfully!");
//       setTimeout(() => setShowForm(false), 1500);
//     } catch (err) {
//       console.error("Error saving preferences:", err);
//       setMessage("Failed to save preferences.");
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
//             setMessage("");
//             setShowForm(true);
//           }}
//           className="flex items-center gap-2 bg-green-900 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors ml-0 md:ml-2 mt-2 md:mt-0"
//         >
//           Change Notification Preferences
//         </button>
//       )}

//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
//           <div className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl relative">
//             <button
//               onClick={() => setShowForm(false)}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
//               title="Close"
//             >
//               &times;
//             </button>

//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center mb-4">
//                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
//                   <span className="text-white font-bold text-lg">L</span>
//                 </div>
//                 <span className="text-xl font-semibold text-gray-800">Notification Preferences</span>
//               </div>
//               <p className="text-sm text-gray-600">
//                 Select boxes below for information you would like to receive.
//               </p>
//             </div>

//             <div className="p-6">
//               <div className="mb-8">
//                 <h3 className="text-lg font-medium text-gray-900 mb-6">Content</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {[
//                     {
//                       key: 'bookingConfirmation',
//                       label: 'Booking Confirmation',
//                       description: 'Receive updates about your booking confirmations'
//                     },
//                     {
//                       key: 'cancellationAlert',
//                       label: 'Cancellation Alert',
//                       description: 'Alerts for booking cancellations'
//                     },
//                     {
//                       key: 'adminAnnouncements',
//                       label: 'Admin Announcements',
//                       description: 'Important updates from administrators'
//                     },
//                     {
//                       key: 'bookingReminder',
//                       label: 'Booking Reminder',
//                       description: 'Reminders for upcoming bookings'
//                     }
//                   ].map(({ key, label, description }) => (
//                     <div key={key} className="spaceied">
//                       <label className="flex items-start space-x-3">
//                         <input
//                           type="checkbox"
//                           checked={preferences[key].email}
//                           onChange={(e) => handleChange(key, 'email', e.target.checked)}
//                           className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
//                         />
//                         <div>
//                           <div className="font-medium text-gray-900">{label} (Email)</div>
//                           <div className="text-sm text-gray-500 mt-1">{description}</div>
//                         </div>
//                       </label>
//                       <label className="flex items-start space-x-3 mt-3">
//                         <input
//                           type="checkbox"
//                           checked={preferences[key].inApp}
//                           onChange={(e) => key !== 'bookingReminder' && handleChange(key, 'inApp', e.target.checked)}
//                           disabled={key === 'bookingReminder'}
//                           className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1 disabled:opacity-50"
//                         />
//                         <div>
//                           <div className="font-medium text-gray-900">{label} (In-App)</div>
//                           <div className="text-sm text-gray-500 mt-1">{description}</div>
//                         </div>
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex justify-center">
//                 <button
//                   type="button"
//                   onClick={handleSubmit}
//                   disabled={saving}
//                   className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//                 >
//                   {saving ? "Saving..." : "Update Preferences"}
//                 </button>
//               </div>

//               {message && (
//                 <div className={`mt-4 p-3 rounded-md text-sm text-center ${
//                   message.includes("successfully") 
//                     ? "bg-green-50 text-green-800" 
//                     : "bg-red-50 text-red-800"
//                 }`}>
//                   {message}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationPreferences;

import React, { useEffect, useState } from "react";

const defaultPreferences = {
  bookingConfirmation: { email: true, inApp: true },
  cancellationAlert: { email: true, inApp: true },
  adminAnnouncements: { email: true, inApp: true },
  bookingReminder: { email: true, inApp: true }
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
        const response = await fetch('/api/notifications/preferences', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        setPreferences(data || defaultPreferences);
      } catch (err) {
        console.error("Error loading preferences:", err);
        setMessage(err.message || "Failed to load preferences.");
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleChange = (category, type, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: { ...prev[category], [type]: value }
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...preferences,
          bookingReminder: { ...preferences.bookingReminder, inApp: true }
        })
      });
      const data = await response.json();
      setPreferences(data);
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-center items-center">
          <div className="relative group">
            <button
              onClick={() => {
                setMessage("");
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-green-700 to-green-900 text-white px-6 py-3 rounded-lg shadow-lg hover:from-green-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Notification Preferences
            </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 -top-12 bg-green-500 text-white text-xs rounded py-1 px-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Update your notification preference
            </span>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
              title="Close"
            >
              ×
            </button>

            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center mb-4">
                {/* <div className="w-16 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">Notify</span>
                </div> */}
                <span className="text-xl font-semibold text-gray-800">Notification Preferences</span>
              </div>
              <p className="text-sm text-gray-600">
                Select how you would like to receive notifications for each category.
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    key: 'bookingConfirmation',
                    label: 'Booking Confirmation',
                    description: 'Receive updates about your booking confirmations'
                  },
                  {
                    key: 'cancellationAlert',
                    label: 'Cancellation Alert',
                    description: 'Alerts for booking cancellations'
                  },
                  {
                    key: 'adminAnnouncements',
                    label: 'Admin Announcements',
                    description: 'Important updates from administrators'
                  },
                  {
                    key: 'bookingReminder',
                    label: 'Booking Reminder',
                    description: 'Reminders for upcoming bookings'
                  }
                ].map(({ key, label, description }) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{label}</h3>
                    <p className="text-sm text-gray-500 mb-4">{description}</p>
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={preferences[key].email}
                          onChange={(e) => handleChange(key, 'email', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Email</div>
                          <div className="text-sm text-gray-500">Receive notifications via email</div>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={preferences[key].inApp}
                          onChange={(e) => key !== 'bookingReminder' && handleChange(key, 'inApp', e.target.checked)}
                          disabled={key === 'bookingReminder'}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1 disabled:opacity-50"
                        />
                        <div>
                          <div className="font-medium text-gray-900">In-App</div>
                          <div className="text-sm text-gray-500">
                            {key === 'bookingReminder' 
                              ? 'Mandatory in-app notifications for reminders'
                              : 'Receive notifications in the app'}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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