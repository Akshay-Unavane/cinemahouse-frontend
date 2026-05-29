import { useEffect, useState } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { getAdminMovies, deleteAdminMovie } from "../../service/admin";
import { useToast } from "../../context/useToast";
import Loader from "../../component/Loader";

const AdminMovies = () => {
  const { showToast } = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await getAdminMovies();
      setMovies(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load movies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete movie "${title}" and its reviews?`)) return;
    try {
      await deleteAdminMovie(id);
      setMovies((prev) => prev.filter((m) => m._id !== id));
      showToast("Movie deleted", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  if (loading) return <Loader message="Loading movies..." />;
  const filteredMovies = movies.filter((m) =>
    `${m.title} ${m.tmdbId} ${m.mediaType}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Movie Management</h2>
          <p className="text-sm text-gray-400 mt-1">{movies.length} records in database</p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, tmdb id, type"
            className="px-3 py-2 text-sm rounded-lg border border-white/15 bg-white/5 text-white outline-none focus:border-cyan-400"
          />
          <button
            onClick={fetchMovies}
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
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">TMDB ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Release</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No movies in database yet
                </td>
              </tr>
            ) : (
              filteredMovies.map((m) => (
                <tr key={m._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{m.title}</td>
                  <td className="px-4 py-3 text-gray-300">{m.tmdbId}</td>
                  <td className="px-4 py-3 capitalize">{m.mediaType}</td>
                  <td className="px-4 py-3 text-gray-300">{m.release_date || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(m._id, m.title)}
                      className="p-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/40 transition inline-flex"
                    >
                      <Trash2 size={16} />
                    </button>
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

export default AdminMovies;
