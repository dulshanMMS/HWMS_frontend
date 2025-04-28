import { useState, useEffect } from 'react';
import Seat from './seat';
import TableGroup from './TableGroup';
import { getBookings, bookSeat, unbookSeat } from '../api/bookingAPI';

export default function FloorLayout() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("member");
  const [teamName, setTeamName] = useState("");
  const [entered, setEntered] = useState(false);
  const [bookedChairs, setBookedChairs] = useState({});
  const [userBookedChair, setUserBookedChair] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");

  useEffect(() => {
    getBookings()
      .then((data) => {
        setBookedChairs(data.chairs || {});
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err.message);
        alert("Failed to fetch bookings from backend: " + err.message);
      });
  }, []);

  const handleChairClick = (chairId, roomId) => {
    if (!username || !entered) return;

    if (role === "member") {
      if (userBookedChair && userBookedChair !== chairId) {
        alert("You can only book one seat.");
        return;
      }

      setBookedChairs((prev) => {
        const updated = { ...prev };
        if (updated[chairId]) {
          if (updated[chairId] === username) {
            unbookSeat(chairId)
              .then(() => {
                delete updated[chairId];
                setUserBookedChair(null);
              })
              .catch((err) => {
                console.error("Failed to unbook seat:", err.message);
                alert("Failed to unbook seat: " + err.message + ". Please try again.");
              });
          } else {
            alert("This chair is already booked.");
            return prev;
          }
        } else {
          bookSeat(chairId, { roomId, userName: username, teamName, role })
            .then((response) => {
              if (response.success) {
                updated[chairId] = username;
                setUserBookedChair(chairId);
              } else {
                alert(response.error || 'Failed to book seat');
              }
            })
            .catch((err) => {
              console.error("Failed to book seat:", err.message);
              alert("Failed to book seat: " + err.message + ". Please try again.");
            });
        }
        return updated;
      });
    } else if (role === "leader") {
      if (!selectedMember) {
        alert("Please select a team member to book for.");
        return;
      }

      setBookedChairs((prev) => {
        const updated = { ...prev };
        if (updated[chairId]) {
          if (updated[chairId] === selectedMember) {
            unbookSeat(chairId)
              .then(() => {
                delete updated[chairId];
                if (selectedMember === username) setUserBookedChair(null);
              })
              .catch((err) => {
                console.error("Failed to unbook seat:", err.message);
                alert("Failed to unbook seat: " + err.message + ". Please try again.");
              });
          } else {
            alert("This chair is already booked.");
            return prev;
          }
        } else {
          bookSeat(chairId, { roomId, userName: username, teamName, role, selectedMember })
            .then((response) => {
              if (response.success) {
                updated[chairId] = selectedMember;
                if (selectedMember === username) setUserBookedChair(chairId);
              } else {
                alert(response.error || 'Failed to book seat');
              }
            })
            .catch((err) => {
              console.error("Failed to book seat:", err.message);
              alert("Failed to book seat: " + err.message + ". Please try again.");
            });
        }
        return updated;
      });
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
      alert("Please enter your name and team name");
    }
  };

  const addTeamMember = () => {
    const memberName = prompt("Enter team member's name:");
    if (memberName && !teamMembers.includes(memberName)) {
      setTeamMembers((prev) => [...prev, memberName]);
    }
  };

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
                      onClick={handleChairClick}
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
                      onClick={handleChairClick}
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
                      onClick={handleChairClick}
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
                      onClick={handleChairClick}
                      label={`Seat-${i + 5}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}