import MovieCard from "../MovieCard";

export default function RecommendationRow({ items, mediaType = "movie" }) {
  if (!items?.length) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {items.slice(0, 12).map((item) => (
        <div key={item.id} className="w-36 shrink-0">
          <MovieCard
            movie={{
              ...item,
              media_type: mediaType,
            }}
          />
        </div>
      ))}
    </div>
  );
}
