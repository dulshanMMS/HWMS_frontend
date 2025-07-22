import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { teamColors } from '../../utils/teamColors';

const TeamForm = ({ existingTeam, onSuccess, onCancel }) => {
  const [teamName, setTeamName] = useState(existingTeam?.teamName || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName) return toast.warning("Team name is required");
    setLoading(true);

    try {
        if (existingTeam) {
            // Edit team (only name)
            await axios.put(`/api/teams/${existingTeam._id}`, { teamName });
            toast.success(`Team "${teamName}" updated successfully!`);
        } else {
            // Add team (we must generate teamId + color)
            const res = await axios.get("/api/teams"); // fetch existing to generate
            const existingTeams = res.data;

            const generateNextTeamId = () => {
                const last = existingTeams[existingTeams.length - 1];
                const lastId = last?.teamId?.replace(/\D/g, '') || '0';
                const nextNum = String(parseInt(lastId) + 1).padStart(3, '0');
                return `T${nextNum}`;
            };

            const usedColors = existingTeams.map(t => t.color);
            const getUnusedColor = () => {
                const unused = teamColors.find(c => !usedColors.includes(c));
                return unused || teamColors[Math.floor(Math.random() * teamColors.length)];
            };

            const color = getUnusedColor();
            const newTeam = {
                teamId: generateNextTeamId(),
                teamName,
                color,
            };

            await axios.post("/api/teams", newTeam);
            toast.success(`Team "${teamName}" added successfully with color "${color}"`);
        }
        onSuccess(); // refresh
        } catch (err) {
            console.error("Error saving team:", err);
            if (err.response && err.response.status === 409) {
                toast.error("Team name already exists. Please choose another.");
            } else {
                toast.error("Failed to save team");
            }
        } finally {
        setLoading(false);
        }
    };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Team Name</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>

      {existingTeam?.color && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Current Team Color:</span>
          <span className={`inline-block w-4 h-4 rounded-full ${existingTeam.color}`} />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;
