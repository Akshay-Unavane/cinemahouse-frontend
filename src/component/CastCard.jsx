import { useNavigate } from "react-router-dom";
import { memo } from "react";

const IMG_BASE = "https://image.tmdb.org/t/p/w200";

const CastCard = ({ actor }) => {
  const navigate = useNavigate();

  if (!actor) return null;

  const handleNavigate = () => {
    if (actor.id) {
      navigate(`/person/${actor.id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleNavigate}
      aria-label={`View details of ${actor.name}`}
      className="
        w-24 md:w-28
        text-center
        cursor-pointer
        transition-transform
        hover:scale-105
        focus:outline-none
        focus:ring-2
        rounded-xl
      "
    >
      <img
        src={
          actor.profile_path
            ? `${IMG_BASE}${actor.profile_path}`
            : "/no-image.png"
        }
        alt={actor.name || "Actor"}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = "/no-image.png";
        }}
        className="
          w-full
          h-32 md:h-36
          object-cover
          rounded-xl
          mb-2
          bg-gray-800
        "
      />

      <p className="text-xs md:text-sm font-semibold truncate text-white">
        {actor.name}
      </p>

      {actor.character && (
        <p className="text-xs text-slate-400 truncate">
          {actor.character}
        </p>
      )}
    </button>
  );
};

/* Prevent unnecessary re-renders in cast slider */
export default memo(CastCard);
