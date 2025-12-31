import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { getWatchlist, removeFromWatchlist } from "../service/watchlist";
import MovieCard from "../component/MovieCard";
import { Trash2, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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

  /* Scroll to top */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* Fetch watchlist */
  const fetchEnrichedWatchlist = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);

      const list = await getWatchlist();
      if (!Array.isArray(list)) throw new Error("Invalid watchlist response");

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

            if (!res.ok) throw new Error("TMDB error");

            const tmdb = await res.json();

            return {
              movieId: item.movieId,
              mediaType: item.mediaType,
              title: item.mediaType === "tv" ? tmdb.name : tmdb.title,
              poster_path: tmdb.poster_path,
              vote_average: tmdb.vote_average,
            };
          } catch {
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
  }, [user?._id]);

  useEffect(() => {
    fetchEnrichedWatchlist();
  }, [fetchEnrichedWatchlist]);

  /* Remove handlers */
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
      {/* Back */}
      <div className="sticky top-[72px] z-10 w-fit mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur rounded-lg border border-white/10 hover:bg-black/90"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>

      {/* Grid */}
      <AnimatePresence>
        {!loading && watchlist.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {watchlist.map((item) => (
              <motion.div
                key={`${item.movieId}-${item.mediaType}`}
                layout
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative group"
              >
                {/* Card */}
                <div className="rounded-xl overflow-hidden bg-[#0D253F]">
                  <MovieCard
                    movie={{
                      id: item.movieId,
                      title: item.title,
                      poster_path: item.poster_path,
                      vote_average: item.vote_average,
                      media_type: item.mediaType,
                    }}
                  />
                </div>

                {/* Remove button (stop propagation so parent click doesn't navigate) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                  disabled={removingId === item.movieId}
                  className={
                    `absolute top-2 right-2 z-30
                    bg-red-600 p-3 rounded-full
                    opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                    transition focus:outline-none focus:ring-2 focus:ring-red-300
                    `
                  }
                  aria-label={`Remove ${item.title} from watchlist`}
                >
                  <span className="sr-only">Remove</span>
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#0D253F] p-6 rounded-xl w-full max-w-sm"
            >
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
