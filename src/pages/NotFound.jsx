import { Link } from "react-router-dom";
import { Home, Search, Film } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] cinema-gradient flex items-center justify-center px-4 pt-24 pb-16">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-[#01B4E4]/30">404</p>
        <h1 className="text-2xl font-bold mt-2">Page not found</h1>
        <p className="text-gray-400 text-sm mt-3 mb-8">
          This scene doesn&apos;t exist. The page may have moved or the link is broken.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <Home size={16} /> Home
          </Link>
          <Link
            to="/movies"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-white/15 hover:bg-white/5"
          >
            <Film size={16} /> Browse movies
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-white/15 hover:bg-white/5"
          >
            <Search size={16} /> Search
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
