import axios from "axios";

/* =========================
   TOKEN HELPERS
========================= */
export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
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
