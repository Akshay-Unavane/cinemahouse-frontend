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

/* =========================
   REGISTER
========================= */
export async function register(username, email, password) {
  const { data } = await api.post("/auth/register", { username, email, password });
  return data;
}

/* =========================
   LOGIN
========================= */
export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data.token) saveToken(data.token);
  return data;
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
export async function resetPassword(email, newPassword) {
  const { data } = await api.post("/auth/reset-password", { email, newPassword });
  return data;
}

/* =========================
   UPDATE USERNAME
========================= */
export async function updateUsername(newUsername) {
  const { data } = await api.put("/auth/update-username", { newUsername });
  return data;
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
