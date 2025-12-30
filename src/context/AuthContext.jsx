import { createContext, useContext, useEffect, useState } from "react";
import { saveToken, getToken, logout as logoutService } from "../service/auth.js";

import jwtDecode from "jwt-decode";

const AuthContext = createContext(null);

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

    try {
      const decoded = jwtDecode(token);

      // Token expiry check
      if (decoded.exp * 1000 < Date.now()) {
        logoutService();
        setUser(null);
      } else {
        setUser({
          _id: decoded.userId || decoded.sub,
          username: decoded.username || decoded.name || "",
          email: decoded.email || "",
        });
      }
    } catch (error) {
      console.error("Invalid token:", error);
      logoutService();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* LOGIN */
  const login = (token) => {
    saveToken(token);

    const decoded = jwtDecode(token);

    setUser({
      _id: decoded.userId || decoded.sub,
      username: decoded.username || decoded.name || "",
      email: decoded.email || "",
    });
  };

  /* LOGOUT */
  const logout = () => {
    logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/* Custom hook */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
