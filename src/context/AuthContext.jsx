import { createContext, useEffect, useState } from "react";
import { saveToken, getToken, logout as logoutService } from "../service/auth.js";
import jwt_decode from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Load user from token */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Avoid direct setState calls in effects
    try {
      const decoded = jwt_decode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Token decoding failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* LOGIN */
  const login = (token) => {
    saveToken(token);
    const decoded = jwt_decode(token);
    setUser({
      _id: decoded.userId || decoded.sub,
      username: decoded.username || decoded.name,
      email: decoded.email,
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
