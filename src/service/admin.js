import axios from "axios";
import { getToken } from "./auth.js";

const _RAW_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ROOT = _RAW_ROOT.replace(/\/$/, "").replace(/\/api$/i, "");
const API_URL = `${ROOT}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function verifyAdminAccess(password) {
  const { data } = await api.post("/admin/verify-access", { password });
  return data;
}

export async function getAdminStats() {
  const { data } = await api.get("/admin/stats");
  return data;
}

export async function getAdminUsers() {
  const { data } = await api.get("/admin/users");
  return data.users ?? [];
}

export async function toggleBlockUser(userId) {
  const { data } = await api.patch(`/admin/users/${userId}/block`);
  return data;
}

export async function deleteAdminUser(userId) {
  const { data } = await api.delete(`/admin/users/${userId}`);
  return data;
}

export async function getAdminMovies() {
  const { data } = await api.get("/admin/movies");
  return data.movies ?? [];
}

export async function deleteAdminMovie(movieId) {
  const { data } = await api.delete(`/admin/movies/${movieId}`);
  return data;
}

export async function getAdminReviews() {
  const { data } = await api.get("/admin/reviews");
  return data.reviews ?? [];
}

export async function deleteAdminReview(reviewId) {
  const { data } = await api.delete(`/admin/reviews/${reviewId}`);
  return data;
}

export async function getAdminHeroSlides() {
  const { data } = await api.get("/admin/hero");
  return data.slides ?? [];
}

export async function addAdminHeroSlide(payload) {
  const { data } = await api.post("/admin/hero", payload);
  return data;
}

export async function removeAdminHeroSlide(id) {
  const { data } = await api.delete(`/admin/hero/${id}`);
  return data;
}

export async function reorderAdminHeroSlides(orderedIds) {
  const { data } = await api.patch("/admin/hero/reorder", { orderedIds });
  return data.slides ?? [];
}
