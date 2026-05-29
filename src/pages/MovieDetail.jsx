import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ExternalLink,
  MoreVertical,
  Bookmark,
  Share2,
  Link as LinkIcon,
  Play,
  Star,
  Clock,
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { addToWatchlist } from "../service/watchlist";
import CastCard from "../component/CastCard";
import ReviewSection from "../component/ReviewSection";
import {
  DetailSkeleton,
  DetailSection,
  MetaPill,
} from "../component/media/DetailPageUI";
import RecommendationRow from "../component/media/RecommendationRow";
import { TMDB_IMG, TMDB_TOKEN } from "../config/tmdb";

const API_BASE = "https://api.themoviedb.org/3/movie";

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const trailerRef = useRef(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/${id}?append_to_response=credits,videos,recommendations,external_ids`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${TMDB_TOKEN}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch movie");
        setMovie(await res.json());
      } catch (err) {
        console.error(err);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddToWatchlist = async () => {
    if (!user) {
      showToast("Please login to add to watchlist", "warning");
      navigate("/login", { state: { from: `/movie/${id}` } });
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

  const scrollToTrailer = () => {
    trailerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <DetailSkeleton />;

  if (!movie) {
    return (
      <div className="min-h-screen cinema-gradient text-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-400">Failed to load movie details.</p>
        <button type="button" onClick={() => navigate(-1)} className="btn-primary">
          Go back
        </button>
      </div>
    );
  }

  const director = movie.credits?.crew?.find((c) => c.job === "Director");
  const trailer =
    movie.videos?.results?.find((v) => v.type === "Trailer") ||
    movie.videos?.results?.[0];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pb-16">
      {movie.backdrop_path && (
        <div className="relative h-[45vh] md:h-[65vh]">
          <img
            src={`${TMDB_IMG}/original${movie.backdrop_path}`}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="fixed top-16 sm:top-20 left-3 sm:left-4 z-40 flex items-center gap-2 px-3 sm:px-4 py-2 glass-panel hover:bg-white/10 text-sm"
      >
        <ChevronLeft size={18} /> Back
      </button>

      <div className="relative max-w-7xl mx-auto px-4 -mt-20 md:-mt-72">
        <div className="absolute top-4 right-4 z-40" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2.5 rounded-full glass-panel hover:bg-white/10"
          >
            <MoreVertical size={22} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 glass-panel overflow-hidden shadow-2xl">
              <button
                type="button"
                onClick={handleAddToWatchlist}
                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-white/10 text-sm"
              >
                <Bookmark size={16} /> Add to Watchlist
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-white/10 text-sm"
              >
                <Share2 size={16} /> Share
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-white/10 text-sm"
              >
                <LinkIcon size={16} /> Copy Link
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={
              movie.poster_path
                ? `${TMDB_IMG}/w500${movie.poster_path}`
                : "/no-image.png"
            }
            alt={movie.title}
            className="w-52 md:w-72 mx-auto md:mx-0 rounded-2xl shadow-2xl ring-1 ring-white/10"
          />

          <div className="flex-1 space-y-5">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-glow">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="italic text-gray-400 text-sm md:text-base">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <MetaPill accent>
                <span className="inline-flex items-center gap-1">
                  <Star size={12} /> {movie.vote_average?.toFixed(1)}
                </span>
              </MetaPill>
              {movie.release_date && <MetaPill>{movie.release_date.slice(0, 4)}</MetaPill>}
              {movie.runtime > 0 && (
                <MetaPill>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> {movie.runtime} min
                  </span>
                </MetaPill>
              )}
              {movie.status && <MetaPill>{movie.status}</MetaPill>}
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-gray-300 leading-relaxed max-w-3xl">{movie.overview}</p>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleAddToWatchlist} className="btn-primary inline-flex items-center gap-2">
                <Bookmark size={16} /> Watchlist
              </button>
              {trailer && (
                <button
                  type="button"
                  onClick={scrollToTrailer}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 hover:bg-white/5 font-semibold"
                >
                  <Play size={16} /> Trailer
                </button>
              )}
              {movie.external_ids?.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${movie.external_ids.imdb_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400"
                >
                  IMDb <ExternalLink size={16} />
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 glass-panel p-4">
              {director && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Director</p>
                  <p className="font-semibold mt-1">{director.name}</p>
                </div>
              )}
              {movie.budget > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
                  <p className="font-semibold mt-1">${movie.budget.toLocaleString()}</p>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Revenue</p>
                  <p className="font-semibold mt-1">${movie.revenue.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {movie.credits?.cast?.length > 0 && (
          <DetailSection title="Cast">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {movie.credits.cast.slice(0, 20).map((actor) => (
                <CastCard key={actor.id} actor={actor} />
              ))}
            </div>
          </DetailSection>
        )}

        <ReviewSection
          tmdbId={movie.id}
          mediaType="movie"
          title={movie.title}
          poster_path={movie.poster_path}
          overview={movie.overview}
          release_date={movie.release_date}
        />

        {trailer && (
          <DetailSection title="Trailer">
            <div ref={trailerRef} className="glass-panel p-2 md:p-3">
              <iframe
                className="w-full h-56 sm:h-72 md:h-[480px] rounded-xl"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                allowFullScreen
                title="Trailer"
              />
            </div>
          </DetailSection>
        )}

        {movie.recommendations?.results?.length > 0 && (
          <DetailSection title="You may also like">
            <RecommendationRow items={movie.recommendations.results} mediaType="movie" />
          </DetailSection>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
