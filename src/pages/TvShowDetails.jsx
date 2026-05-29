import { useEffect, useState, useRef } from "react";
import {
  ChevronLeft,
  ExternalLink,
  MoreVertical,
  Bookmark,
  Share2,
  Play,
  Star,
  Tv,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { addToWatchlist } from "../service/watchlist";
import ReviewSection from "../component/ReviewSection";
import CastCard from "../component/CastCard";
import {
  DetailSkeleton,
  DetailSection,
  MetaPill,
} from "../component/media/DetailPageUI";
import RecommendationRow from "../component/media/RecommendationRow";
import { TMDB_BASE, TMDB_IMG, TMDB_TOKEN } from "../config/tmdb";
import { useParams, useNavigate } from "react-router-dom";

const TvShowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const menuRef = useRef(null);
  const trailerRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [seasonLoading, setSeasonLoading] = useState(false);

  useEffect(() => {
    const fetchShow = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${TMDB_BASE}/tv/${id}?append_to_response=credits,videos,recommendations,external_ids`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${TMDB_TOKEN}`,
            },
          }
        );
        const data = await res.json();
        setShow(data);
        if (data.seasons?.length) {
          setSelectedSeason(data.seasons.find((s) => s.season_number > 0)?.season_number ?? data.seasons[0].season_number);
        }
      } catch (err) {
        console.error(err);
        setShow(null);
      } finally {
        setLoading(false);
      }
    };
    fetchShow();
  }, [id]);

  useEffect(() => {
    if (!selectedSeason) return;
    const fetchSeason = async () => {
      setSeasonLoading(true);
      try {
        const res = await fetch(`${TMDB_BASE}/tv/${id}/season/${selectedSeason}`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${TMDB_TOKEN}`,
          },
        });
        const data = await res.json();
        setEpisodes(data.episodes || []);
        if (data.episodes?.length) setSelectedEpisode(data.episodes[0].episode_number);
      } catch (err) {
        console.error(err);
        setEpisodes([]);
      } finally {
        setSeasonLoading(false);
      }
    };
    fetchSeason();
  }, [selectedSeason, id]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddToWatchlist = async () => {
    if (!user) {
      showToast("Please login to add to watchlist", "warning");
      navigate("/login", { state: { from: `/tv/${id}` } });
      return;
    }
    try {
      await addToWatchlist({
        movieId: show.id,
        title: show.name,
        poster_path: show.poster_path,
        release_date: show.first_air_date,
        mediaType: "tv",
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

  if (!show) {
    return (
      <div className="min-h-screen cinema-gradient text-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-400">Failed to load TV show details.</p>
        <button type="button" onClick={() => navigate(-1)} className="btn-primary">
          Go back
        </button>
      </div>
    );
  }

  const currentEpisode = episodes.find((ep) => ep.episode_number === selectedEpisode);
  const trailer =
    show.videos?.results?.find((v) => v.type === "Trailer") || show.videos?.results?.[0];
  const seasons = show.seasons?.filter((s) => s.season_number >= 0) || [];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pb-16">
      {show.backdrop_path && (
        <div className="relative h-[40vh] md:h-[60vh]">
          <img
            src={`${TMDB_IMG}/original${show.backdrop_path}`}
            alt={show.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="fixed top-20 md:top-24 left-4 z-40 flex items-center gap-2 px-4 py-2 glass-panel hover:bg-white/10 text-sm"
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
              <button type="button" onClick={handleAddToWatchlist} className="flex items-center gap-2 w-full px-4 py-3 hover:bg-white/10 text-sm">
                <Bookmark size={16} /> Add to Watchlist
              </button>
              <button type="button" onClick={handleShare} className="flex items-center gap-2 w-full px-4 py-3 hover:bg-white/10 text-sm">
                <Share2 size={16} /> Share
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          <img
            src={show.poster_path ? `${TMDB_IMG}/w500${show.poster_path}` : "/no-image.png"}
            alt={show.name}
            className="w-48 md:w-64 lg:w-72 mx-auto md:mx-0 rounded-2xl shadow-2xl ring-1 ring-white/10"
          />

          <div className="flex-1 space-y-5">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-glow">{show.name}</h1>

            {show.tagline && (
              <p className="italic text-gray-400">&ldquo;{show.tagline}&rdquo;</p>
            )}

            <div className="flex flex-wrap gap-2">
              <MetaPill accent>
                <span className="inline-flex items-center gap-1">
                  <Star size={12} /> {show.vote_average?.toFixed(1)}
                </span>
              </MetaPill>
              {show.first_air_date && <MetaPill>{show.first_air_date.slice(0, 4)}</MetaPill>}
              <MetaPill>
                <span className="inline-flex items-center gap-1">
                  <Tv size={12} /> {show.number_of_seasons} seasons
                </span>
              </MetaPill>
              <MetaPill>{show.number_of_episodes} episodes</MetaPill>
              {show.status && <MetaPill>{show.status}</MetaPill>}
            </div>

            <div className="flex flex-wrap gap-2">
              {show.genres?.map((g) => (
                <span key={g.id} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-gray-300 leading-relaxed max-w-3xl">{show.overview}</p>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleAddToWatchlist} className="btn-primary inline-flex items-center gap-2">
                <Bookmark size={16} /> Watchlist
              </button>
              {trailer && (
                <button type="button" onClick={scrollToTrailer} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 hover:bg-white/5 font-semibold">
                  <Play size={16} /> Trailer
                </button>
              )}
              {show.external_ids?.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${show.external_ids.imdb_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400"
                >
                  IMDb <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        {seasons.length > 0 && (
          <DetailSection title="Episodes">
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin mb-4">
              {seasons.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSeason(s.season_number)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${
                    selectedSeason === s.season_number
                      ? "bg-[#01B4E4] text-black"
                      : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {s.season_number === 0 ? "Specials" : `Season ${s.season_number}`}
                </button>
              ))}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin mb-4">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => setSelectedEpisode(ep.episode_number)}
                  className={`shrink-0 w-40 md:w-48 rounded-xl overflow-hidden text-left border-2 transition ${
                    selectedEpisode === ep.episode_number
                      ? "border-[#01B4E4]"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  {ep.still_path ? (
                    <img src={`${TMDB_IMG}/w300${ep.still_path}`} alt={ep.name} className="w-full h-24 md:h-28 object-cover" />
                  ) : (
                    <div className="w-full h-24 md:h-28 bg-white/5 flex items-center justify-center text-gray-500 text-xs">No image</div>
                  )}
                  <div className="p-2 bg-black/60">
                    <p className="text-sm font-medium truncate">{ep.episode_number}. {ep.name}</p>
                    <p className="text-xs text-gray-500">{ep.air_date || "TBA"}</p>
                  </div>
                </button>
              ))}
            </div>

            {seasonLoading ? (
              <p className="text-gray-500 text-sm">Loading episodes...</p>
            ) : currentEpisode ? (
              <div className="glass-panel p-5">
                <h3 className="font-semibold text-lg">
                  {currentEpisode.episode_number}. {currentEpisode.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {currentEpisode.air_date || "TBA"} · {currentEpisode.runtime || "—"} min
                </p>
                <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                  {currentEpisode.overview || "No description available."}
                </p>
              </div>
            ) : null}
          </DetailSection>
        )}

        {show.credits?.cast?.length > 0 && (
          <DetailSection title="Cast">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {show.credits.cast.slice(0, 20).map((actor) => (
                <CastCard key={actor.id} actor={actor} />
              ))}
            </div>
          </DetailSection>
        )}

        <ReviewSection
          tmdbId={show.id}
          mediaType="tv"
          title={show.name}
          poster_path={show.poster_path}
          overview={show.overview}
          release_date={show.first_air_date}
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

        {show.recommendations?.results?.length > 0 && (
          <DetailSection title="You may also like">
            <RecommendationRow items={show.recommendations.results} mediaType="tv" />
          </DetailSection>
        )}
      </div>
    </div>
  );
};

export default TvShowDetails;
