import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import TeamForm from "../components/AdminTeamManagement/TeamForm";
import TeamList from "../components/AdminTeamManagement/TeamList";

const AdminTeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTeam, setEditTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [memberCounts, setMemberCounts] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [teamMembersByTeam, setTeamMembersByTeam] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredTeams = teams.filter((team) => {
    const lowerSearch = searchTerm.toLowerCase();

    const matchesTeamName = team.teamName.toLowerCase().includes(lowerSearch);

    const matchesMemberEmail = teamMembersByTeam[team.teamId]?.some((member) =>
      member.email?.toLowerCase().includes(lowerSearch)
    );

    return matchesTeamName || matchesMemberEmail;
  });

  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const fetchTeams = async () => {
    try {
      const res = await axios.get("/api/teams");
      const teamsData = res.data;
      setTeams(teamsData);

      // Fetch members for all teams
      const membersMap = {};

      await Promise.all(
        teamsData.map(async (team) => {
          try {
            const res = await axios.get(`/api/user/by-team?teamId=${team.teamId}`);
            membersMap[team.teamId] = res.data || [];
          } catch (err) {
            console.error(`Failed to fetch members for team ${team.teamId}:`, err);
            membersMap[team.teamId] = [];
          }
        })
      );

      setTeamMembersByTeam(membersMap);
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberCounts = async () => {
    try {
      const res = await axios.get("/api/teams/member-counts");
      setMemberCounts(res.data);
    } catch (err) {
      console.error("Failed to fetch member counts:", err);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchMemberCounts();
  }, []);

  const handleTeamAddedOrUpdated = () => {
    fetchTeams();
    fetchMemberCounts();
    setEditTeam(null);
    setShowFormModal(false);
  };

  const handleEditClick = (team) => {
    setEditTeam(team);
    setShowFormModal(true);
  };

  const handleTeamClick = async (team) => {
    setMembersLoading(true);
    try {
      const res = await axios.get(`/api/user/by-team?teamId=${team.teamId}`);
      console.log("Fetched team members:", res.data);
      setTeamMembers(res.data || []);
      setSelectedTeam(team);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  return (
    <AdminSidebar>
      <div className="w-full px-4 sm:px-6 md:px-8 py-6 relative">
        <div className="flex flex-row justify-between items-center flex-wrap gap-3 mb-4">
          <h1 className="text-2xl font-semibold">Team Management</h1>
          <button
            onClick={() => {
              setEditTeam(null);
              setShowFormModal(true);
            }}
            title="Add a new team"
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded shadow text-sm sm:text-base"
          >
            + Add Team
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by team name or member email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 w-full border border-gray-300 p-2 rounded-md shadow-sm"
        />

        <TeamList
          teams={paginatedTeams}
          onEdit={handleEditClick}
          onDelete={fetchTeams}
          loading={loading}
          memberCounts={memberCounts}
          onTeamClick={handleTeamClick}
        />

        <div className="p-4 border-t flex items-center justify-center text-sm text-gray-700 gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-full border transition ${
              currentPage === 1
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 border-gray-400"
            }`}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`w-8 h-8 rounded-full text-sm font-medium border transition ${
                num === currentPage
                  ? "bg-green-600 text-white border-green-600"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-full border transition ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 border-gray-400"
            }`}
          >
            Next →
          </button>
        </div>

        {showFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center transition-all p-2">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-4 sm:p-6 relative animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">
                {editTeam ? "Edit Team" : "Add New Team"}
              </h2>
              <div className="max-h-[90vh] overflow-y-auto w-full max-w-xl">
                <TeamForm
                  existingTeam={editTeam}
                  onSuccess={handleTeamAddedOrUpdated}
                  onCancel={() => {
                    setEditTeam(null);
                    setShowFormModal(false);
                  }}
                />
              </div>
              <button
                onClick={() => {
                  setEditTeam(null);
                  setShowFormModal(false);
                }}
                className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 sm:p-5 relative animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">
                👥 Members of {selectedTeam.teamName}
              </h3>
              {membersLoading ? (
                <p>Loading members...</p>
              ) : teamMembers.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800 max-h-60 overflow-y-auto">
                  {teamMembers.map((member, idx) => {
                    const fullName = [member.firstName, member.lastName].filter(Boolean).join(" ").trim();
                    const email = member.email;

                    return (
                      <li key={idx}>
                        {fullName
                          ? `${fullName}${email ? ` (${email})` : ""}`
                          : email || "Unnamed Member"}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No members in this team.</p>
              )}
              <button
                onClick={() => setSelectedTeam(null)}
                className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl font-bold"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default AdminTeamManagement;
