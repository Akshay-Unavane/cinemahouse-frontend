import axios from "axios";

/* =========================
   TOKEN HELPERS (improved)
   - store token in sessionStorage (not localStorage)
   - keep a separate expiry timestamp and auto-clear expired tokens
========================= */
const TOKEN_KEY = "ml_token";
const TOKEN_EXP_KEY = "ml_token_exp";

function parseJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function saveToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    const decoded = parseJwtPayload(token);
    if (decoded && decoded.exp) {
      sessionStorage.setItem(TOKEN_EXP_KEY, String(decoded.exp * 1000));
    } else {
      sessionStorage.removeItem(TOKEN_EXP_KEY);
    }
  } catch (e) {
    // fallback: ensure no exceptions bubble up
    console.warn("saveToken failed:", e);
  }
}

export function getToken() {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const exp = sessionStorage.getItem(TOKEN_EXP_KEY);
    if (!token) return null;
    if (exp && Date.now() > Number(exp)) {
      // token expired; clear and return null
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_EXP_KEY);
      return null;
    }
    return token;
  } catch (e) {
    return null;
  }
}

export function logout() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXP_KEY);
    sessionStorage.removeItem("ml_admin_unlock_exp");
  } catch (e) {
    /* ignore */
  }
}

/* =========================
   API CONFIG
========================= */
const _RAW_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ROOT = _RAW_ROOT.replace(/\/$/, "").replace(/\/api$/i, "");
const API_URL = `${ROOT}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function getApiError(err, fallback = "Request failed") {
  const msg = err.response?.data?.message;
  const hint = err.response?.data?.hint;
  if (msg && hint) return `${msg} ${hint}`;
  return msg || err.message || fallback;
}

/* =========================
   REGISTER
========================= */
export async function register(username, email, password) {
  try {
    const { data } = await api.post("/auth/register", {
      username,
      email: email.trim().toLowerCase(),
      password,
    });
    return data;
  } catch (err) {
    throw new Error(getApiError(err, "Registration failed"));
  }
}

/* =========================
   LOGIN
========================= */
export async function login(email, password) {
  try {
    const { data } = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });
    if (data.token) saveToken(data.token);
    return data;
  } catch (err) {
    throw new Error(getApiError(err, "Login failed"));
  }
}

/* =========================
   CURRENT USER (fresh role from DB)
========================= */
export async function fetchCurrentUser() {
  const { data } = await api.get("/auth/me");
  const u = data.user;
  return {
    _id: u._id,
    username: u.username,
    email: u.email,
    role: u.role || "user",
    avatar: u.avatar || "",
    isBlocked: u.isBlocked,
  };
}

/* =========================
   LOGOUT (server + client)
========================= */
export function clearSessionTracking(userId) {
  if (userId) {
    sessionStorage.removeItem(`ml_active_session_${userId}`);
    sessionStorage.removeItem(`ml_sessions_${userId}`);
  }
  sessionStorage.removeItem("ml_admin_unlock_exp");
}

export async function logoutSession() {
  try {
    const token = getToken();
    if (token) {
      const payload = parseJwtPayload(token);
      const userId = payload?.userId || payload?.id;
      if (userId) clearSessionTracking(userId);
      await api.post("/auth/logout");
    }
  } catch (err) {
    console.warn("Server logout failed:", err?.message || err);
  } finally {
    logout();
  }
}
/* =========================
   DELETE ACCOUNT
========================= */
export async function deleteAccount() {
  const { data } = await api.delete("/auth/delete-account");
  logout();
  return data;
}

/* =========================
   RESET PASSWORD
========================= */
export async function forgotPassword(email) {
  try {
    const { data } = await api.post("/auth/forgot-password", {
      email: email.trim().toLowerCase(),
    });
    return data;
  } catch (err) {
    throw new Error(getApiError(err, "Could not send reset code"));
  }
}

export async function verifyResetPassword(email, otp, newPassword) {
  try {
    const { data } = await api.post("/auth/verify-reset-password", {
      email: email.trim().toLowerCase(),
      otp: String(otp).trim(),
      newPassword,
    });
    return data;
  } catch (err) {
    throw new Error(getApiError(err, "Password reset failed"));
  }
}

/* @deprecated use forgotPassword + verifyResetPassword */
export async function resetPassword(email, newPassword) {
  try {
    const { data } = await api.post("/auth/reset-password", { email, newPassword });
    return data;
  } catch (err) {
    throw new Error(getApiError(err, "Password reset failed"));
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const { data } = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  } catch (err) {
    throw new Error(getApiError(err, "Password change failed"));
  }
}

/* =========================
   UPDATE USERNAME
========================= */
export async function updateUsername(newUsername) {
  try {
    const { data } = await api.put("/auth/update-username", { newUsername: newUsername.trim() });
    return data;
  } catch (err) {
    throw new Error(getApiError(err, "Username update failed"));
  }
}

/* =========================
   UPDATE AVATAR
   Accepts a File object, converts to data URL, then sends to server
========================= */
export async function updateAvatarFile(file) {
  if (!file) throw new Error("No file provided");

  const readAsDataURL = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(f);
    });

  const dataUrl = await readAsDataURL(file);
  try {
    const { data } = await api.put("/auth/update-avatar", { avatar: dataUrl });
    return data;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const respData = err.response.data;
      const message = respData && respData.message ? respData.message : err.response.statusText || "Server error";
      throw new Error(`${status} ${message}`);
    }
    throw new Error(err.message || "Network error");
  }
}
