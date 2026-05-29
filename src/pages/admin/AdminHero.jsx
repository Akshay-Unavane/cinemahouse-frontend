import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Sparkles,
  MonitorPlay,
  ExternalLink,
} from "lucide-react";
import {
  getAdminHeroSlides,
  addAdminHeroSlide,
  removeAdminHeroSlide,
  reorderAdminHeroSlides,
} from "../../service/admin";
import { getHeroSlides } from "../../service/hero";
import { useToast } from "../../context/useToast";
import Loader from "../../component/Loader";

const TMDB_BASE = import.meta.env.VITE_API_BASE_URL;
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_TOKEN = import.meta.env.VITE_API_TOKEN;
const IMG = "https://image.tmdb.org/t/p/w500";
const BACKDROP = "https://image.tmdb.org/t/p/w780";
const HERO_ORIGINAL = "https://image.tmdb.org/t/p/original";

function normalizeSearchItem(item) {
  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name || "Untitled";
  return {
    tmdbId: item.id,
    mediaType,
    title,
    overview: item.overview || "",
    backdrop_path: item.backdrop_path,
    poster_path: item.poster_path,
    vote_average: item.vote_average ?? 0,
    release_date: item.release_date || item.first_air_date || null,
  };
}

const AdminHero = () => {
  const { showToast } = useToast();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [liveOnHome, setLiveOnHome] = useState([]);
  const [liveSource, setLiveSource] = useState("admin");
  const [previewIndex, setPreviewIndex] = useState(0);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminHeroSlides();
      setSlides(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load hero slides", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadLiveHomePreview = useCallback(async () => {
    try {
      const publicSlides = await getHeroSlides();
      if (publicSlides.length > 0) {
        setLiveOnHome(publicSlides);
        setLiveSource("admin");
        setPreviewIndex(0);
        return;
      }

      const urls = [
        `${TMDB_BASE}/trending/all/week`,
        `${TMDB_BASE}/movie/popular`,
      ];
      const responses = await Promise.all(
        urls.map((url) =>
          axios.get(url, { params: { api_key: TMDB_KEY } })
        )
      );
      const merged = responses
        .flatMap((res) => res.data?.results || [])
        .filter((item) => item?.backdrop_path)
        .slice(0, 8)
        .map((item) => ({
          tmdbId: item.id,
          mediaType: item.media_type || (item.title ? "movie" : "tv"),
          title: item.title || item.name,
          overview: item.overview,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average,
          release_date: item.release_date || item.first_air_date,
        }));

      setLiveOnHome(merged);
      setLiveSource("fallback");
      setPreviewIndex(0);
    } catch {
      setLiveOnHome([]);
      setLiveSource("none");
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    if (!loading) loadLiveHomePreview();
  }, [loading, slides, loadLiveHomePreview]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const headers = TMDB_TOKEN
          ? { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" }
          : undefined;

        const url = TMDB_TOKEN
          ? `${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&include_adult=false`
          : `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;

        const res = await fetch(url, { headers });
        const data = await res.json();
        const filtered = (data.results || []).filter(
          (r) =>
            (r.media_type === "movie" || r.media_type === "tv") && r.backdrop_path
        );
        setResults(filtered);
      } catch {
        showToast("TMDB search failed", "error");
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, showToast]);

  const isInHero = (tmdbId, mediaType) =>
    slides.some((s) => s.tmdbId === tmdbId && s.mediaType === mediaType);

  const handleAdd = async (item) => {
    const payload = normalizeSearchItem(item);
    try {
      const res = await addAdminHeroSlide(payload);
      setSlides((prev) => [...prev, res.slide]);
      await loadLiveHomePreview();
      showToast("Added to hero section", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add", "error");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove from hero section?")) return;
    try {
      await removeAdminHeroSlide(id);
      setSlides((prev) => prev.filter((s) => s._id !== id));
      await loadLiveHomePreview();
      showToast("Removed from hero", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Remove failed", "error");
    }
  };

  const moveSlide = async (index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= slides.length) return;
    const reordered = [...slides];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setSlides(reordered);
    try {
      const updated = await reorderAdminHeroSlides(reordered.map((s) => s._id));
      setSlides(updated);
      await loadLiveHomePreview();
    } catch {
      showToast("Reorder failed", "error");
      fetchSlides();
    }
  };

  const activePreview = liveOnHome[previewIndex];

  if (loading) return <Loader message="Loading hero section..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-cyan-400" size={20} />
            <h2 className="text-xl font-semibold">Hero Section</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {slides.length}/12 slides · These appear on the home page carousel
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-sm border border-cyan-500/40 text-cyan-300 rounded-lg hover:bg-cyan-500/10"
          >
            <ExternalLink size={16} />
            View home page
          </Link>
          <button
            onClick={() => {
              fetchSlides();
              loadLiveHomePreview();
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 w-fit"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Live homepage preview */}
      <div className="border border-emerald-500/30 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-950/40 to-black/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/10">
          <div className="flex items-center gap-2">
            <MonitorPlay size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-emerald-100">Currently on home page</h3>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-black/40 text-gray-300 w-fit">
            {liveSource === "admin"
              ? "Your admin picks (carousel order)"
              : liveSource === "fallback"
                ? "Auto TMDB trending (no admin slides yet)"
                : "Nothing to preview"}
          </span>
        </div>

        {liveOnHome.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 text-center">
            Home hero has no slides to show right now.
          </p>
        ) : (
          <>
            <div className="relative h-48 sm:h-56 md:h-64">
              {activePreview?.backdrop_path && (
                <img
                  src={`${HERO_ORIGINAL}${activePreview.backdrop_path}`}
                  alt={activePreview.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <span className="text-xs uppercase tracking-widest text-[#01B4E4]">
                  Slide {previewIndex + 1} of {liveOnHome.length}
                </span>
                <h4 className="text-xl sm:text-2xl font-bold mt-1">{activePreview?.title}</h4>
                <p className="text-sm text-gray-300 capitalize mt-0.5">
                  {activePreview?.mediaType}
                  {activePreview?.release_date
                    ? ` · ${String(activePreview.release_date).slice(0, 4)}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-3">
                Carousel order (left → right = first → last on home):
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {liveOnHome.map((slide, index) => (
                  <button
                    key={`${slide.tmdbId}-${slide.mediaType}-${index}`}
                    type="button"
                    onClick={() => setPreviewIndex(index)}
                    className={`shrink-0 w-28 rounded-lg overflow-hidden border-2 transition ${
                      previewIndex === index
                        ? "border-cyan-400 ring-2 ring-cyan-400/40"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {slide.backdrop_path ? (
                      <img
                        src={`${BACKDROP}${slide.backdrop_path}`}
                        alt={slide.title}
                        className="w-full h-16 object-cover"
                      />
                    ) : (
                      <div className="w-full h-16 bg-white/10" />
                    )}
                    <div className="p-2 bg-black/80 text-left">
                      <p className="text-[10px] text-cyan-300">#{index + 1}</p>
                      <p className="text-xs font-medium truncate">{slide.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search */}
      <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
        <label className="text-sm text-gray-300 mb-2 block">Search movies & TV (TMDB)</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. Inception, Breaking Bad..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/15 bg-white/5 text-white outline-none focus:border-cyan-400"
          />
        </div>
        {searching && <p className="text-xs text-gray-500 mt-2">Searching...</p>}

        {results.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {results.map((item) => {
              const payload = normalizeSearchItem(item);
              const added = isInHero(payload.tmdbId, payload.mediaType);
              return (
                <div
                  key={`${item.id}-${item.media_type}`}
                  className="flex gap-3 p-3 rounded-lg border border-white/10 bg-black/30"
                >
                  {item.poster_path ? (
                    <img
                      src={`${IMG}${item.poster_path}`}
                      alt=""
                      className="w-14 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-14 h-20 bg-white/10 rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{payload.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{payload.mediaType}</p>
                    <button
                      disabled={added}
                      onClick={() => handleAdd(item)}
                      className="mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded bg-cyan-600/80 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />
                      {added ? "Added" : "Add to hero"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manage hero list */}
      <div>
        <h3 className="text-lg font-medium mb-1">Manage hero slides</h3>
        <p className="text-sm text-gray-400 mb-3">
          Edit below — changes update what visitors see on the main page (when you have at least one slide).
        </p>
        {slides.length === 0 ? (
          <p className="text-gray-400 text-sm border border-dashed border-white/20 rounded-xl p-8 text-center">
            No hero slides yet. Search above and add movies or TV shows with a backdrop image.
          </p>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, index) => (
              <div
                key={slide._id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]"
              >
                {slide.backdrop_path && (
                  <img
                    src={`${BACKDROP}${slide.backdrop_path}`}
                    alt=""
                    className="w-full sm:w-48 h-28 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                      Home slide #{index + 1}
                    </span>
                    {liveSource === "admin" && previewIndex === index && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        Previewing now
                      </span>
                    )}
                  </div>
                  <p className="font-semibold mt-1">{slide.title}</p>
                  <p className="text-sm text-gray-400 capitalize">
                    {slide.mediaType} · TMDB {slide.tmdbId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{slide.overview}</p>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => moveSlide(index, -1)}
                    disabled={index === 0}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveSlide(index, 1)}
                    disabled={index === slides.length - 1}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => handleRemove(slide._id)}
                    className="p-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/40"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHero;
