import { useEffect, useState } from "react";
import { Users, Crown, Wifi, Film, Tv, MessageSquare } from "lucide-react";
import { getAdminStats } from "../../service/admin";
import Loader from "../../component/Loader";

const statCards = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "from-blue-600 to-blue-800" },
  { key: "primeMembers", label: "Prime Members", icon: Crown, color: "from-amber-500 to-amber-700" },
  { key: "onlineUsers", label: "Online Now", icon: Wifi, color: "from-green-600 to-green-800" },
  { key: "totalMovies", label: "Total Movies", icon: Film, color: "from-purple-600 to-purple-800" },
  { key: "totalTvShows", label: "Total TV Shows", icon: Tv, color: "from-indigo-600 to-indigo-800" },
  { key: "totalReviews", label: "Total Reviews", icon: MessageSquare, color: "from-rose-600 to-rose-800" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const formatCount = (value) => Number(value || 0).toLocaleString("en-IN");

  useEffect(() => {
    (async () => {
      try {
        const [adminData, movieRes, tvRes] = await Promise.all([
          getAdminStats(),
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=1`
          ),
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/discover/tv?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=1`
          ),
        ]);

        const movieData = await movieRes.json();
        const tvData = await tvRes.json();

        setStats({
          ...adminData,
          totalMovies: movieData?.total_results || 0,
          totalTvShows: tvData?.total_results || 0,
        });
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Failed to load stats";
        const hint =
          err.response?.status === 404
            ? " Admin API not found — use local backend (VITE_API_URL=http://localhost:5000) or deploy latest Backend to Render."
            : "";
        setError(msg + hint);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader message="Loading dashboard..." />;
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Dashboard Overview</h2>
        <p className="text-sm text-gray-400 mt-1">
          Online users are counted from active users in the last 10 minutes.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg border border-white/10`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{label}</p>
                <p className="text-3xl font-bold mt-1">{formatCount(stats?.[key])}</p>
              </div>
              <Icon className="text-white/60" size={32} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
