const TodayTeamStats = ({ topTeams }) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-xl ring-1 ring-gray-200 transition-all duration-300 animate-fade-in">
      <h2 className="font-semibold text-gray-800 mb-4 text-lg">📊 Top 5 Teams Today</h2>
      <ul className="space-y-3">
        {topTeams.map((team, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <span
                className={`w-4 h-4 rounded-full shadow-md ${team.color || 'bg-gray-400'}`}
              ></span>
              <span className="font-medium text-gray-700 tracking-wide">{team.name}</span>
            </div>
            <span className="text-sm text-gray-600 font-bold bg-gray-200 px-2 py-0.5 rounded">
              {team.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodayTeamStats;
