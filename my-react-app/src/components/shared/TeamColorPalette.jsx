import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const availableColors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500', 'bg-rose-500', 'bg-violet-500', 'bg-amber-500', 'bg-stone-500',
  'bg-gray-500', 'bg-slate-500', 'bg-neutral-500', 'bg-zinc-500', 'bg-sky-500', 'bg-fuchsia-500',
  'bg-brown-500', 'bg-maroon-500', 'bg-coffee-500', 'bg-wine', 'bg-darkorange', 'bg-cream', 'bg-ivory'
];

const TeamColorPalette = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTeam, setNewTeam] = useState({ teamName: '' });
  const [formLoading, setFormLoading] = useState(false);

  // For fetching team members
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams');
        setTeams(response.data);
      } catch (error) {
        console.error('Failed to fetch team colors:', error);
      } finally {
        setLoading(false);
      }
    };

  const generateNextTeamId = () => {
    const lastTeam = teams[teams.length - 1];
    const lastId = lastTeam?.teamId?.replace(/\D/g, '') || '0';
    const nextNumber = String(parseInt(lastId) + 1).padStart(3, '0');
    return `T${nextNumber}`;
  };

  const getUnusedColor = () => {
    const usedColors = teams.map(team => team.color);
    return availableColors.find(color => !usedColors.includes(color));
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const teamId = generateNextTeamId();
      const color = getUnusedColor();
      if (!color) {
        toast.error('No unused colors available');
        setFormLoading(false);
        return;
      }
      const response = await axios.post('/api/teams', { ...newTeam, teamId, color });
      setNewTeam({ teamName: '' });
      setShowForm(false);
      setTeams(prev => [...prev, response.data]);
      toast.success(`Team added successfully with color ${color}`);
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error('Failed to add team');
    } finally {
      setFormLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    setMembersLoading(true);
    try {
      const response = await axios.get(`/api/user?teamId=${teamId}`);
      setTeamMembers(response.data || []);
      setSelectedTeam(teamId);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setMembersLoading(false);
    }
  };

  if (loading) return <p>Loading team colors...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">Color Palette for Teams</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-800 hover:bg-green-700 text-white text-sm font-medium px-3 py-1 rounded"
        >
          + Add Team
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddTeam} className="bg-gray-50 p-4 mb-4 rounded-md space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Team Name"
              value={newTeam.teamName}
              onChange={(e) => setNewTeam(prev => ({ ...prev, teamName: e.target.value }))}
              required
              className="border p-2 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={formLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded"
          >
            {formLoading ? 'Adding...' : 'Submit'}
          </button>
        </form>
      )}

      <div className="max-h-[16rem] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {teams.map((team, idx) => (
            <div
              key={idx}
              onClick={() => fetchTeamMembers(team.teamId)}
              className="cursor-pointer flex flex-col items-center text-center p-2 border rounded shadow-sm bg-gray-50 hover:bg-gray-100"
            >
              <span
                className={`w-4 h-4 rounded-full mb-1 ${team.color || 'bg-gray-300'}`}
              ></span>
              <span className="break-words text-sm font-medium max-w-[6rem]">
                {team.teamName}
              </span>
          </div>
        ))}
      </div>
      </div>

      {selectedTeam && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5 relative">
      <h3 className="text-lg font-semibold mb-3">
        Members of {teams.find(t => t.teamId === selectedTeam)?.teamName}
      </h3>

      {membersLoading ? (
        <p>Loading members...</p>
      ) : teamMembers.length > 0 ? (
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800 max-h-60 overflow-y-auto">
          {teamMembers.map((member, idx) => (
            <li key={idx}>
              {(member.firstName || member.lastName)
                ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                : member.userName || 'Unnamed Member'}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No members in this team.</p>
      )}

      <button
        onClick={() => setSelectedTeam(null)}
        className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg font-bold"
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