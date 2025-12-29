import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Search,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";

import MovieCard from "../component/MovieCard";
import Loader from "../component/Loader";

const API_BASE = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const DISCOVER_URL = `${API_BASE}/discover/movie`;
const SEARCH_URL = `${API_BASE}/search/movie`;
const GENRE_URL = `${API_BASE}/genre/movie/list`;

const CURRENT_YEAR = new Date().getFullYear();

function Movies() {
  const navigate = useNavigate();
  const topRef = useRef(null);
  const searchRef = useRef(null);

  /* ---------------- STATE ---------------- */
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");

  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH GENRES ---------------- */
  useEffect(() => {
    fetch(`${GENRE_URL}?api_key=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => setGenres(data.genres || []))
      .catch(() => setGenres([]));
  }, []);

  /* ---------------- SEARCH DEBOUNCE ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- FETCH MOVIES ---------------- */
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);

        let url = "";

        if (debouncedSearch) {
          url = `${SEARCH_URL}?api_key=${API_KEY}&query=${encodeURIComponent(
            debouncedSearch
          )}&page=${page}`;
        } else {
          const params = new URLSearchParams({
            api_key: API_KEY,
            page,
            sort_by: sortBy,
          });

          if (selectedGenre) params.append("with_genres", selectedGenre);

          // ✅ NEWEST MOVIES (CURRENT YEAR ONLY)
          if (sortBy === "release_date.desc") {
            params.append("primary_release_year", CURRENT_YEAR);
            params.append("vote_count.gte", 10); // avoids empty/invalid movies
          }

          url = `${DISCOVER_URL}?${params.toString()}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        setMovies(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500));

        if (debouncedSearch) {
          setSuggestions((data.results || []).slice(0, 6));
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error(err);
        setMovies([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [debouncedSearch, page, selectedGenre, sortBy]);

  /* ---------------- SCROLL TOP ---------------- */
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [page]);

  /* ---------------- CLOSE SEARCH DROPDOWN ---------------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      ref={topRef}
      className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black px-4 pb-24"
    >
      <Loader visible={loading} message="Loading Movies..." />

      {/* BACK BUTTON */}
      <div className="sticky top-[72px] md:top-[96px] z-10 w-fit">
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-black/70 rounded-lg text-white border border-white/10 hover:bg-black/90"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mt-12 mb-8">
        Movies 🎬
      </h1>

      {/* SEARCH & FILTER BAR */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md py-5 mb-8">
        <div ref={searchRef} className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movies..."
            className="w-full bg-gray-900 text-white rounded-xl pl-11 pr-10 py-3 focus:ring-2 focus:ring-red-600 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}

          <AnimatePresence>
            {showDropdown && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute w-full mt-2 bg-gray-900 rounded-xl shadow-xl z-50"
              >
                {suggestions.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/movie/${m.id}`)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-800 text-white"
                  >
                    {m.title}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap justify-center gap-4 mt-5">
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setPage(1);
            }}
            className="bg-gray-900 text-white rounded-lg px-4 py-2"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-gray-900 text-white rounded-lg px-4 py-2"
          >
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="release_date.desc">
              Newest ({CURRENT_YEAR})
            </option>
          </select>
        </div>
      </div>

      {/* GRID */}
      {movies.length === 0 && !loading ? (
        <p className="text-center text-gray-500 py-32 text-lg">
          No movies found
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => navigate(`/movie/${movie.id}`)}
            />
          ))}
        </motion.div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-6 mt-16">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="px-6 py-2 rounded-md border text-white disabled:opacity-40"
        >
          <SkipBack size={16} />
        </button>

        <span className="text-gray-400">
          Page <span className="text-white font-semibold">{page}</span> of{" "}
          {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
          className="px-6 py-2 rounded-md border text-white disabled:opacity-40"
        >
          <SkipForward size={16} />
        </button>
      </div>
    </div>
  );
}

export default Movies;
