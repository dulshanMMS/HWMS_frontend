const TodayTeamStats = ({ topTeams }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="font-semibold mb-4">Top 5 Teams Today</h2>
      <ul className="space-y-3">
        {topTeams.map((team, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span
                className={`w-4 h-4 rounded-full ${team.color || 'bg-gray-400'}`}
              ></span>
              <span className="font-medium">{team.name}</span>
            </div>
            <span className="text-sm text-gray-700 font-semibold">{team.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodayTeamStats;
