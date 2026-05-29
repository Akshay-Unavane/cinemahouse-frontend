import { useEffect, useState } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { getAdminReviews, deleteAdminReview } from "../../service/admin";
import { useToast } from "../../context/useToast";
import Loader from "../../component/Loader";

const AdminReviews = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAdminReviews();
      setReviews(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteAdminReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      showToast("Review deleted", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  if (loading) return <Loader message="Loading reviews..." />;
  const filteredReviews = reviews.filter((r) =>
    `${r.user?.username || ""} ${r.movie?.title || ""} ${r.comment || ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Review Management</h2>
          <p className="text-sm text-gray-400 mt-1">{reviews.length} reviews found</p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user, movie or review text"
            className="px-3 py-2 text-sm rounded-lg border border-white/15 bg-white/5 text-white outline-none focus:border-cyan-400"
          />
          <button
            onClick={fetchReviews}
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
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Movie</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No reviews in database yet
                </td>
              </tr>
            ) : (
              filteredReviews.map((r) => (
                <tr key={r._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    {r.user?.username || "Unknown"}
                    <span className="block text-xs text-gray-500">{r.user?.email}</span>
                  </td>
                  <td className="px-4 py-3">{r.movie?.title || "—"}</td>
                  <td className="px-4 py-3">{r.rating ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{r.comment}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(r._id)}
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

export default AdminReviews;
