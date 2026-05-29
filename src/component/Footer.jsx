import { Github, Linkedin, Film, Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { BiCameraMovie } from "react-icons/bi";

const Footer = () => {
  return (
    <footer className="bg-[#0B0B0B] text-gray-400 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BiCameraMovie size={24} className="text-[#01B4E4]" />
              <h2 className="text-white text-xl font-extrabold">CinemaHouse</h2>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Your cinematic hub for trending movies, TV shows, watchlists, and reviews.
            </p>
            <p className="flex items-center gap-1 text-xs text-gray-500 mt-4">
              Made with <Heart size={12} className="text-red-400" /> for movie lovers
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Film size={16} className="text-[#01B4E4]" /> Browse
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/movies" className="hover:text-[#01B4E4] transition">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/tv-shows" className="hover:text-[#01B4E4] transition">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-[#01B4E4] transition">
                  Watchlist
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#01B4E4] transition">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield size={16} className="text-[#01B4E4]" /> Account
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-[#01B4E4] transition">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#01B4E4] transition">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#01B4E4] transition">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com/Akshay-Unavane"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="p-2.5 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white hover:border-[#01B4E4]/30 transition"
              >
                <Github size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/akshay-unavane-a93a46284"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="p-2.5 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white hover:border-[#01B4E4]/30 transition"
              >
                <Linkedin size={20} />
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Data provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
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
