import { ChevronLeft, Star, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_URL = "https://api.themoviedb.org/3/search/movie";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TOKEN = import.meta.env.VITE_API_TOKEN;

const Browse = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get("q") || "";

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* FETCH SEARCH RESULTS */
  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    const controller = new AbortController();

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}?query=${encodeURIComponent(query)}&include_adult=false`,
          {
            headers: {
              Authorization: `Bearer ${TOKEN}`,
              accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        const data = await res.json();
        setMovies(data.results || []);
      } catch {
        setError("Failed to fetch movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
    return () => controller.abort();
  }, [query]);

  /* LOADING STATE */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-gray-400">
          Searching for “{query}”...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-10 pt-28 pb-12">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="
          fixed top-20 left-4 z-40
          flex items-center gap-1
          px-4 py-2
          bg-black/60 backdrop-blur-xl
          border border-white/10
          rounded-xl
          hover:bg-black/90
          transition
        "
      >
        <ChevronLeft size={18} />
        Back
      </button>

      {/* TITLE */}
      <h1 className="text-xl sm:text-2xl font-bold mb-8">
        Search results for{" "}
        <span className="text-[#01B4E4]">“{query}”</span>
      </h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* EMPTY STATE */}
      {!error && movies.length === 0 && (
        <div className="flex flex-col items-center justify-center text-gray-400 mt-20">
          <SearchX size={56} className="mb-4 opacity-70" />
          <p>No movies found</p>
        </div>
      )}

      {/* MOVIE GRID */}
      <div className="
        grid gap-6
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-6
      ">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="
              group cursor-pointer
              transition-transform duration-300
              hover:-translate-y-2
            "
          >
            {/* POSTER */}
            <div className="
              relative w-full aspect-[2/3]
              rounded-2xl overflow-hidden
              bg-gray-800
              shadow-lg
            ">
              <img
                src={
                  movie.poster_path
                    ? `${IMAGE_BASE}${movie.poster_path}`
                    : "/no-image.png"
                }
                alt={movie.title}
                loading="lazy"
                className={`
                  absolute inset-0 w-full h-full
                  ${
                    movie.poster_path
                      ? "object-cover"
                      : "object-contain p-6"
                  }
                  group-hover:scale-110
                  transition-transform duration-500
                `}
              />

              {/* HOVER OVERLAY */}
              <div className="
                absolute inset-0
                bg-gradient-to-t
                from-black/90 via-black/30 to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity
              " />

              {/* RATING BADGE */}
              <div className="
                absolute top-2 right-2
                bg-black/70 backdrop-blur
                px-2 py-1 rounded-lg
                flex items-center gap-1
                text-xs
              ">
                <Star size={14} className="text-yellow-400" />
                {movie.vote_average?.toFixed(1) || "N/A"}
              </div>
            </div>

            {/* INFO */}
            <h3 className="
              mt-3 text-sm font-semibold
              line-clamp-2
              group-hover:text-[#01B4E4]
              transition-colors
            ">
              {movie.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Browse;
