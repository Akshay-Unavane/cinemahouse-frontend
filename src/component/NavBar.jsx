import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User, Clock, Tv, Film, BookmarkCheck, User2, LogOut } from "lucide-react";
import { BiCameraMovie, BiSolidMoviePlay } from "react-icons/bi";

const navLinks = [
  { path: "/movies", label: " Movies", icon: <BiSolidMoviePlay size={18}/> },
  { path: "/tv-shows", label: "TV Shows", icon: <Tv size={18}/> },
  { path: "/watchlist", label: "Watchlist", icon: <BookmarkCheck size={18}/> },
];

const TMDB_TOKEN = import.meta.env.VITE_API_TOKEN;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const { user, logout } = useAuth();

  /* ---------------- RECENT SEARCH DELETE ---------------- */
  const removeRecentSearch = (text) => {
    const updated = recentSearches.filter((q) => q !== text);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  /* ---------------- CLOSE MENUS ON ROUTE CHANGE ---------------- */
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setQuery("");
    setSuggestions([]);
  }, [location.pathname]);

  /* ---------------- LOAD RECENT SEARCHES ---------------- */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(stored.slice(0, 5));
  }, []);

  /* ---------------- CLICK OUTSIDE SEARCH ---------------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
        setShowLogoutModal(false);
      }
    };
    document.addEventListener("pointerdown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("pointerdown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  /* ---------------- DEBOUNCED SEARCH ---------------- */
  useEffect(() => {
    if (!query.trim() || !TMDB_TOKEN) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    const fetchSearch = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
            query
          )}&include_adult=false`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_TOKEN}`,
            },
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error("TMDB Error");

        const data = await res.json();
        setSuggestions(data.results?.slice(0, 6) || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setSuggestions([]);
        }
      }
    };

    const timeout = setTimeout(fetchSearch, 400);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  /* ---------------- SAVE SEARCH ---------------- */
  const saveSearch = (text) => {
    const updated = [text, ...recentSearches.filter((q) => q !== text)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveSearch(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
    setSuggestions([]);
    setSearchOpen(false);
  };

  const handleSuggestionClick = (text) => {
    saveSearch(text);
    navigate(`/search?q=${encodeURIComponent(text)}`);
    setQuery("");
    setSuggestions([]);
    setSearchOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0D253F]/80 backdrop-blur border-b border-white/10">
      {/* MAIN BAR */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white tracking-wide">
            CinemaHouse
          </span>
          <BiCameraMovie size={28} className="text-[#01B4E4]" />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold transition flex items-center gap-2 ${
                location.pathname === link.path
                  ? "text-[#01B4E4]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setSearchOpen((p) => !p);
              setMobileOpen(false);
            }}
            className="text-gray-300 hover:text-[#01B4E4] transition"
          >
            <Search size={20} />
          </button>

         {user ? (
  <>
    {/* Profile Link with Icon */}
    <Link
      to="/profile"
      className="hidden md:flex items-center gap-2 text-sm text-gray-300 font-medium uppercase hover:text-white transition"
    >
      <User2 size={18} /> Hi, {user.username || user.email}
    </Link>

    {/* Logout Button */}
    <button
      onClick={() => setShowLogoutModal(true)}
      className="hidden md:flex items-center gap-1 px-3 py-1 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
    >
      <LogOut size={16} /> Logout
    </button>
  </>
) : (
  <Link
    to="/login"
    className="hidden md:flex items-center gap-2 text-sm text-gray-300 hover:text-white px-3 py-1 rounded hover:bg-white/10 transition"
  >
    <User size={18} /> Login
  </Link>
)}

          <button
            onClick={() => {
              setMobileOpen((p) => !p);
              setSearchOpen(false);
            }}
            className="md:hidden text-gray-300"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-[#0D253F] border-t border-white/10 overflow-hidden"
          >
            <div className="flex flex-col px-4 py-4 gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium flex items-center gap-2  ${
                    location.pathname === link.path
                      ? "text-[#01B4E4]"
                      : "text-gray-300"
                  }`}
                >
                {link.icon}  {link.label}
                </Link>
              ))}

              <div className="border-t border-white/10 pt-3">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className=" text-sm text-gray-400 mb-2 uppercase flex items-center gap-2"
                    >
                    <User2 size={18}/>  Hi, {user.username || user.email}
                    </Link>
                    <button
                      onClick={() => {
                        setShowLogoutModal(true);
                        setMobileOpen(false);
                      }}
                      className="text-sm text-red-400 hover:text-red-500 flex items-center gap-2"
                    >
                    <LogOut size={18}/>  Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <User size={18} /> Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH BAR */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative bg-[#0D253F] border-t border-white/10"
          >
            <form
              onSubmit={handleSearch}
              className="container mx-auto px-4 py-3 relative"
            >
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, TV shows..."
                className="w-full px-4 py-3 rounded-lg bg-[#0D253F] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#01B4E4]"
              />

              {(recentSearches.length > 0 || suggestions.length > 0) && (
                <div className="absolute left-0 right-0 mt-2 bg-[#0D253F] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                  {!query &&
                    recentSearches.map((item) => (
                      <div
                        key={item}
                        className="flex justify-between items-center px-4 py-2 hover:bg-white/10"
                      >
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(item)}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <Clock size={14} /> {item}
                        </button>
                        <button
                          onClick={() => removeRecentSearch(item)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        handleSuggestionClick(item.title || item.name)
                      }
                      className="block w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/10"
                    >
                      {item.title || item.name}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

     {/* LOGOUT MODAL */}
<AnimatePresence>
  {showLogoutModal && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pt-96"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0D253F] rounded-2xl p-6 w-[90%] max-w-sm border border-white/10"
      >
        <h2 className="text-lg font-semibold text-white text-center mb-3">
          Confirm Logout
        </h2>
        <p className="text-gray-300 text-sm text-center mb-6">
          Are you sure you want to logout?
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="px-5 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              logout();
              setShowLogoutModal(false);
              navigate("/", { replace: true });
            }}
            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </nav>
  );
};

export default Navbar;
