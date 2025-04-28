import { useState, useEffect, useRef } from 'react';
import Seat from './seat';
import TableGroup from './TableGroup';
import { getBookings, bookSeat, unbookSeat } from '../api/bookingAPI';

export default function FloorLayout() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("member");
  const [teamName, setTeamName] = useState("");
  const [entered, setEntered] = useState(false);
  const [bookedChairs, setBookedChairs] = useState({});
  const [userBooking, setUserBooking] = useState(null); // Store { chairId, roomId }
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [message, setMessage] = useState(null); // Pop-up message state
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [showAddMemberPrompt, setShowAddMemberPrompt] = useState(false); // For "Do you want to book for another member?" pop-up
  const [showAddMemberNamePopUp, setShowAddMemberNamePopUp] = useState(false); // For "Add member name" pop-up
  const [newMemberName, setNewMemberName] = useState(""); // For new member name input in pop-up
  const memberNameInputRef = useRef(null); // Ref for focusing the input field

  useEffect(() => {
    setIsLoading(true);
    getBookings()
      .then((data) => {
        setBookedChairs(data.chairs || {});
        console.log("Initial booked chairs:", data.chairs || {});
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err.message);
        setMessage("Failed to fetch bookings from backend: " + err.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (showAddMemberNamePopUp && memberNameInputRef.current) {
      memberNameInputRef.current.focus();
    }
  }, [showAddMemberNamePopUp]);

  const showMessage = (msg) => {
    setMessage(msg);
  };

  const closeMessage = () => {
    setMessage(null);
  };

  const PopUp = ({ message, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-4 rounded-lg shadow-lg border border-green-200">
        <p className="text-gray-800 mb-3">{message}</p>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-all"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );

  const AddMemberPrompt = ({ onYes, onNo }) => (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-4 rounded-lg shadow-lg border border-green-200">
        <p className="text-gray-800 mb-3">Do you want to book for another member?</p>
        <div className="flex gap-2">
          <button
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-all"
            onClick={onYes}
          >
            Yes
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-all"
            onClick={onNo}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );

  const AddMemberNamePopUp = ({ onSubmit, onChange, value }) => (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-4 rounded-lg shadow-lg border border-green-200">
        <p className="text-gray-800 mb-3">Enter the name of the new team member:</p>
        <input
          ref={memberNameInputRef}
          className="border border-green-300 rounded-md px-2 py-1 mb-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-400"
          placeholder="Member name"
          value={value}
          onChange={onChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          autoFocus
        />
        <div className="flex justify-end">
          <button
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-all"
            onClick={onSubmit}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );

  const handleChairClick = (chairId, roomId) => {
    if (!username || !entered) return;

    if (role === "member") {
      if (userBooking && userBooking.chairId !== chairId) {
        showMessage("You can only book one seat.");
        return;
      }

      setBookedChairs((prev) => {
        const updated = { ...prev };
        if (updated[chairId]) {
          if (updated[chairId] === username) {
            unbookSeat(roomId, chairId)
              .then(() => {
                delete updated[chairId];
                setUserBooking(null);
                console.log("After unbooking (member):", updated);
              })
              .catch((err) => {
                console.error("Failed to unbook seat:", err.message);
                showMessage("Failed to unbook seat: " + err.message + ". Please try again.");
              });
          } else {
            showMessage("This chair is already booked.");
            return prev;
          }
        } else {
          bookSeat(chairId, { roomId, userName: username, teamName, role })
            .then(() => {
              updated[chairId] = username;
              setUserBooking({ chairId, roomId });
              console.log("After booking (member):", updated);
            })
            .catch((err) => {
              console.error("Failed to book seat:", err.message);
              showMessage("Failed to book seat: " + err.message + ". Please try again.");
              return prev;
            });
        }
        return updated;
      });
    } else if (role === "leader") {
      if (!selectedMember) {
        showMessage("Please select a team member to book for.");
        return;
      }

      // Check if the selected member already has a booked seat
      const memberHasBooking = Object.values(bookedChairs).includes(selectedMember);
      if (memberHasBooking && bookedChairs[chairId] !== selectedMember) {
        showMessage(`${selectedMember} already has a booked seat. Please unbook their current seat first.`);
        return;
      }

      setBookedChairs((prev) => {
        const updated = { ...prev };
        if (updated[chairId]) {
          if (updated[chairId] === selectedMember) {
            unbookSeat(roomId, chairId)
              .then(() => {
                delete updated[chairId];
                if (selectedMember === username) setUserBooking(null);
                console.log("After unbooking (leader):", updated);
              })
              .catch((err) => {
                console.error("Failed to unbook seat:", err.message);
                showMessage("Failed to unbook seat: " + err.message + ". Please try again.");
              });
          } else {
            showMessage("This chair is already booked.");
            return prev;
          }
        } else {
          bookSeat(chairId, { roomId, userName: username, teamName, role, selectedMember })
            .then(() => {
              updated[chairId] = selectedMember;
              if (selectedMember === username) setUserBooking({ chairId, roomId });
              console.log("After booking (leader):", updated);
            })
            .catch((err) => {
              console.error("Failed to book seat for", selectedMember, ":", err.message);
              showMessage(`Failed to book seat for ${selectedMember}: ${err.message}. Please try again.`);
              return prev;
            });
        }
        return updated;
      });
    }
  };

  const handleUnbook = () => {
    if (Object.keys(bookedChairs).length === 0) {
      showMessage("No bookings available to unbook.");
      return;
    }

    const chairToUnbook = Object.keys(bookedChairs).find(
      (chairId) => bookedChairs[chairId] === (role === "leader" ? selectedMember : username)
    );

    if (!chairToUnbook) {
      showMessage("No seat booked to unbook.");
      return;
    }

    console.log("Unbooking chair:", chairToUnbook);
    const roomIdParts = chairToUnbook.split('-');
    if (roomIdParts.length < 2) {
      showMessage("Invalid chair ID format. Unable to unbook.");
      return;
    }
    const roomId = roomIdParts[0];
    console.log("Extracted roomId:", roomId);

    setBookedChairs((prev) => {
      const updated = { ...prev };
      unbookSeat(roomId, chairToUnbook)
        .then(() => {
          delete updated[chairToUnbook];
          if (role === "member" || (role === "leader" && selectedMember === username)) {
            setUserBooking(null);
          }
          showMessage(`Seat ${chairToUnbook} unbooked successfully!`);
          console.log("After unbooking:", updated);
        })
        .catch((err) => {
          console.error("Failed to unbook seat:", err.message);
          showMessage(`Failed to unbook seat (${chairToUnbook}): ${err.message}. Please try again.`);
        });
      return updated;
    });
  };

  const handleSubmit = () => {
    const bookedSeat = Object.keys(bookedChairs).find(
      (chairId) => bookedChairs[chairId] === (role === "leader" ? selectedMember : username)
    );

    if (!bookedSeat) {
      showMessage("Please book a seat before submitting.");
      return;
    }

    if (role === "member") {
      showMessage("Booking submitted successfully!");
      // Reset to first view for team member
      setEntered(false);
      setUsername("");
      setTeamName("");
      setRole("member");
      setUserBooking(null);
    } else if (role === "leader") {
      showMessage("Booking submitted successfully!");
      // Show the "Do you want to book for another member?" pop-up
      setShowAddMemberPrompt(true);
    }
  };

  const handleCancel = () => {
    // Reset to first view for team member
    setEntered(false);
    setUsername("");
    setTeamName("");
    setRole("member");
    setUserBooking(null);
    setTeamMembers([]);
    setSelectedMember("");
  };

  const handleAddMemberPromptYes = () => {
    setShowAddMemberPrompt(false);
    setShowAddMemberNamePopUp(true);
    setNewMemberName(""); // Reset the input field
    setMessage(null); // Clear the "Booking submitted successfully" message
  };

  const handleAddMemberPromptNo = () => {
    setShowAddMemberPrompt(false);
    // Reset to first view
    setEntered(false);
    setUsername("");
    setTeamName("");
    setRole("member");
    setTeamMembers([]);
    setSelectedMember("");
    setUserBooking(null);
    setMessage(null); // Clear the "Booking submitted successfully" message
  };

  const handleAddMemberSubmit = () => {
    if (newMemberName && !teamMembers.includes(newMemberName)) {
      setTeamMembers((prev) => [...prev, newMemberName]);
      setSelectedMember(newMemberName);
      setNewMemberName(""); // Clear the input
      setShowAddMemberNamePopUp(false); // Close the pop-up
      setMessage(null); // Clear any previous message
      setEntered(true); // Go back to booking view
    } else if (teamMembers.includes(newMemberName)) {
      setMessage("This member is already in the team.");
      setNewMemberName("");
      setShowAddMemberNamePopUp(false);
    } else {
      setMessage("Please enter a valid member name.");
    }
  };

  const handleJoin = () => {
    if (username.trim() && teamName.trim()) {
      setEntered(true);
      if (role === "leader") {
        setTeamMembers([username]);
        setSelectedMember(username);
      }
    } else {
      showMessage("Please enter your name and team name");
    }
  };

  const addTeamMember = () => {
    setShowAddMemberPrompt(true);
  };

  const hasBookedSeat = () => {
    return Object.values(bookedChairs).includes(role === "leader" ? selectedMember : username);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <p className="text-gray-800 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="w-[70vw] h-[70vh] flex flex-col items-center">
        {/* Input Section */}
        {!entered && (
          <div className="mb-3 flex gap-2 bg-white p-3 rounded-lg shadow-md border border-green-200">
            <input
              className="border border-green-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-400"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <select
              className="border border-green-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="leader">Team Leader</option>
              <option value="member">Team Member</option>
            </select>
            <input
              className="border border-green-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-400"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            <button
              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-all shadow-sm hover:shadow-md cursor-pointer"
              onClick={handleJoin}
            >
              Join
            </button>
          </div>
        )}

        {/* Team Management for Leader */}
        {entered && role === "leader" && (
          <div className="mb-3 flex gap-2 bg-white p-3 rounded-lg shadow-md border border-green-200">
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1">
                Book a seat for:
              </label>
              <select
                className="border border-green-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">Select a member</option>
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-all shadow-sm hover:shadow-md cursor-pointer"
              onClick={addTeamMember}
            >
              Add Team Member
            </button>
          </div>
        )}

        {/* Floor Layout Visualization */}
        <div className="flex w-full h-full gap-2 pt-1 pb-1">
          {/* Left side tables (T1-T4) */}
          <div className="w-2/5 flex flex-col gap-1 pt-1 pb-1">
            {["T1", "T2", "T3", "T4"].map((roomId, index) => (
              <div key={roomId} className="flex-1 bg-white rounded-lg shadow-sm border border-green-200 flex flex-col items-center gap-1 pt-1 pb-1">
                <div className="grid grid-cols-4 gap-1 mx-auto">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Seat
                      key={i}
                      chairId={`${roomId}-chair${i + 1}`}
                      roomId={roomId}
                      bookedChairs={bookedChairs}
                      onClick={entered ? handleChairClick : () => {}}
                      label={`Seat-${i + 1}`}
                    />
                  ))}
                </div>
                <TableGroup tableNumber={index + 1} />
                <div className="grid grid-cols-4 gap-1 mx-auto">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Seat
                      key={i + 4}
                      chairId={`${roomId}-chair${i + 5}`}
                      roomId={roomId}
                      bookedChairs={bookedChairs}
                      onClick={entered ? handleChairClick : () => {}}
                      label={`Seat-${i + 5}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Lobby */}
          <div className="w-1/5 flex items-center justify-center bg-green-100 rounded-lg shadow-sm border border-green-200">
            <span className="text-xl font-bold text-green-800">
              Lobby
            </span>
          </div>

          {/* Right side tables (T5-T8) */}
          <div className="w-2/5 flex flex-col gap-1 pt-1 pb-1">
            {["T5", "T6", "T7", "T8"].map((roomId, index) => (
              <div key={roomId} className="flex-1 bg-white rounded-lg shadow-sm border border-green-200 flex flex-col items-center gap-1 pt-1 pb-1">
                <div className="grid grid-cols-4 gap-1 mx-auto">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Seat
                      key={i}
                      chairId={`${roomId}-chair${i + 1}`}
                      roomId={roomId}
                      bookedChairs={bookedChairs}
                      onClick={entered ? handleChairClick : () => {}}
                      label={`Seat-${i + 1}`}
                    />
                  ))}
                </div>
                <TableGroup tableNumber={index + 5} />
                <div className="grid grid-cols-4 gap-1 mx-auto">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Seat
                      key={i + 4}
                      chairId={`${roomId}-chair${i + 5}`}
                      roomId={roomId}
                      bookedChairs={bookedChairs}
                      onClick={entered ? handleChairClick : () => {}}
                      label={`Seat-${i + 5}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unbook, Cancel, and Submit Buttons */}
        {entered && (
          <div className="mt-3 flex gap-2 bg-white p-3 rounded-lg shadow-md border border-green-200">
            {role === "member" && (
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-all shadow-sm hover:shadow-md cursor-pointer"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
            <button
              className={`px-3 py-1 rounded-md transition-all shadow-sm hover:shadow-md cursor-pointer ${
                hasBookedSeat()
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleUnbook}
              disabled={!hasBookedSeat()}
            >
              Unbook
            </button>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-all shadow-sm hover:shadow-md cursor-pointer"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        )}

        {/* Pop-Up Messages */}
        {message && <PopUp message={message} onClose={closeMessage} />}
        {showAddMemberPrompt && (
          <AddMemberPrompt
            onYes={handleAddMemberPromptYes}
            onNo={handleAddMemberPromptNo}
          />
        )}
        {showAddMemberNamePopUp && (
          <AddMemberNamePopUp
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            onSubmit={handleAddMemberSubmit}
          />
        )}
      </div>
    </div>
  );
}