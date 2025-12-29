import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/pagination";

import { trackInteraction } from "../utils/aiTracker";
import { rankByAI } from "../utils/aiRecommandtion";
import Loader from "./Loader";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/original";

const HeroSection = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current = new AbortController();

    const fetchHeroData = async () => {
      try {
        setLoading(true);

        const urls = [
          `${API_BASE}/trending/all/week`,
          `${API_BASE}/movie/popular`,
          `${API_BASE}/tv/popular`,
        ];

        const responses = await Promise.all(
          urls.map((url) =>
            axios.get(url, {
              params: { api_key: API_KEY },
              signal: abortRef.current.signal,
            })
          )
        );

        const merged = responses
          .flatMap((res) => res.data?.results || [])
          .filter((item) => item?.backdrop_path);

        const unique = Array.from(
          new Map(
            merged.map((item) => [
              `${item.id}-${item.media_type || (item.title ? "movie" : "tv")}`,
              item,
            ])
          ).values()
        );

        setSlides(rankByAI(unique).slice(0, 8));
      } catch (err) {
        if (!axios.isCancel(err)) console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
    return () => abortRef.current?.abort();
  }, []);

  return (
    <section className="relative w-full h-[100svh] bg-black overflow-hidden">
      <Loader visible={loading} message="Loading Home Page..." />

      {!loading && slides.length > 0 && (
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="h-full"
        >
          {slides.map((item) => {
            const title = item.title || item.name;
            const mediaType =
              item.media_type || (item.title ? "movie" : "tv");

            return (
              <SwiperSlide key={`${item.id}-${mediaType}`}>
                {/* BACKGROUND */}
                <img
                  src={`${IMG_BASE}${item.backdrop_path}`}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* GRADIENT OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/60 to-transparent" />

                {/* CONTENT */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="
                    relative z-10 h-full
                    flex items-end md:items-center
                    px-5 sm:px-8 md:px-16 lg:px-24
                    pb-24 md:pb-0
                  "
                >
                  <div className="max-w-xl lg:max-w-2xl text-white space-y-4">
                    <span className="text-xs uppercase tracking-widest text-[#01B4E4]">
                      AI Recommended
                    </span>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                      {title}
                    </h1>

                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400" />
                        {item.vote_average?.toFixed(1)}
                      </span>
                      <span>
                        {(item.release_date || item.first_air_date || "")
                          .slice(0, 4)}
                      </span>
                    </div>

                    <p className="!text-gray-300 text-sm md:text-base line-clamp-3">
                      {item.overview || "No description available."}
                    </p>

                    <button
                      onClick={() => {
                        trackInteraction(item);
                        navigate(
                          mediaType === "movie"
                            ? `/movie/${item.id}`
                            : `/tv/${item.id}`,
                          { state: { mediaType } }
                        );
                      }}
                      className="
                        inline-flex items-center gap-2
                        px-6 py-3 md:px-8
                        bg-[#01B4E4] text-black font-semibold
                        rounded-lg
                        hover:bg-[#02c7ff]
                        active:scale-95
                        transition
                      "
                    >
                      <Play size={18} />
                      See Details
                    </button>
                  </div>
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </section>
  );
};

export default HeroSection;
