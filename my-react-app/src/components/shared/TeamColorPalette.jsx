// import React from 'react';
// import teamColors from '../constants/teamColors';

// const teamOrder = [
//   "Team A", "Team B", "Team C", "Team D", "Team E", "Team F", "Team G", "Team H",
//   "Team I", "Team J", "Team K", "Team L", "Team M", "Team N", "Team O"
// ];

// const TeamColorPalette = () => (
//   <div className="bg-white rounded-2xl shadow-sm p-4 ml-6 w-64 mt-8">
//     <h3 className="font-bold text-lg mb-4">Color Palette for teams</h3>
//     <div className="grid grid-cols-2 gap-y-2 gap-x-4">
//       {teamOrder.map(team => (
//         <div key={team} className="flex items-center gap-2 whitespace-nowrap">
//           <span
//             className="inline-block w-4 h-4 rounded-full"
//             style={{ background: teamColors[team] }}
//           ></span>
//           <span className="text-xs font-medium text-black">{team}</span>
//         </div>
//       ))}
//     </div>
//   </div>
// );

// export default TeamColorPalette;




import { useEffect, useState } from 'react';
import axios from 'axios';

const TeamColorPalette = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchTeams();
  }, []);

  if (loading) return <p>Loading team colors...</p>;

  const sortedTeams = [...teams].sort((a, b) => a.teamName.localeCompare(b.teamName));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="font-semibold mb-2">Color Palette for Teams</h2>
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