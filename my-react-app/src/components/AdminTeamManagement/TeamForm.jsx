import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { teamColors } from '../../utils/teamColors';

const TeamForm = ({ existingTeam, onSuccess, onCancel }) => {
  const [teamName, setTeamName] = useState(existingTeam?.teamName || '');
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(existingTeam?.color || '');
  const [colorOptions, setColorOptions] = useState([]);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const res = await axios.get("/api/teams");
        const usedColors = res.data.map(t => t.color);
        const available = teamColors.filter(c => !usedColors.includes(c));

        // Make sure current color is always shown in case it's already used
        const finalColors = existingTeam && existingTeam.color && !available.includes(existingTeam.color)
          ? [existingTeam.color, ...available]
          : available;

        setColorOptions(finalColors);
        if (!existingTeam) setSelectedColor(finalColors[0]);
      } catch (err) {
        console.error("Error fetching colors", err);
      }
    };
    fetchColors();
  }, [existingTeam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName) return toast.warning("Team name is required");
    if (!selectedColor) return toast.warning("Team color is required");
    setLoading(true);

    try {
      if (existingTeam) {
        await axios.put(`/api/teams/${existingTeam._id}`, {
          teamName,
          color: selectedColor
        });
        toast.success(`Team "${teamName}" updated successfully!`);
      } else {
        const res = await axios.get("/api/teams");
        const existingTeams = res.data;

        const generateNextTeamId = () => {
          const last = existingTeams[existingTeams.length - 1];
          const lastId = last?.teamId?.replace(/\D/g, '') || '0';
          const nextNum = String(parseInt(lastId) + 1).padStart(3, '0');
          return `T${nextNum}`;
        };

        const newTeam = {
          teamId: generateNextTeamId(),
          teamName,
          color: selectedColor,
        };

        await axios.post("/api/teams", newTeam);
        toast.success(`Team "${teamName}" added successfully with color "${selectedColor}"`);
      }

      onSuccess();
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

      {colorOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Team Color</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color, idx) => (
              <span
                key={idx}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 transition duration-150 ${color} ${
                  selectedColor === color ? 'border-black scale-110' : 'border-transparent'
                }`}
                title={color}
              ></span>
            ))}
          </div>
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
