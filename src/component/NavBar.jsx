import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  X,
  User,
  Clock,
  Tv,
  BookmarkCheck,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { BiCameraMovie, BiSolidMoviePlay } from "react-icons/bi";
import { TMDB_BASE, TMDB_TOKEN } from "../config/tmdb";

function getUserAvatarSrc(user) {
  if (!user) return "";
  if (user.avatar) return user.avatar;
  const isAdmin = (user.role || "").toLowerCase() === "admin";
  const name = encodeURIComponent(user.username || user.email || "User");
  const bg = isAdmin ? "f59e0b" : "01B4E4";
  return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=000`;
}

function NavUserAvatar({ user, size = "md" }) {
  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  const sizeClass = size === "sm" ? "w-9 h-9" : "w-10 h-10";
  const fallback = getUserAvatarSrc(user);

  return (
    <img
      src={user?.avatar || fallback}
      alt={user?.username || "Profile"}
      onError={(e) => {
        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
      className={`${sizeClass} rounded-full object-cover shrink-0 border-2 ${
        isAdmin ? "border-amber-400/70" : "border-[#01B4E4]/70"
      }`}
    />
  );
}

const navLinks = [
  { path: "/movies", label: "Movies", icon: BiSolidMoviePlay },
  { path: "/tv-shows", label: "TV Shows", icon: Tv },
  { path: "/watchlist", label: "Watchlist", icon: BookmarkCheck, auth: true },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const { user, logout } = useAuth();
  const isAdmin = (user?.role || "").toLowerCase() === "admin";

  const visibleLinks = navLinks.filter((l) => !l.auth || user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setQuery("");
    setSuggestions([]);
  }, [location.pathname]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(stored.slice(0, 5));
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
        setShowLogoutModal(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim() || !TMDB_TOKEN) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const fetchSearch = async () => {
      try {
        const res = await fetch(
          `${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&include_adult=false`,
          {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("TMDB Error");
        const data = await res.json();
        setSuggestions(data.results?.slice(0, 6) || []);
      } catch (err) {
        if (err.name !== "AbortError") setSuggestions([]);
      }
    };
    const timeout = setTimeout(fetchSearch, 400);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const saveSearch = (text) => {
    const updated = [text, ...recentSearches.filter((q) => q !== text)].slice(0, 5);
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

  const removeRecentSearch = (text) => {
    const updated = recentSearches.filter((q) => q !== text);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const navLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      location.pathname === path
        ? "bg-[#01B4E4]/15 text-[#01B4E4] border border-[#01B4E4]/30"
        : "text-gray-200 hover:bg-white/5"
    }`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 safe-top ${
          scrolled
            ? "bg-[#0D253F]/98 backdrop-blur-md border-white/15 shadow-lg shadow-black/30"
            : "bg-[#0D253F]/90 backdrop-blur border-white/10"
        }`}
      >
        {/* Main bar */}
        <div className="h-14 sm:h-16 max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-2">
          {/* Logo — compact on mobile */}
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink"
            onClick={() => setMobileOpen(false)}
          >
            <BiCameraMovie
              size={26}
              className="text-[#01B4E4] shrink-0 sm:w-7 sm:h-7"
            />
            <span className="hidden sm:inline text-lg sm:text-2xl font-bold text-white truncate">
              CinemaHouse
            </span>
            <span className="sm:hidden text-base font-bold text-white tracking-wide">
              CH
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {visibleLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`text-sm font-semibold flex items-center gap-2 relative pb-1 transition ${
                  location.pathname === path
                    ? "text-[#01B4E4]"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Icon size={18} /> {label}
                {location.pathname === path && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#01B4E4] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              aria-label="Search"
              onClick={() => {
                setSearchOpen((p) => !p);
                setMobileOpen(false);
              }}
              className="p-2.5 rounded-lg text-gray-300 hover:text-[#01B4E4] hover:bg-white/5 transition"
            >
              <Search size={20} />
            </button>

            {user ? (
              <>
                <Link
                  to={isAdmin ? "/admin/account" : "/profile"}
                  className="hidden md:flex items-center gap-2 text-sm text-gray-300 font-medium hover:text-white transition px-2 py-1.5 rounded-lg hover:bg-white/5 max-w-[180px]"
                >
                  <NavUserAvatar user={user} size="sm" />
                  <span className="truncate">{user.username || user.email}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition"
              >
                <User size={18} /> Login
              </Link>
            )}

            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => {
                setMobileOpen((p) => !p);
                setSearchOpen(false);
              }}
              className="md:hidden p-2.5 rounded-lg text-gray-200 hover:bg-white/10 transition"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search panel */}
        <AnimatePresence>
          {searchOpen && (
            <Motion.div
              ref={searchRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 bg-[#0D253F] overflow-hidden"
            >
              <form onSubmit={handleSearch} className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search movies, TV shows..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white placeholder-gray-500 focus:border-[#01B4E4] focus:ring-1 focus:ring-[#01B4E4] outline-none"
                  />
                </div>

                {(recentSearches.length > 0 || suggestions.length > 0) && (
                  <div className="mt-2 rounded-xl border border-white/10 bg-[#0a1628] overflow-hidden max-h-64 overflow-y-auto scrollbar-thin">
                    {!query &&
                      recentSearches.map((item) => (
                        <div
                          key={item}
                          className="flex justify-between items-center px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0"
                        >
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(item)}
                            className="flex items-center gap-2 text-sm text-gray-300 text-left flex-1 min-w-0"
                          >
                            <Clock size={14} className="shrink-0" />
                            <span className="truncate">{item}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRecentSearch(item)}
                            className="p-1 text-gray-500 hover:text-red-400 shrink-0"
                            aria-label="Remove"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}

                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSuggestionClick(item.title || item.name)}
                        className="block w-full px-4 py-3 text-sm text-left text-gray-300 hover:bg-white/5 border-b border-white/5 last:border-0 truncate"
                      >
                        {item.title || item.name}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </Motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <Motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[45] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <Motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 z-[48] w-[min(100vw-3rem,320px)] bg-[#0D253F] border-l border-white/10 shadow-2xl md:hidden flex flex-col safe-top"
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
                <span className="font-bold text-white">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-300"
                  aria-label="Close"
                >
                  <X size={22} />
                </button>
              </div>

              {user && (
                <div className="px-4 py-4 border-b border-white/10">
                  <Link
                    to={isAdmin ? "/admin/account" : "/profile"}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <NavUserAvatar user={user} />
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {user.username || "User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Admin
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
                {visibleLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={navLinkClass(path)}
                  >
                    <Icon size={20} /> {label}
                  </Link>
                ))}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30"
                  >
                    <LayoutDashboard size={20} /> Admin Dashboard
                  </Link>
                )}
              </div>

              <div className="p-4 border-t border-white/10 safe-bottom">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-primary"
                  >
                    <User size={18} /> Login
                  </Link>
                )}
              </div>
            </Motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so content isn't hidden under fixed header */}
      <div className="h-14 sm:h-16 shrink-0" aria-hidden />

      {/* Logout modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <Motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
          >
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D253F] rounded-2xl p-6 w-full max-w-sm border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white text-center mb-3">
                Confirm Logout
              </h2>
              <p className="text-gray-300 text-sm text-center mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setShowLogoutModal(false);
                    navigate("/", { replace: true });
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
