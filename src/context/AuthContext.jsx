/* @refresh reset */
import { useEffect, useState } from "react";
import { saveToken, getToken, logout as logoutService } from "../service/auth.js";
import { getWatchlist } from "../service/watchlist";
import { AuthContext } from "./contexts";

import jwtDecode from "jwt-decode";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Load user from token on refresh */
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const decoded = jwtDecode(token);

        // Token expiry check
        if (decoded.exp * 1000 < Date.now()) {
          logoutService();
          setUser(null);
        } else {
          const baseUser = {
            _id: decoded.userId || decoded.sub,
            username: decoded.username || decoded.name || "",
            email: decoded.email || "",
          };

          try {
            const wl = await getWatchlist();
            setUser({ ...baseUser, watchlist: wl });
          } catch (err) {
            console.warn('Could not fetch watchlist on init:', err?.message || err);
            setUser({ ...baseUser, watchlist: [] });
          }
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logoutService();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* LOGIN */
  const login = (token) => {
    saveToken(token);

    const decoded = jwtDecode(token);

    const baseUser = {
      _id: decoded.userId || decoded.sub,
      username: decoded.username || decoded.name || "",
      email: decoded.email || "",
    };

    // fetch watchlist asynchronously, set empty list on failure
    getWatchlist()
      .then((wl) => setUser({ ...baseUser, watchlist: wl }))
      .catch(() => setUser({ ...baseUser, watchlist: [] }));
  };

  /* LOGOUT */
  const logout = () => {
    logoutService();
    setUser(null);
  };

  /* Update user (merge fields) */
  const updateUser = (updates = {}) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : { ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/* Note: `useAuth` moved to a separate module to avoid fast-refresh export issues. */
