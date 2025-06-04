
/**
 * Shows top 3 teams' booking counts with colored indicators.
 * @param {Array} topTeams - Array of teams with {name, count}.
 * @param {Object} teamColors - Map of teamName to CSS color class or HEX.
 */

const TodayTeamStats = ({ topTeams, teamColors }) => {
  const sortedTopTeams = [...topTeams]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="font-semibold text-lg mb-2">Today</h2>
      <ul className="space-y-2">
        {sortedTopTeams.map((team, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: teamColors[team.name] || '#ccc' }}
              ></span>
              <span>{team.name}</span>
            </div>
            <span className="text-sm">{team.count}</span>
          </li>
        ))}
      </ul>
      <div className="text-center mt-4">
        <button className="text-green-600 font-medium">View All Bookings →</button>
      </div>
    </div>
  );
};

export default TodayTeamStats;
