import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const TeamList = ({ teams, onEdit, onDelete, loading, memberCounts = {} }) => {
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

  if (loading) return <p>Loading teams...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b">Team ID</th>
            <th className="py-2 px-4 border-b">Team Name</th>
            <th className="py-2 px-4 border-b">Team Color</th>
            <th className="py-2 px-4 border-b">Members</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...teams]
            .sort((a, b) => {
            const idA = parseInt(a.teamId.replace(/\D/g, '')) || 0;
            const idB = parseInt(b.teamId.replace(/\D/g, '')) || 0;
            return idA - idB;
          })
          .map((team) => (
            <tr key={team._id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{team.teamId}</td>
              <td className="py-2 px-4 border-b">{team.teamName}</td>
              <td className="py-2 px-4 border-b">
                <span className={`inline-block w-4 h-4 rounded-full ${team.color}`} title={team.color}></span>
              </td>
              <td className="py-2 px-4 border-b">
                <span className="inline-flex items-center gap-1 text-gray-800">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C17 14.17 12.33 13 10 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                    {memberCounts[team.teamId] ?? 0}
                </span>
              </td>
              <td className="py-2 px-4 border-b space-x-2">
                <button onClick={() => onEdit(team)} className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded">
                  Edit
                </button>
                <button onClick={() => handleDelete(team._id)} className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamList;
