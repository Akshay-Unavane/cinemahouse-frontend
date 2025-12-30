import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ellipsis,
  Star,
  Bookmark,
  Share2,
  Link as LinkIcon,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { addToWatchlist } from "../service/watchlist";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_IMG = "/placeholder.jpg";

function MovieCard({ movie }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const title = movie?.title || movie?.name || "Untitled";
  const mediaType = movie?.media_type || (movie?.title ? "movie" : "tv");

  const rating = useMemo(() => {
    if (!movie?.vote_average) return "Upcoming";
    return movie.vote_average.toFixed(1);
  }, [movie]);

  const imageUrl = movie?.poster_path
    ? `${IMG_BASE}${movie.poster_path}`
    : FALLBACK_IMG;

  /* ---------------- CLOSE MENU ---------------- */
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  /* ---------------- ACTIONS ---------------- */
  const handleNavigate = () => {
    navigate(`/${mediaType}/${movie.id}`, { state: { mediaType } });
  };

  const handleAddToWatchlist = async (e) => {
    e.stopPropagation();

    if (!user) {
      showToast("Please login to add to watchlist", "error");
      return setMenuOpen(false);
    }

    try {
      await addToWatchlist({
        movieId: movie.id,
        title,
        poster_path: movie.poster_path,
        mediaType,
      });
      showToast("Added to watchlist!", "success");
    } catch {
      showToast("Already in watchlist or failed", "error");
    }
    setMenuOpen(false);
  };

  const handleShare = async (e) => {
    e.stopPropagation();

    const link = `${window.location.origin}/${mediaType}/${movie.id}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast("Link copied!", "success");
    } catch {
      showToast("Copy failed", "error");
    }
    setMenuOpen(false);
  };

  return (
    <Motion.div
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative cursor-pointer rounded-xl bg-zinc-900 shadow-xl overflow-visible"
      onClick={handleNavigate}
    >
      {/* POSTER */}
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
        className="w-full aspect-[2/3] object-cover rounded-xl"
      />

      {/* HOVER GRADIENT */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity" />

      {/* RATING */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 text-yellow-400 text-xs px-2 py-1 rounded-md font-semibold">
        <Star size={13} />
        {rating}
      </div>

      {/* MENU BUTTON */}
      <button
        aria-label="More options"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
        className="absolute top-2 right-2 z-20 bg-black/70 p-2 rounded-full hover:bg-black/90 transition"
      >
        <Ellipsis size={16} className="text-white" />
      </button>

      {/* DROPDOWN */}
      <AnimatePresence>
        {menuOpen && (
          <Motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-2 top-12 w-48 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <button
              onClick={handleAddToWatchlist}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-white/10"
            >
              <Bookmark size={16} /> Add to Watchlist
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-white/10"
            >
              <LinkIcon size={16} /> Copy Link
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-white/10"
            >
              <Share2 size={16} /> Share
            </button>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}

export default MovieCard;
