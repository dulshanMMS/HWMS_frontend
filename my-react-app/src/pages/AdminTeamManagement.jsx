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

  const filteredTeams = teams.filter(
    (team) =>
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.teamId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminSidebar>
      <div className="p-6 max-w-5xl mx-auto relative">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Team Management</h1>
          <button
            onClick={() => {
              setEditTeam(null);
              setShowFormModal(true);
            }}
            title="Add a new team"
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded shadow"
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
        />

        {/* Modal for TeamForm */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center transition-all">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">
                {editTeam ? "Edit Team" : "Add New Team"}
              </h2>

              <TeamForm
                existingTeam={editTeam}
                onSuccess={handleTeamAddedOrUpdated}
                onCancel={() => {
                  setEditTeam(null);
                  setShowFormModal(false);
                }}
              />

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
      </div>
    </AdminSidebar>
  );
};

export default AdminTeamManagement;
