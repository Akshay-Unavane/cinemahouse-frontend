import { useSearchParams } from "react-router-dom";
import MovieCard from "../component/MovieCard";

const ViewAll = ({ dataMap }) => {
  const [params] = useSearchParams();
  const type = params.get("type");
  const title = params.get("title");

  const movies = dataMap[type] || [];

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default ViewAll;
