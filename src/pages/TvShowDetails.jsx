import { ChevronLeft, ExternalLink, MoreVertical, Bookmark, Share2, Link as LinkIcon } from "lucide-react";
import { useState as useReactState } from "react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { addToWatchlist } from "../service/watchlist";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "https://api.themoviedb.org/3/tv/";
const API_KEY = import.meta.env.VITE_API_TOKEN;

const TvShowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useReactState(false);

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [seasonLoading, setSeasonLoading] = useState(false);

  // ---------------- FETCH TV SHOW ----------------
  useEffect(() => {
    const fetchShow = async () => {
      try {
        const res = await fetch(
          `${API_URL}${id}?append_to_response=credits,videos,recommendations,external_ids`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );

        const data = await res.json();
        setShow(data);

        if (data.seasons?.length) {
          setSelectedSeason(data.seasons[0].season_number);
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

  // ---------------- FETCH SEASON EPISODES ----------------
  useEffect(() => {
    if (!selectedSeason) return;

    const fetchSeason = async () => {
      setSeasonLoading(true);
      try {
        const res = await fetch(`${API_URL}${id}/season/${selectedSeason}`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        });
        const data = await res.json();
        setEpisodes(data.episodes || []);
        if (data.episodes?.length) {
          setSelectedEpisode(data.episodes[0].episode_number);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSeasonLoading(false);
      }
    };
    fetchSeason();
  }, [selectedSeason, id]);

  if (loading) return <div className="min-h-screen bg-black" />;
  if (!show)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Failed to load TV show
      </div>
    );

  const currentEpisode = episodes.find(
    (ep) => ep.episode_number === selectedEpisode
  );

  // --- 3-dot menu actions ---
  const _handleNavigateToPosterBackdrop = () => {
    navigate(`/poster-backdrop/${id}`);
  };

  const handleAddToWatchlist = async () => {
    if (!user) {
      showToast("Please login to add to watchlist", "error");
      return;
    }
    try {
      await addToWatchlist({
        // userId: user._id,
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

  const menuOptions = [
    { label: "Add to Watchlist", action: handleAddToWatchlist },
    { label: "Share", action: handleShare },
    // { label: "View Poster/Backdrop", action: handleNavigateToPosterBackdrop },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* BACKDROP */}
      {show.backdrop_path && (
        <div className="relative h-[40vh] md:h-[60vh]">
          <img
            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
            alt={show.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>
      )}





      {/* PAGE CONTENT */}
      <div className="relative max-w-7xl mx-auto px-4 pt-16 md:pt-0 -mt-32 md:-mt-72">
        {/* 3-dot menu */}
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10"
            aria-label="More actions"
          >
            <MoreVertical size={22} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#18181b] border border-white/10 rounded-xl shadow-lg overflow-hidden animate-fade-in">
              
              {menuOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={option.action}
                  className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-white/10 text-sm"
                >
                  {option.label === "Add to Watchlist" && <Bookmark size={16} />}
                  {option.label === "Share" && <Share2 size={16} />}
                  {/* {option.label === "View Poster/Backdrop" && <LinkIcon size={16} />} */}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="fixed top-20 md:top-28 left-4 z-20 md:z-40 flex items-center gap-2 px-4 py-2 bg-black/70 rounded-lg hover:bg-black/90"
        >
          <ChevronLeft /> Back
        </button>

        {/* MAIN SECTION (POSTER + DETAILS) */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          <img
            src={
              show.poster_path
                ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                : "/no-image.png"
            }
            alt={show.name}
            className="w-48 md:w-64 lg:w-72 mx-auto md:mx-0 rounded-2xl shadow-2xl"
          />

          <div className="flex-1 space-y-5">
            {/* TITLE */}
            <h1 className="text-2xl md:text-4xl font-extrabold text-white">
              {show.name}
            </h1>

            {/* TAGLINE */}
            {show.tagline && (
              <p className="italic !text-gray-400 text-sm md:text-base bg-black/40 px-4 py-1.5 rounded-lg w-fit">
                “{show.tagline}”
              </p>
            )}

            {/* META */}
            <div className="flex flex-wrap gap-3 text-xs md:text-sm text-gray-400">
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-semibold">
                ★ {show.vote_average?.toFixed(1)}
              </span>
              <span>First Air: {show.first_air_date}</span>
              <span>Seasons: {show.number_of_seasons}</span>
              <span>Episodes: {show.number_of_episodes}</span>
              <span>Status: {show.status}</span>
            </div>

            {/* GENRES */}
            <div className="flex flex-wrap gap-2">
              {show.genres?.map((g) => (
                <span
                  key={g.id}
                  className="bg-white/10 text-slate-200 px-3 py-1 rounded-full text-xs"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* OVERVIEW */}
            <p className="!text-gray-400 leading-relaxed text-sm md:text-base max-w-3xl bg-black/40 rounded-lg px-4 py-3">
              {show.overview}
            </p>

            {/* EXTRA INFO */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-black/50 rounded-lg p-4">
              <div>
                <p className="text-slate-400 text-xs">Original Language</p>
                <p className="font-semibold uppercase">{show.original_language}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Type</p>
                <p className="font-semibold">{show.type || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Episodes Count</p>
                <p className="font-semibold">{show.number_of_episodes}</p>
              </div>
            </div>

            {/* IMDb Link */}
            {show.external_ids?.imdb_id && (
              <a
                href={`https://www.imdb.com/title/${show.external_ids.imdb_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 w-fit"
              >
                IMDb <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        {/* ---------------- SEASON & EPISODE SELECT ---------------- */}
        <div className="mt-10">
          {/* SEASON SELECT */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 mb-4">
            {show.seasons?.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSeason(s.season_number)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm ${
                  selectedSeason === s.season_number
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Season {s.season_number}
              </button>
            ))}
          </div>

          {/* EPISODE SELECT */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 mb-4">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                onClick={() => setSelectedEpisode(ep.episode_number)}
                className={`flex-shrink-0 w-40 md:w-48 rounded-lg overflow-hidden cursor-pointer border-2 ${
                  selectedEpisode === ep.episode_number
                    ? "border-yellow-500"
                    : "border-transparent hover:border-gray-400"
                }`}
              >
                {ep.still_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                    alt={ep.name}
                    className="w-full h-24 md:h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 md:h-32 bg-gray-700 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="p-2 bg-black/50 text-sm">
                  <p className="font-semibold truncate">
                    {ep.episode_number}. {ep.name}
                  </p>
                  <p className="text-gray-400 text-xs">{ep.air_date || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CURRENT EPISODE DETAILS */}
          {seasonLoading ? (
            <p className="text-gray-400">Loading episodes...</p>
          ) : currentEpisode ? (
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-lg mb-1">
                {currentEpisode.episode_number}. {currentEpisode.name}
              </h3>
              <p className="text-sm text-gray-400 mb-1">
                Air Date: {currentEpisode.air_date} • Runtime: {currentEpisode.runtime || "N/A"} min
              </p>
              <p className="text-gray-300 text-sm">
                {currentEpisode.overview || "No description available."}
              </p>
            </div>
          ) : null}
        </div>

        {/* CAST */}
        {show.credits?.cast?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {show.credits.cast.slice(0, 15).map((actor) => (
                <div key={actor.id} 
                onClick={()=>navigate(`/person/${actor.id}`)}
                className="w-24 md:w-28 text-center cursor-pointer group flex-shrink-0">
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : "/no-image.png"
                    }
                    className="w-full h-32 md:h-36 object-cover rounded-xl mb-2"
                    alt={actor.name}
                  />
                  <p className="text-xs md:text-sm font-medium truncate">{actor.name}</p>
                  <p className="text-xs text-gray-400 truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRAILER */}
        {show.videos?.results?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Trailer</h2>
            <iframe
              className="w-full h-56 sm:h-72 md:h-[480px] rounded-xl"
              src={`https://www.youtube.com/embed/${show.videos.results[0].key}`}
              allowFullScreen
              title="Trailer"
            />
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {show.recommendations?.results?.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Recommendations</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {show.recommendations.results.slice(0, 10).map((rec) => (
                <img
                  key={rec.id}
                  src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                  alt={rec.name}
                  className="w-32 h-48 rounded-xl cursor-pointer hover:scale-105 transition"
                  onClick={() => navigate(`/tv/${rec.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TvShowDetails;
