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
const ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
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
