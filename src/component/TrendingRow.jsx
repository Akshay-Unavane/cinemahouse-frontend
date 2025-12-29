import { useMemo, useEffect, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import MovieCard from "./MovieCard";

import "swiper/css";
import "swiper/css/free-mode";

const TODAY_TIME = new Date().setHours(0, 0, 0, 0);

const TrendingRow = ({
  title = "Trending",
  movies = [],
  selectedGenre = "",
  sortBy = "popularity.desc",
  mode = "normal", // "normal" | "upcoming"
}) => {
  const sectionRef = useRef(null);
  const firstRender = useRef(true);

  /* Smooth scroll on change */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedGenre, sortBy, mode]);

  const formatDate = useCallback((date) => {
    if (!date) return "TBA";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  /* 🔹 REALTIME + UPCOMING LOGIC */
  const processedMovies = useMemo(() => {
    if (!Array.isArray(movies) || movies.length === 0) return [];

    let list = movies.filter((m) => m?.id && m?.title);

    if (mode === "upcoming") {
      list = list
        .filter((m) => {
          const releaseTime = m.release_date
            ? new Date(m.release_date).setHours(0, 0, 0, 0)
            : null;

          // Upcoming if release >= today OR vote_average === 0
          return releaseTime >= TODAY_TIME || m.vote_average === 0;
        })
        .sort((a, b) => {
          // First sort by release date ascending (soonest first)
          const dateA = new Date(a.release_date || TODAY_TIME);
          const dateB = new Date(b.release_date || TODAY_TIME);
          return dateA - dateB;
        });
    }

    // Genre filter
    if (selectedGenre) {
      const genreId = Number(selectedGenre);
      list = list.filter((m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(genreId));
    }

    // Sorting for normal mode
    if (mode !== "upcoming") {
      switch (sortBy) {
        case "release_date.desc":
          list.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
          break;
        case "vote_average.desc":
          list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
          break;
        case "popularity.desc":
        default:
          list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          break;
      }
    }

    return list;
  }, [movies, selectedGenre, sortBy, mode]);

  if (!processedMovies.length) return null;

  return (
    <section ref={sectionRef} className="mb-16 scroll-mt-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      </div>

      {/* Movie Row */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${title}-${selectedGenre}-${sortBy}-${mode}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Swiper
            modules={[FreeMode, Mousewheel]}
            slidesPerView="auto"
            spaceBetween={16}
            freeMode
            mousewheel={{ forceToAxis: true, sensitivity: 0.6 }}
            className="px-4"
          >
            {processedMovies.map((movie) => (
              <SwiperSlide
                key={movie.id}
                className="!w-[150px] sm:!w-[180px] md:!w-[200px] transition-transform hover:scale-105 duration-300"
              >
                <MovieCard movie={movie}>
                  <div className="mt-2 text-xs text-gray-300 flex flex-col gap-1">
                    <span className="font-semibold text-white truncate">{movie.title}</span>
                    <span className="text-gray-400">{formatDate(movie.release_date)}</span>
                    {movie.vote_average > 0 && (
                      <span className="text-yellow-400">⭐ {movie.vote_average.toFixed(1)}</span>
                    )}
                  </div>
                </MovieCard>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default TrendingRow;
