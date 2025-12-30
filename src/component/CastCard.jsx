import { useNavigate } from "react-router-dom";
import { memo, useCallback } from "react";

const IMG_BASE = "https://image.tmdb.org/t/p/w200";
const FALLBACK_IMG = `${import.meta.env.BASE_URL}no-image.png`;

const CastCard = ({ actor }) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(() => {
    navigate(`/person/${actor.id}`);
  }, [navigate, actor.id]);

  if (!actor?.id) return null;

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
        focus:ring-red-600
        rounded-xl
      "
    >
      <img
        src={
          actor.profile_path
            ? `${IMG_BASE}${actor.profile_path}`
            : FALLBACK_IMG
        }
        alt={actor.name || "Actor"}
        loading="lazy"
        onError={(e) => {
          if (!e.currentTarget.src.includes("no-image.png")) {
            e.currentTarget.src = FALLBACK_IMG;
          }
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

export default memo(CastCard);
