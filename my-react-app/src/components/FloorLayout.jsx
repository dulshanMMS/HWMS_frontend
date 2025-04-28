import { useState, useEffect, useRef } from 'react';
import Seat from './seat';
import TableGroup from './TableGroup';
import { getBookings, bookSeat, unbookSeat } from '../api/bookingAPI';

export default function FloorLayout() {
  const [memberId, setMemberId] = useState("");
  const [role, setRole] = useState("member");
  const [teamName, setTeamName] = useState("");
  const [entered, setEntered] = useState(false);
  const [bookedChairs, setBookedChairs] = useState({});
  const [userBooking, setUserBooking] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMemberPrompt, setShowAddMemberPrompt] = useState(false);
  const [showAddMemberNamePopUp, setShowAddMemberNamePopUp] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [memberDetails, setMemberDetails] = useState(null);
  const memberNameInputRef = useRef(null);

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
        setBookedChairs({});
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
      <div className="bg-white p-3 rounded-lg shadow-lg border border-green-300">
        <p className="text-gray-800 mb-2">{message}</p>
        <button
          className="bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 transition-all"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );

  const AddMemberPrompt = ({ onYes, onNo }) => (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-3 rounded-lg shadow-lg border border-green-300">
        <p className="text-gray-800 mb-2">Do you want to book for another member?</p>
        <div className="flex gap-1">
          <button
            className="bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 transition-all"
            onClick={onYes}
          >
            Yes
          </button>
          <button
            className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-all"
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
      <div className="bg-white p-3 rounded-lg shadow-lg border border-green-300">
        <p className="text-gray-800 mb-2">Enter the name of the new team member:</p>
        <input
          ref={memberNameInputRef}
          className="border border-green-400 rounded-md px-2 py-1 mb-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400"
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
            className="bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 transition-all"
            onClick={onSubmit}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );

  const checkMemberExists = async (memberId) => {
    try {
      console.log("Sending request to check member with ID:", memberId);
      const response = await fetch('/api/teams/checkMember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      });
      const data = await response.json();
      console.log("Response from checkMember:", data);
      return data;
    } catch (error) {
      console.error('Error checking member:', error);
      showMessage("Failed to verify member. Please try again.");
      return { exists: false };
    }
  };

  const handleJoin = async () => {
    if (!memberId.trim()) {
      showMessage("Please enter your member ID");
      return;
    }

    const memberData = await checkMemberExists(memberId);
    if (!memberData.exists) {
      showMessage("You are not registered in the database. Please contact the administrator.");
      return;
    }

    setMemberDetails(memberData);
    setTeamName(memberData.teamName);
    setRole(memberData.role);
    setEntered(true);
    if (memberData.role === "leader") {
      setTeamMembers([memberData.memberName]);
      setSelectedMember(memberData.memberName);
    }
  };

  const handleChairClick = (chairId, roomId) => {
    if (!entered || !memberDetails) {
      showMessage("Please join with a valid member ID first.");
      return;
    }

    if (role === "member") {
      if (userBooking && userBooking.chairId !== chairId) {
        showMessage("You can only book one seat.");
        return;
      }

      setBookedChairs((prev) => {
        const updated = { ...prev };
        if (updated[chairId]) {
          if (updated[chairId].memberName === memberDetails?.memberName) {
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
          const bookingDetails = {
            roomId,
            userName: memberDetails.memberName,
            teamName,
            role,
            teamColor: memberDetails.teamColor,
            memberName: memberDetails.memberName
          };
          console.log("Booking seat (member):", bookingDetails);
          bookSeat(chairId, bookingDetails)
            .then(() => {
              updated[chairId] = {
                memberName: memberDetails.memberName,
                teamColor: memberDetails.teamColor
              };
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

      const memberHasBooking = Object.values(bookedChairs).some(
        (chair) => chair?.memberName === selectedMember
      );
      if (memberHasBooking && bookedChairs[chairId]?.memberName !== selectedMember) {
        showMessage(`${selectedMember} already has a booked seat. Please unbook their current seat first.`);
        return;
      }

      setBookedChairs((prev) => {
        const updated = { ...prev };
        if (updated[chairId]) {
          if (updated[chairId].memberName === selectedMember) {
            unbookSeat(roomId, chairId)
              .then(() => {
                delete updated[chairId];
                if (selectedMember === memberDetails?.memberName) setUserBooking(null);
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
          const bookingDetails = {
            roomId,
            userName: memberDetails.memberName,
            teamName,
            role,
            selectedMember,
            teamColor: memberDetails.teamColor,
            memberName: selectedMember
          };
          console.log("Booking seat (leader):", bookingDetails);
          bookSeat(chairId, bookingDetails)
            .then(() => {
              updated[chairId] = {
                memberName: selectedMember,
                teamColor: memberDetails.teamColor
              };
              if (selectedMember === memberDetails?.memberName) setUserBooking({ chairId, roomId });
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
      (chairId) => bookedChairs[chairId]?.memberName === (role === "leader" ? selectedMember : memberDetails?.memberName)
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
          if (role === "member" || (role === "leader" && selectedMember === memberDetails?.memberName)) {
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
      (chairId) => bookedChairs[chairId]?.memberName === (role === "leader" ? selectedMember : memberDetails?.memberName)
    );

    if (!bookedSeat) {
      showMessage("Please book a seat before submitting.");
      return;
    }

    if (role === "member") {
      showMessage("Booking submitted successfully!");
      setEntered(false);
      setMemberId("");
      setTeamName("");
      setRole("member");
      setUserBooking(null);
      setMemberDetails(null);
    } else if (role === "leader") {
      showMessage("Booking submitted successfully!");
      setShowAddMemberPrompt(true);
    }
  };

  const handleCancel = () => {
    setEntered(false);
    setMemberId("");
    setTeamName("");
    setRole("member");
    setUserBooking(null);
    setTeamMembers([]);
    setSelectedMember("");
    setMemberDetails(null);
  };

  const handleAddMemberPromptYes = () => {
    setShowAddMemberPrompt(false);
    setShowAddMemberNamePopUp(true);
    setNewMemberName("");
    setMessage(null);
  };

  const handleAddMemberPromptNo = () => {
    setShowAddMemberPrompt(false);
    setEntered(false);
    setMemberId("");
    setTeamName("");
    setRole("member");
    setTeamMembers([]);
    setSelectedMember("");
    setUserBooking(null);
    setMemberDetails(null);
    setMessage(null);
  };

  const handleAddMemberSubmit = () => {
    if (newMemberName && !teamMembers.includes(newMemberName)) {
      setTeamMembers((prev) => [...prev, newMemberName]);
      setSelectedMember(newMemberName);
      setNewMemberName("");
      setShowAddMemberNamePopUp(false);
      setMessage(null);
      setEntered(true);
    } else if (teamMembers.includes(newMemberName)) {
      setMessage("This member is already in the team.");
      setNewMemberName("");
      setShowAddMemberNamePopUp(false);
    } else {
      setMessage("Please enter a valid member name.");
    }
  };

  const addTeamMember = () => {
    setShowAddMemberPrompt(true);
  };

  const hasBookedSeat = () => {
    return Object.values(bookedChairs).some(
      (chair) => chair?.memberName === (role === "leader" ? selectedMember : memberDetails?.memberName)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <p className="text-gray-800 text-base font-semibold">Loading...</p>
      </div>
    );
  }

  console.log("Rendering FloorLayout with bookedChairs:", bookedChairs);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-green-50 to-green-100 pt-4 pb-20">
      <div className="w-[42vw] flex flex-col items-center">
        {!entered && (
          <div className="mb-2 flex gap-2 bg-white p-3 rounded-xl shadow-lg border border-green-300">
            <input
              className="border border-green-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400"
              placeholder="Enter your member ID (e.g., M001)"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
            <button
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
              onClick={handleJoin}
            >
              Join
            </button>
          </div>
        )}

        {entered && role === "leader" && (
          <div className="mb-2 flex gap-2 bg-white p-3 rounded-xl shadow-lg border border-green-300">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Book a seat for:
              </label>
              <select
                className="border border-green-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
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
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
              onClick={addTeamMember}
            >
              Add Team Member
            </button>
          </div>
        )}

        <div className="flex w-full h-[50vh] gap-2 pt-2 pb-2">
          <div className="w-2/5 flex flex-col gap-2">
            {["T1", "T2", "T3", "T4"].map((roomId, index) => (
              <div
                key={roomId}
                className="flex-1 bg-white rounded-xl shadow-lg border border-green-300 flex flex-col gap-2 p-2"
              >
                {/* Top Seats (4 seats) */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 4 }, (_, i) => {
                    const chairId = `${roomId}-chair${i + 1}`;
                    console.log(`Rendering Seat ${chairId}:`, bookedChairs[chairId]);
                    return (
                      <Seat
                        key={i}
                        chairId={chairId}
                        roomId={roomId}
                        bookedChairs={bookedChairs}
                        onClick={entered ? handleChairClick : () => {}}
                        label={`Seat-${i + 1}`}
                      />
                    );
                  })}
                </div>

                {/* Table in the Center */}
                <div className="flex justify-center">
                  <TableGroup tableNumber={index + 1} />
                </div>

                {/* Bottom Seats (4 seats) */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 4 }, (_, i) => {
                    const chairId = `${roomId}-chair${i + 5}`;
                    console.log(`Rendering Seat ${chairId}:`, bookedChairs[chairId]);
                    return (
                      <Seat
                        key={i + 4}
                        chairId={chairId}
                        roomId={roomId}
                        bookedChairs={bookedChairs}
                        onClick={entered ? handleChairClick : () => {}}
                        label={`Seat-${i + 5}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="w-1/5 h-full flex items-center justify-center bg-green-100 rounded-xl shadow-lg border border-green-300">
            <span className="text-xl font-bold text-green-800">Lobby</span>
          </div>

          <div className="w-2/5 flex flex-col gap-2">
            {["T5", "T6", "T7", "T8"].map((roomId, index) => (
              <div
                key={roomId}
                className="flex-1 bg-white rounded-xl shadow-lg border border-green-300 flex flex-col gap-2 p-2"
              >
                {/* Top Seats (4 seats) */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 4 }, (_, i) => {
                    const chairId = `${roomId}-chair${i + 1}`;
                    console.log(`Rendering Seat ${chairId}:`, bookedChairs[chairId]);
                    return (
                      <Seat
                        key={i}
                        chairId={chairId}
                        roomId={roomId}
                        bookedChairs={bookedChairs}
                        onClick={entered ? handleChairClick : () => {}}
                        label={`Seat-${i + 1}`}
                      />
                    );
                  })}
                </div>

                {/* Table in the Center */}
                <div className="flex justify-center">
                  <TableGroup tableNumber={index + 5} />
                </div>

                {/* Bottom Seats (4 seats) */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 4 }, (_, i) => {
                    const chairId = `${roomId}-chair${i + 5}`;
                    console.log(`Rendering Seat ${chairId}:`, bookedChairs[chairId]);
                    return (
                      <Seat
                        key={i + 4}
                        chairId={chairId}
                        roomId={roomId}
                        bookedChairs={bookedChairs}
                        onClick={entered ? handleChairClick : () => {}}
                        label={`Seat-${i + 5}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {entered && (
          <div className="mt-2 flex gap-2 bg-white p-3 rounded-xl shadow-lg border border-green-300">
            {role === "member" && (
              <button
                className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
            <button
              className={`px-3 py-1 rounded-md transition-all shadow-md hover:shadow-lg ${
                hasBookedSeat()
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleUnbook}
              disabled={!hasBookedSeat()}
            >
              Unbook
            </button>
            <button
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        )}
      </div>


      
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
  );
}