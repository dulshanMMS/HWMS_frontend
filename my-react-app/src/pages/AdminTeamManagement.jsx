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

  const fetchTeams = async () => {
    try {
      const res = await axios.get("/api/teams");
      setTeams(res.data);
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
      const res = await axios.get(`/api/user?teamId=${team.teamId}`);
      setTeamMembers(res.data || []);
      setSelectedTeam(team);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.teamId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 w-full border border-gray-300 p-2 rounded-md shadow-sm"
        />

        <TeamList
          teams={filteredTeams}
          onEdit={handleEditClick}
          onDelete={fetchTeams}
          loading={loading}
          memberCounts={memberCounts}
          onTeamClick={handleTeamClick}
        />

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
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 sm:p-5 relative">
              <h3 className="text-lg font-semibold mb-3">
                Members of {selectedTeam.teamName}
              </h3>
              {membersLoading ? (
                <p>Loading members...</p>
              ) : teamMembers.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800 max-h-60 overflow-y-auto">
                  {teamMembers.map((member, idx) => (
                    <li key={idx}>
                      {(member.firstName || member.lastName)
                        ? `${member.firstName || ''} ${member.lastName || ''}`.trim() + (member.username ? ` (${member.username})` : '')
                        : member.username || 'Unnamed Member'}
                    </li>
                  ))}
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
