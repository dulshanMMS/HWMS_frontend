import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { teamColors } from '../../utils/teamColors';
import Select from 'react-select';

const TeamForm = ({ existingTeam, onSuccess, onCancel }) => {
  const [teamName, setTeamName] = useState(existingTeam?.teamName || '');
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(existingTeam?.color || '');
  const [colorOptions, setColorOptions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedAddUser, setSelectedAddUser] = useState(null);
  const [selectedRemoveUser, setSelectedRemoveUser] = useState(null);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const res = await axios.get('/api/teams');
        const usedColors = res.data.map((t) => t.color);
        const available = teamColors.filter((c) => !usedColors.includes(c));
        const finalColors =
          existingTeam && existingTeam.color && !available.includes(existingTeam.color)
            ? [existingTeam.color, ...available]
            : available;
        setColorOptions(finalColors);
        if (!existingTeam) setSelectedColor(finalColors[0]);
      } catch (err) {
        console.error('Error fetching colors', err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/teams/users');
        setAllUsers(res.data);
      } catch (err) {
        toast.error('Failed to fetch users');
      }
    };

    const fetchTeamMembers = async () => {
      if (!existingTeam?.teamId) return;
      try {
        const res = await axios.get(`/api/user?teamId=${existingTeam.teamId}`);
        setTeamMembers(res.data || []);
      } catch (err) {
        console.error('Failed to fetch team members', err);
      }
    };

    fetchColors();
    fetchUsers();
    fetchTeamMembers();
  }, [existingTeam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName) return toast.warning('Team name is required');
    if (!selectedColor) return toast.warning('Team color is required');
    setLoading(true);

    try {
      if (existingTeam) {
        await axios.put(`/api/teams/${existingTeam._id}`, {
          teamName,
          color: selectedColor,
          addUserId: selectedAddUser?.value || '',
          removeUserId: selectedRemoveUser?.value || '',
        });
        toast.success(`Team "${teamName}" updated successfully!`);
      } else {
        const res = await axios.get('/api/teams');
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
        await axios.post('/api/teams', newTeam);
        toast.success(`Team "${teamName}" added successfully with color "${selectedColor}"`);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving team:', err);
      if (err.response && err.response.status === 409) {
        toast.error('Team name already exists. Please choose another.');
      } else {
        toast.error('Failed to save team');
      }
    } finally {
      setLoading(false);
    }
  };

  const teamMemberIds = teamMembers.map((m) => String(m._id));
  const addableUsers = allUsers.filter((user) => !teamMemberIds.includes(String(user._id)));
  const removableUsers = allUsers.filter((user) => teamMemberIds.includes(String(user._id)));

  const formatUserOption = (user) => {
    const fullName =
      user.firstName || user.lastName
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : '';

    const userName = user.username || '';

    return {
      value: user._id,
      label: fullName
        ? `${fullName} (${userName})`
        : userName ? userName : 'Unnamed',
    };
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-lg space-y-4 w-full max-w-xl"
    >
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

      {existingTeam && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Add new member:</label>
            <Select
              value={selectedAddUser}
              onChange={setSelectedAddUser}
              options={addableUsers.map(formatUserOption)}
              isClearable
              placeholder="Select member"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Remove member:</label>
            <Select
              value={selectedRemoveUser}
              onChange={setSelectedRemoveUser}
              options={removableUsers.map(formatUserOption)}
              isClearable
              placeholder="Select member"
            />
          </div>
        </>
      )}

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Team Color:</label>
        <button
          type="button"
          className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-sm bg-white shadow-sm"
          onClick={() => setShowColorDropdown(!showColorDropdown)}
        >
          <span className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full ${selectedColor}`} />
            {selectedColor}
          </span>
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 9l-7 7-7-7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {showColorDropdown && (
          <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow z-50 w-full max-h-56 overflow-y-auto overflow-x-hidden">
            {colorOptions.map((clr) => (
              <li
                key={clr}
                onClick={() => {
                  setSelectedColor(clr);
                  setShowColorDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                <span className={`w-4 h-4 rounded-full ${clr}`} />
                {clr}
              </li>
            ))}
          </ul>
        )}
      </div>

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
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;
