import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Search } from "lucide-react";
import { supabase } from "../lib/supabase";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users on load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles") // Assuming 'profiles' table holds user data
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  const handleUpdatePoints = async (userId, newPoints) => {
    const { error } = await supabase
      .from("profiles")
      .update({ points_balance: newPoints }) // Ensure column name matches DB
      .eq("id", userId);

    if (!error) {
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, points_balance: newPoints } : u
        )
      );
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-white">Loading users...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Management</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-gray-400 uppercase text-xs border-b border-gray-700">
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-700">
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="bg-gray-900 border border-gray-600 rounded p-1 text-xs text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      defaultValue={u.points_balance || 0}
                      onBlur={(e) =>
                        handleUpdatePoints(u.id, parseInt(e.target.value))
                      }
                      className="bg-gray-900 border border-gray-600 rounded w-20 p-1 text-right text-xs text-white"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UsersPage;
