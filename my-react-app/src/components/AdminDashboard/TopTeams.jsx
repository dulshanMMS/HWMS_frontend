const TopTeams = ({ topTeams, teamColors }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="font-semibold text-lg mb-2">Today</h2>
    <ul className="space-y-2">
      {topTeams.map((team, index) => (
        <li key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${teamColors[team.name]}`}></span>
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

export default TopTeams;
