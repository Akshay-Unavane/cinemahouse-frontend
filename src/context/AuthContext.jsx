/* @refresh reset */
import { useEffect, useState } from "react";
import {
  saveToken,
  getToken,
  logoutSession,
  fetchCurrentUser,
} from "../service/auth.js";
import { getWatchlist } from "../service/watchlist";
import { AuthContext } from "./contexts";

async function loadUserWithWatchlist() {
  const baseUser = await fetchCurrentUser();
  try {
    const wl = await getWatchlist();
    return { ...baseUser, watchlist: wl };
  } catch (err) {
    console.warn("Could not fetch watchlist:", err?.message || err);
    return { ...baseUser, watchlist: [] };
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Load user from server on refresh (role always from DB) */
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const fullUser = await loadUserWithWatchlist();
        setUser(fullUser);
      } catch (error) {
        console.error("Session restore failed:", error);
        await logoutSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* LOGIN — token saved, then refresh user + role from /auth/me */
  const login = (token) => {
    saveToken(token);

    loadUserWithWatchlist()
      .then(setUser)
      .catch((err) => {
        console.error("Login session setup failed:", err);
        logoutSession();
        setUser(null);
      });
  };

  /* LOGOUT */
  const logout = async () => {
    await logoutSession();
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
