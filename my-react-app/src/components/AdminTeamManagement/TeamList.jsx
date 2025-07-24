import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const TeamList = ({ teams, onEdit, onDelete, loading, memberCounts = {}, onTeamClick }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this team?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await axios.delete(`/api/teams/${id}`);
      toast.success("Team deleted successfully");
      onDelete(); // refresh list
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete team");
    } finally {
      setDeletingId(null);
    }
  };

  const getMemberBadgeClass = (count) => {
    if (count >= 10) return "bg-green-100 text-green-700";
    if (count > 0) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-700";
  };

  if (loading) return <p>Loading teams...</p>;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4">Team ID</th>
              <th className="py-3 px-4">Team Name</th>
              <th className="py-3 px-4">Team Color</th>
              <th className="py-3 px-4">Members</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...teams]
              .sort((a, b) => parseInt(a.teamId.replace(/\D/g, "")) - parseInt(b.teamId.replace(/\D/g, "")))
              .map((team) => {
                const count = memberCounts[team.teamId] ?? 0;
                return (
                  <tr
                    key={team._id}
                    className="hover:shadow-sm hover:bg-gray-200 transition duration-150 border-b last:border-none cursor-pointer"
                    onClick={() => onTeamClick?.(team)}
                  >
                    <td className="py-3 px-4 font-medium">{team.teamId}</td>
                    <td className="py-3 px-4">{team.teamName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block w-4 h-4 rounded-full ${team.color}`} title={team.color}></span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getMemberBadgeClass(count)}`}>
                        {count} {count === 1 ? "member" : "members"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(team);
                        }}
                        title="Edit team"
                        className="bg-blue-700 hover:bg-blue-800 hover:scale-[1.03] transition text-white text-xs px-3 py-1 rounded font-medium shadow"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(team._id);
                        }}
                        disabled={deletingId === team._id}
                        title="Delete team"
                        className="bg-red-600 hover:bg-red-700 hover:scale-[1.03] transition text-white text-xs px-3 py-1 rounded font-medium shadow"
                      >
                        {deletingId === team._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {[...teams]
          .sort((a, b) => parseInt(a.teamId.replace(/\D/g, "")) - parseInt(b.teamId.replace(/\D/g, "")))
          .map((team) => {
            const count = memberCounts[team.teamId] ?? 0;
            return (
              <div
                key={team._id}
                onClick={() => onTeamClick?.(team)}
                className="border rounded-lg shadow p-4 flex flex-col space-y-2 hover:bg-gray-100 cursor-pointer transition"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{team.teamName}</span>
                  <span className={`inline-block w-4 h-4 rounded-full ${team.color}`} title={team.color}></span>
                </div>
                <div className="text-sm text-gray-600">ID: {team.teamId}</div>
                <div className="text-sm">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getMemberBadgeClass(count)}`}>
                    {count} {count === 1 ? "member" : "members"}
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(team);
                    }}
                    className="bg-blue-700 text-white px-3 py-1 rounded text-xs hover:bg-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(team._id);
                    }}
                    disabled={deletingId === team._id}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                  >
                    {deletingId === team._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default TeamList;
