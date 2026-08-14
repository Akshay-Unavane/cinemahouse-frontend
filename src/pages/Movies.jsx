import { useCallback, useEffect, useRef, useState } from "react";
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
  const discoverControllerRef = useRef(null);
  const suggestionsControllerRef = useRef(null);
  const searchControllerRef = useRef(null);

  const [genres, setGenres] = useState([]);
  const [discoverMovies, setDiscoverMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [moviesToRender, setMoviesToRender] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [discoverTotalPages, setDiscoverTotalPages] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [loading, setLoading] = useState(false);

  const resetSuggestions = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  }, []);

  /* ---------------- FETCH GENRES ---------------- */
  useEffect(() => {
    fetch(`${GENRE_URL}?api_key=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => setGenres(data.genres || []))
      .catch(() => setGenres([]));
  }, []);

  /* ---------------- SEARCH DEBOUNCE ---------------- */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      setDebouncedSearch(trimmed);

      if (!trimmed) {
        setIsSearching(false);
        setSearchExecuted(false);
        resetSuggestions();
        setPage(1);
        return;
      }

      setIsSearching(true);
      setSearchExecuted(false);
      setMoviesToRender([]);
      setShowSuggestions(true);
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchInput, resetSuggestions]);

  /* ---------------- FETCH DISCOVER MOVIES ---------------- */
  const fetchDiscoverMovies = useCallback(
    async (nextPage, signal) => {
      if (!API_KEY) return;

      setLoading(true);

      const params = new URLSearchParams({
        api_key: API_KEY,
        page: nextPage,
        sort_by: sortBy,
      });

      if (selectedGenre) params.append("with_genres", selectedGenre);

      if (sortBy === "release_date.desc") {
        params.append("primary_release_year", CURRENT_YEAR);
        params.append("vote_count.gte", 10);
      }

      const url = `${DISCOVER_URL}?${params.toString()}`;

      try {
        discoverControllerRef.current?.abort();
        discoverControllerRef.current = signal;

        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error("Discover API error");

        const data = await res.json();
        const results = data.results || [];
        const pages = Math.min(data.total_pages || 1, 500);

        setDiscoverMovies(results);
        setDiscoverTotalPages(pages);
        setTotalPages(pages);

        if (!searchExecuted && !isSearching) {
          setMoviesToRender(results);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setDiscoverMovies([]);
          setDiscoverTotalPages(1);
          setTotalPages(1);
          if (!searchExecuted && !isSearching) {
            setMoviesToRender([]);
          }
        }
      } finally {
        if (discoverControllerRef.current === signal) {
          setLoading(false);
        }
      }
    },
    [selectedGenre, sortBy, searchExecuted, isSearching]
  );

  useEffect(() => {
    if (searchExecuted || isSearching || debouncedSearch) {
      return;
    }

    const controller = new AbortController();
    fetchDiscoverMovies(page, controller.signal);

    return () => controller.abort();
  }, [page, fetchDiscoverMovies, searchExecuted, isSearching, debouncedSearch]);

  /* ---------------- FETCH SEARCH SUGGESTIONS ---------------- */
  const fetchSuggestions = useCallback(
    async (query, signal) => {
      if (!query) {
        resetSuggestions();
        return;
      }

      try {
        suggestionsControllerRef.current?.abort();
        suggestionsControllerRef.current = signal;

        const res = await fetch(
          `${SEARCH_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`,
          { signal }
        );

        if (!res.ok) throw new Error("Suggestions API error");

        const data = await res.json();
        const results = (data.results || []).slice(0, 6);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSelectedSuggestionIndex(-1);
        setMoviesToRender([]);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          resetSuggestions();
        }
      } finally {
        if (suggestionsControllerRef.current === signal) {
          setLoading(false);
        }
      }
    },
    [resetSuggestions]
  );

  useEffect(() => {
    if (!debouncedSearch || searchExecuted) {
      if (!debouncedSearch) {
        resetSuggestions();
      }
      return;
    }

    const controller = new AbortController();
    fetchSuggestions(debouncedSearch, controller.signal);

    return () => controller.abort();
  }, [debouncedSearch, fetchSuggestions, resetSuggestions, searchExecuted]);

  /* ---------------- FETCH SEARCH RESULTS ---------------- */
  useEffect(() => {
    if (!searchExecuted || !debouncedSearch) return;

    const controller = new AbortController();
    searchControllerRef.current?.abort();
    searchControllerRef.current = controller;

    const fetchSearchResults = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          api_key: API_KEY,
          query: debouncedSearch,
          page,
        });

        const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Search API error");

        const data = await res.json();
        const results = data.results || [];
        const pages = Math.min(data.total_pages || 1, 500);

        setSearchResults(results);
        setSearchTotalPages(pages);
        setTotalPages(pages);
        setMoviesToRender(results);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setSearchResults([]);
          setSearchTotalPages(1);
          setTotalPages(1);
          setMoviesToRender([]);
        }
      } finally {
        if (searchControllerRef.current === controller) {
          setLoading(false);
        }
      }
    };

    fetchSearchResults();

    return () => controller.abort();
  }, [debouncedSearch, page, searchExecuted]);

  /* ---------------- SCROLL TOP ---------------- */
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [page]);

  /* ---------------- CLOSE SEARCH DROPDOWN ---------------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------------- KEYBOARD NAVIGATION ---------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showSuggestions, suggestions]);

  const handleSearchSubmit = useCallback((query = searchInput) => {
    const trimmed = query.trim();

    if (!trimmed) {
      setSearchInput("");
      setDebouncedSearch("");
      setIsSearching(false);
      setSearchExecuted(false);
      setShowSuggestions(false);
      setMoviesToRender(discoverMovies);
      setPage(1);
      setSelectedSuggestionIndex(-1);
      return;
    }

    setSearchInput(trimmed);
    setDebouncedSearch(trimmed);
    setSearchExecuted(true);
    setIsSearching(true);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setPage(1);
  }, [discoverMovies, searchInput]);

  const handleSuggestionSelect = useCallback(
    (movie) => {
      const nextQuery = movie.title || movie.name || "";
      setSearchInput(nextQuery);
      setDebouncedSearch(nextQuery);
      setSearchExecuted(true);
      setIsSearching(true);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      setPage(1);
    },
    []
  );

  const handleInputKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (showSuggestions && suggestions.length > 0 && selectedSuggestionIndex >= 0) {
          const selected = suggestions[selectedSuggestionIndex];
          handleSuggestionSelect(selected);
          return;
        }

        handleSearchSubmit(searchInput);
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    },
    [handleSearchSubmit, handleSuggestionSelect, searchInput, selectedSuggestionIndex, showSuggestions, suggestions]
  );

  const isTyping = Boolean(searchInput.trim()) && !searchExecuted;
  const isShowingSearchResults = searchExecuted && debouncedSearch;
  const shouldShowPagination = !loading && (isShowingSearchResults || (!isSearching && discoverMovies.length > 0));
  const shouldRenderMovies = !isTyping && moviesToRender.length > 0;

  return (
    <div
      ref={topRef}
      className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black px-4 pb-24"
    >
      <Loader visible={loading} message="Loading Movies..." />

      {/* BACK BUTTON */}
      <div className=" top-14 sm:top-16 z-10 w-fit">
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-black/70 rounded-lg text-white border border-white/10 hover:bg-black/90"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      {/* TITLE */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white text-center mt-4 sm:mt-8 mb-6 sm:mb-8">
        Movies
      </h1>

      {/* SEARCH & FILTER BAR */}
      <div className="relative z-[9999] bg-black/80 backdrop-blur-md py-4 sm:py-5 mb-6 sm:mb-8">

        <div ref={searchRef} className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSearchExecuted(false);
              setMoviesToRender([]);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search movies..."
            className="w-full bg-gray-900 text-white rounded-xl pl-11 pr-10 py-3 focus:ring-2 focus:ring-red-600 outline-none"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                setDebouncedSearch("");
                setSearchExecuted(false);
                setIsSearching(false);
                setShowSuggestions(false);
                setMoviesToRender(discoverMovies);
                setPage(1);
                setSelectedSuggestionIndex(-1);
              }}
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute w-full mt-2 bg-gray-900 rounded-xl shadow-xl z-[1000] overflow-hidden"
              >
                {suggestions.map((movie, index) => {
                  const title = movie.title || movie.name || "Untitled";
                  const releaseYear = movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : "—";
                  const poster = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                    : "/placeholder.jpg";

                  return (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => handleSuggestionSelect(movie)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-white transition ${
                        index === selectedSuggestionIndex
                          ? "bg-red-600/20"
                          : "hover:bg-gray-800"
                      }`}
                    >
                      <img
                        src={poster}
                        alt={title}
                        className="h-14 w-10 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.jpg";
                        }}
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{title}</span>
                        <span className="text-sm text-gray-400">{releaseYear}</span>
                      </div>
                    </button>
                  );
                })}
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
            disabled={isSearching || searchExecuted}
            className="bg-gray-900 text-white rounded-lg px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            disabled={isSearching || searchExecuted}
            className="bg-gray-900 text-white rounded-lg px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="release_date.desc">Newest ({CURRENT_YEAR})</option>
          </select>
        </div>
      </div>

      {/* GRID */}
      {isTyping ? null : moviesToRender.length === 0 && !loading ? (
        <p className="text-center text-gray-500 py-32 text-lg">
          No movies found
        </p>
      ) : (
        shouldRenderMovies && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            {moviesToRender.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </motion.div>
        )
      )}

      {/* PAGINATION */}
      {shouldShowPagination && (
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
      )}
    </div>
  );
}

export default Movies;
