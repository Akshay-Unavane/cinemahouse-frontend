import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "../component/HeroSection";
import MovieCard from "../component/MovieCard";
import Loader from "../component/Loader";
import { SkipBack, SkipForward } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const OPTIONS = {
  trending_day: "Trending Today",
  trending_week: "Trending This Week",
  popular: "Popular Movies",
  top_rated: "Top Rated",
  upcoming: "Upcoming",
};

const endpoints = {
  trending_day: "/trending/movie/day",
  trending_week: "/trending/movie/week",
  popular: "/movie/popular",
  top_rated: "/movie/top_rated",
  upcoming: "/movie/upcoming",
};

const Home = () => {
  const [category, setCategory] = useState("trending_day");
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const contentRef = useRef(null);
  const isFirstLoad = useRef(true); // ✅ ADD: prevents first-load race

  // ✅ ADD: stable fetch function
  const fetchData = useCallback(async () => {
    if (!API_BASE || !API_KEY) {
      console.error("TMDB ENV variables missing");
      return;
    }

    if (page < 1) return; // ✅ ADD safety

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${API_BASE}${endpoints[category]}`,
        {
          params: {
            api_key: API_KEY,
            page,
          },
        }
      );

      setMovies(data?.results ?? []);
    } catch (error) {
      console.error("Home fetch error:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  /* Reset page when category changes */
  useEffect(() => {
    if (!isFirstLoad.current) {
      setPage(1);
    }
  }, [category]);

  /* Fetch data */
  useEffect(() => {
    fetchData();

    if (isFirstLoad.current) {
      isFirstLoad.current = false; // ✅ ADD
    }
  }, [fetchData]);

  /* EXISTING SCROLL LOGIC (UNCHANGED) */
  useEffect(() => {
    contentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [category, page]);

  /* FORCE TOP ON REFRESH */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* FORCE TOP ON PAGINATION & CATEGORY CHANGE */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [category, page]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* HERO */}
      <HeroSection movies={movies.slice(0, 5)} />

      <main ref={contentRef} className="px-4 pb-24">
        {/* FILTER BAR */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-lg border-b border-white/10 mb-8">
          <div className="max-w-7xl mx-auto py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-extrabold">
              {OPTIONS[category]}
            </h2>

            {/* DESKTOP TABS */}
            <div className="hidden md:flex gap-2">
              {Object.entries(OPTIONS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`px-4 py-2 text-sm rounded-full transition ${
                    category === key
                      ? "bg-[#01B4E4] text-black"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* MOBILE DROPDOWN */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="md:hidden bg-black border border-white/30 px-4 py-2 rounded-lg text-sm"
            >
              {Object.entries(OPTIONS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-28"
            >
              <Loader />
            </motion.div>
          ) : movies.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 py-24"
            >
              No content found.
            </motion.p>
          ) : (
            <motion.div
              key={`${category}-${page}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 max-w-7xl mx-auto"
            >
              {movies.map((movie) => (
                <MovieCard
                  key={`${movie.id}-${category}`}
                  movie={movie}
                  featured={category.includes("trending")}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-6 mt-16">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            <SkipBack size={16} />
          </button>

          <span className="text-sm text-gray-400">
            Page <span className="text-white font-semibold">{page}</span>
          </span>

          <button
            disabled={loading || page >= 500}
            onClick={() => setPage((p) => Math.min(500, p + 1))}
            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <SkipForward size={16} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
