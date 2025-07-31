import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { teamColors } from "../../utils/teamColors";

const TeamColorPalette = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTeam, setNewTeam] = useState({ teamName: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get("/api/teams");
      setTeams(response.data);
    } catch (error) {
      console.error("Failed to fetch team colors:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNextTeamId = () => {
    const lastTeam = teams[teams.length - 1];
    const lastId = lastTeam?.teamId?.replace(/\D/g, "") || "0";
    const nextNumber = String(parseInt(lastId) + 1).padStart(3, "0");
    return `T${nextNumber}`;
  };

  const usedColors = teams.map((t) => t.color);
  const getUnusedColor = () => {
    const unused = teamColors.find((c) => !usedColors.includes(c));
    return unused || teamColors[Math.floor(Math.random() * teamColors.length)];
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const teamId = generateNextTeamId();
      const color = getUnusedColor();
      if (!color) {
        toast.error("No unused colors available");
        return;
      }

      const response = await axios.post("/api/teams", {
        ...newTeam,
        teamId,
        color,
      });

      setNewTeam({ teamName: "" });
      setShowForm(false);
      setTeams((prev) => [...prev, response.data]);
      toast.success(`🎨 Team added with color ${color}`);
    } catch (error) {
      console.error("Error adding team:", error);
      toast.error("Failed to add team");
    } finally {
      setFormLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    setMembersLoading(true);
    try {
      const res = await axios.get(`/api/user/by-team?teamId=${teamId}`);
      setTeamMembers(res.data || []);
      setSelectedTeam(teamId);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("Could not load team members");
    } finally {
      setMembersLoading(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-600">Loading teams...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">🎯 Teams Color Palette</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-green-800 transition"
        >
          + Add Team
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddTeam}
          className="bg-blue-50 p-4 rounded-lg space-y-3 mb-4 border border-blue-200"
        >
          <input
            type="text"
            placeholder="Team Name"
            value={newTeam.teamName}
            onChange={(e) =>
              setNewTeam((prev) => ({ ...prev, teamName: e.target.value }))
            }
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            disabled={formLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full"
          >
            {formLoading ? "Adding..." : "Submit"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[16rem] overflow-y-auto pr-1">
        {teams.map((team, idx) => (
          <div
            key={idx}
            onClick={() => fetchTeamMembers(team.teamId)}
            className="cursor-pointer flex flex-col items-center p-3 border rounded-lg bg-white hover:shadow-md transition-all"
          >
            <span
              className={`w-4 h-4 rounded-full mb-1 ${team.color || "bg-gray-300"}`}
            ></span>
            <span className="text-sm font-medium text-center">
              {team.teamName}
            </span>
          </div>
        ))}
      </div>

      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in">
            <h3 className="text-lg font-bold mb-4">
              👥 Members of{" "}
              {teams.find((t) => t.teamId === selectedTeam)?.teamName}
            </h3>

            {membersLoading ? (
              <p>Loading members...</p>
            ) : teamMembers.length > 0 ? (
              <ul className="list-disc pl-4 space-y-1 max-h-60 overflow-y-auto text-sm text-gray-800">
                {teamMembers.map((m, i) => (
                  <li key={i}>
                    {(m.firstName || m.lastName)
                      ? `${m.firstName || ""} ${m.lastName || ""}`.trim()
                      : m.userName || "Unnamed Member"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No members in this team.</p>
            )}

            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamColorPalette;
