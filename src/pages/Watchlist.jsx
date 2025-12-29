import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getWatchlist, removeFromWatchlist } from "../service/watchlist";
import MovieCard from "../component/MovieCard";
import { Trash2, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TMDB_TOKEN = import.meta.env.VITE_API_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const Watchlist = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch & enrich watchlist
  useEffect(() => {
    if (!user) return;

    const fetchEnrichedWatchlist = async () => {
      try {
        setLoading(true);

        const list = await getWatchlist();

        if (!Array.isArray(list)) {
          throw new Error("Watchlist API did not return array");
        }

        const enriched = await Promise.all(
          list.map(async (item) => {
            try {
              const endpoint =
                item.mediaType === "tv"
                  ? `${TMDB_BASE_URL}/tv/${item.movieId}`
                  : `${TMDB_BASE_URL}/movie/${item.movieId}`;

              const res = await fetch(endpoint, {
                headers: {
                  Authorization: `Bearer ${TMDB_TOKEN}`,
                  accept: "application/json",
                },
              });

              if (!res.ok) {
                throw new Error("TMDB fetch failed");
              }

              const tmdb = await res.json();

              return {
                movieId: item.movieId,
                mediaType: item.mediaType,
                title: item.mediaType === "tv" ? tmdb.name : tmdb.title,
                poster_path: tmdb.poster_path,
                vote_average: tmdb.vote_average,
              };
            } catch {
              // Fallback if TMDB fails
              return {
                movieId: item.movieId,
                mediaType: item.mediaType,
                title: item.title || "Unknown",
                poster_path: null,
                vote_average: 0,
              };
            }
          })
        );

        setWatchlist(enriched);
      } catch (err) {
        console.error("Watchlist error:", err);
        showToast("Failed to load watchlist", "error");
        setWatchlist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrichedWatchlist();
  }, [user, showToast]);

  // Remove handlers
  const handleRemove = useCallback((item) => {
    setSelectedItem(item);
    setConfirmOpen(true);
  }, []);

  const confirmRemove = async () => {
    if (!selectedItem) return;

    const prev = watchlist;
    setRemovingId(selectedItem.movieId);

    setWatchlist((list) =>
      list.filter(
        (i) =>
          !(
            i.movieId === selectedItem.movieId &&
            i.mediaType === selectedItem.mediaType
          )
      )
    );

    try {
      await removeFromWatchlist(
        selectedItem.movieId,
        selectedItem.mediaType
      );
      showToast("Removed from watchlist", "success");
    } catch (err) {
      console.error(err);
      setWatchlist(prev);
      showToast("Failed to remove item", "error");
    } finally {
      setRemovingId(null);
      setConfirmOpen(false);
      setSelectedItem(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-300">
        <p className="text-xl">Please login to view your watchlist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 bg-black text-white px-4 py-10">
      {/* Back button */}
      <div className="sticky top-[72px] z-10 w-fit">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur rounded-lg border border-white/10 hover:bg-black/90"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[260px] rounded-xl bg-white/10 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && watchlist.length === 0 && (
        <div className="text-center text-gray-400 mt-20">
          <p className="text-xl mb-2">Your watchlist is empty 🎬</p>
          <p>Add movies or TV shows to keep track.</p>
        </div>
      )}

      {/* Grid */}
      <AnimatePresence>
        {!loading && watchlist.length > 0 && (
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {watchlist.map((item) => (
              <motion.div
                key={`${item.movieId}-${item.mediaType}`}
                className="relative group"
                layout
              >
                <MovieCard
                  movie={{
                    id: item.movieId,
                    title: item.title,
                    poster_path: item.poster_path,
                    vote_average: item.vote_average,
                    media_type: item.mediaType,
                  }}
                />

                <button
                  onClick={() => handleRemove(item)}
                  disabled={removingId === item.movieId}
                  className="absolute top-2 right-2 bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <motion.div className="bg-[#0D253F] p-6 rounded-xl w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-2">
                Remove from Watchlist
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to remove this item?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 bg-white/10 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="px-4 py-2 bg-red-600 rounded flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Watchlist;
