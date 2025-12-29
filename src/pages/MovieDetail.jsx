import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ExternalLink,
  MoreVertical,
  Bookmark,
  Share2,
  Link as LinkIcon,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { addToWatchlist } from "../service/watchlist";
import CastCard from "../component/CastCard";

const API_BASE = "https://api.themoviedb.org/3/movie";
const API_KEY = import.meta.env.VITE_API_TOKEN;
const IMG = "https://image.tmdb.org/t/p/";

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  /* ---------------- FETCH MOVIE ---------------- */
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/${id}?append_to_response=credits,videos,recommendations,external_ids`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch movie");
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error(err);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  /* -------- CLOSE MENU ON OUTSIDE CLICK -------- */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) return <div className="min-h-screen bg-black" />;

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Failed to load movie
      </div>
    );
  }

  const director = movie.credits?.crew?.find((c) => c.job === "Director");
  const trailer =
    movie.videos?.results?.find((v) => v.type === "Trailer") ||
    movie.videos?.results?.[0];

  /* ---------------- ACTIONS ---------------- */
  const handleAddToWatchlist = async () => {
    if (!user) {
      showToast("Please login to add to watchlist", "error");
      return;
    }

    try {
      await addToWatchlist({
        movieId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        mediaType: "movie",
      });
      showToast("Added to watchlist!", "success");
    } catch {
      showToast("Failed to add to watchlist", "error");
    }
    setMenuOpen(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied!", "success");
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* BACKDROP */}
      {movie.backdrop_path && (
        <div className="relative h-[45vh] md:h-[65vh]">
          <img
            src={`${IMG}original${movie.backdrop_path}`}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>
      )}

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 md:top-28 left-4 z-40 flex items-center gap-2 px-4 py-2 bg-black/70 rounded-lg hover:bg-black/90"
      >
        <ChevronLeft size={18} /> Back
      </button>

      {/* CONTENT */}
      <div className="relative max-w-7xl mx-auto px-4 -mt-20 md:-mt-72">
        {/* MENU */}
        <div className="absolute top-4 right-4 z-40" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10"
          >
            <MoreVertical size={22} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={handleAddToWatchlist}
                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-white/10 text-sm"
              >
                <Bookmark size={16} /> Add to Watchlist
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-white/10 text-sm"
              >
                <Share2 size={16} /> Share
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-white/10 text-sm"
              >
                <LinkIcon size={16} /> Copy Link
              </button>
            </div>
          )}
        </div>

        {/* MAIN INFO */}
        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={
              movie.poster_path
                ? `${IMG}w500${movie.poster_path}`
                : "/no-image.png"
            }
            alt={movie.title}
            className="w-52 md:w-72 mx-auto md:mx-0 rounded-2xl shadow-2xl"
          />

          <div className="flex-1 space-y-5">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="italic text-gray-400">“{movie.tagline}”</p>
            )}

            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
              <span className="text-yellow-400 font-semibold">
                ★ {movie.vote_average?.toFixed(1)}
              </span>
              <span>{movie.release_date}</span>
              <span>{movie.runtime} min</span>
              <span>{movie.status}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="bg-white/10 px-3 py-1 rounded-full text-xs"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-gray-400 max-w-3xl">{movie.overview}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {director && (
                <div>
                  <p className="text-xs text-gray-400">Director</p>
                  <p className="font-semibold">{director.name}</p>
                </div>
              )}
              {movie.budget > 0 && (
                <div>
                  <p className="text-xs text-gray-400">Budget</p>
                  <p className="font-semibold">
                    ${movie.budget.toLocaleString()}
                  </p>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <p className="text-xs text-gray-400">Revenue</p>
                  <p className="font-semibold">
                    ${movie.revenue.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {movie.external_ids?.imdb_id && (
              <a
                href={`https://www.imdb.com/title/${movie.external_ids.imdb_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400"
              >
                IMDb <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        {/* 🎭 CAST (USING CastCard) */}
        {movie.credits?.cast?.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {movie.credits.cast.slice(0, 20).map((actor) => (
                <CastCard key={actor.id} actor={actor} />
              ))}
            </div>
          </div>
        )}

        {/* TRAILER */}
        {trailer && (
          <div className="mt-16">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Trailer</h2>
            <iframe
              className="w-full h-56 sm:h-72 md:h-[480px] rounded-xl"
              src={`https://www.youtube.com/embed/${trailer.key}`}
              allowFullScreen
              title="Trailer"
            />
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {movie.recommendations?.results?.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Recommendations
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {movie.recommendations.results.slice(0, 12).map((rec) => (
                <img
                  key={rec.id}
                  src={
                    rec.poster_path
                      ? `${IMG}w300${rec.poster_path}`
                      : "/no-image.png"
                  }
                  alt={rec.title}
                  className="w-32 h-48 rounded-xl cursor-pointer hover:scale-105 transition"
                  onClick={() => navigate(`/movie/${rec.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
