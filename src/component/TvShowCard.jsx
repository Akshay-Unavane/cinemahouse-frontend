import React, { useState } from "react";
import { Play, Star } from "lucide-react";

const TvShowCard = ({ show, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Poster fallback
  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "/no-image.png";

  // Backdrop fallback (for hover preview)
  const backdropUrl = show.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}`
    : posterUrl;

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group transition-transform duration-300 hover:scale-105"
    >
      {/* ---------- SKELETON LOADER ---------- */}
      {!imageLoaded && (
        <div className="absolute inset-0 rounded-xl bg-gray-800 animate-pulse z-10" />
      )}

      {/* ---------- CARD CONTAINER ---------- */}
      <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-900">
        {/* ---------- POSTER IMAGE ---------- */}
        <img
          src={posterUrl}
          alt={show.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover transition-all duration-500
            ${imageLoaded ? "blur-0 scale-100" : "blur-md scale-105"}`}
        />

        {/* ---------- HOVER BACKDROP ---------- */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
          style={{
            backgroundImage: `url(${backdropUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(8px) brightness(0.4)",
          }}
        />

        {/* ---------- RATING BADGE ---------- */}
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg">
          <Star size={16} /> {show.vote_average?.toFixed(1) || "N/A"}
        </div>

        {/* ---------- PLAY BUTTON ---------- */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
          <div className="bg-red-600 p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
            <Play className="text-white w-6 h-6" />
          </div>
        </div>

        {/* ---------- TITLE OVERLAY ---------- */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white text-center py-2 px-2 text-sm sm:text-base font-semibold line-clamp-1">
          {show.name}
        </div>
      </div>

      {/* ---------- OPTIONAL: First Air Year ---------- */}
      {show.first_air_date && (
        <p className="mt-1 text-xs sm:text-sm text-gray-400 text-center">
          {new Date(show.first_air_date).getFullYear()}
        </p>
      )}
    </div>
  );
};

export default TvShowCard;
