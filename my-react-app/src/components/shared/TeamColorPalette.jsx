import { useEffect, useState } from 'react';
import axios from 'axios';

const TeamColorPalette = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTeam, setNewTeam] = useState({ teamId: '', teamName: '', color: '' });
  const [formLoading, setFormLoading] = useState(false);

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

  const handleAddTeam = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await axios.post('/api/teams', newTeam); 
      setNewTeam({ teamId: '', teamName: '', color: '' });
      setShowForm(false);
      fetchTeams(); // Refresh the list
    } catch (error) {
      console.error('Error adding team:', error);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <p>Loading team colors...</p>;

  const sortedTeams = [...teams].sort((a, b) => a.teamName.localeCompare(b.teamName));

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Team ID"
              value={newTeam.teamId}
              onChange={(e) => setNewTeam({ ...newTeam, teamId: e.target.value })}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Team Name"
              value={newTeam.teamName}
              onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Tailwind Color Class (e.g., bg-red-500)"
              value={newTeam.color}
              onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sortedTeams.map((team, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <span className={`w-4 h-4 rounded-full ${team.color || 'bg-gray-300'}`}></span>
            <span>{team.teamName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamColorPalette;
