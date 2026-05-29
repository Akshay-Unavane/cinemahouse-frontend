import { useEffect, useState } from "react";
import { Ban, Trash2, RefreshCw } from "lucide-react";
import {
  getAdminUsers,
  toggleBlockUser,
  deleteAdminUser,
} from "../../service/admin";
import { useToast } from "../../context/useToast";
import Loader from "../../component/Loader";

const AdminUsers = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (id) => {
    try {
      const res = await toggleBlockUser(id);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...res.user } : u))
      );
      showToast(res.message, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed", "error");
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      showToast("User deleted", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  if (loading) return <Loader message="Loading users..." />;
  const filteredUsers = users.filter((u) =>
    `${u.username} ${u.email}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-gray-400 mt-1">
            {users.length} total users · Online = active in last 10 minutes
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search username or email"
            className="px-3 py-2 text-sm rounded-lg border border-white/15 bg-white/5 text-white outline-none focus:border-cyan-400"
          />
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-white/10 bg-white/[0.02]">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Online (10m)</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-gray-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isBlocked ? (
                      <span className="text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 text-xs">Blocked</span>
                    ) : (
                      <span className="text-green-400 px-2 py-0.5 rounded-full bg-green-500/10 text-xs">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.isOnlineNow ? (
                      <span className="text-emerald-300">Online</span>
                    ) : (
                      <span className="text-gray-500">Offline</span>
                    )}
                    {u.lastActiveAt && (
                      <span className="block text-xs text-gray-500 mt-0.5">
                        Last active: {new Date(u.lastActiveAt).toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleBlock(u._id)}
                        title={u.isBlocked ? "Unblock" : "Block"}
                        className="p-2 rounded-lg bg-amber-600/20 text-amber-300 hover:bg-amber-600/40 transition"
                      >
                        <Ban size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id, u.username)}
                        title="Delete"
                        className="p-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/40 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
