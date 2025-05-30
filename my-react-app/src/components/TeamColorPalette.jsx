import React from 'react';
import teamColors from '../constants/teamColors';

const teamOrder = [
  "Team A", "Team B", "Team C", "Team D", "Team E", "Team F", "Team G", "Team H",
  "Team I", "Team J", "Team K", "Team L", "Team M", "Team N", "Team O"
];

const TeamColorPalette = () => (
  <div className="bg-white rounded-2xl shadow-sm p-4 ml-6 w-64 mt-8">
    <h3 className="font-bold text-lg mb-4">Color Palette for teams</h3>
    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
      {teamOrder.map(team => (
        <div key={team} className="flex items-center gap-2 whitespace-nowrap">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{ background: teamColors[team] }}
          ></span>
          <span className="text-xs font-medium text-black">{team}</span>
        </div>
      ))}
    </div>
  </div>
);

export default TeamColorPalette;
