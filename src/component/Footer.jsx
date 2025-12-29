import { Github, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#0B0B0B] text-gray-400 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* BRAND */}
          <div>
            <h2 className="text-white text-2xl font-extrabold mb-3">
              CinemaHouse
            </h2>
            <p className="text-sm leading-relaxed max-w-xs">
              Discover trending, popular, and top-rated Movies & TV Shows.
              
            </p>
          </div>

          {/* BROWSE */}
          <div>
            <h3 className="text-white font-semibold mb-4">Browse</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/movies" className="hover:text-white">Movies</Link></li>
              <li><Link to="/tv-shows" className="hover:text-white">TV Shows</Link></li>
              <li><Link to="/watchlist" className="hover:text-white">Watchlist</Link></li>
              {/* <li><Link to="/search" className="hover:text-white">Search</Link></li> */}
            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com/Akshay-Unavane"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-full hover:bg-white/10 hover:text-white"
              >
                <Github size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/akshay-unavane-a93a46284"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-full hover:bg-white/10 hover:text-white"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 my-10" />

        <p className="text-sm text-center text-gray-500">
          © {new Date().getFullYear()} CinemaHouse. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
