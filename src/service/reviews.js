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

function getApiError(err, fallback) {
  return err.response?.data?.message || err.message || fallback;
}

export async function fetchReviews(mediaType, tmdbId) {
  const { data } = await api.get(`/reviews/${mediaType}/${tmdbId}`);
  return data;
}

export async function postReview(payload) {
  try {
    const { data } = await api.post("/reviews", payload);
    return data;
  } catch (err) {
    throw new Error(getApiError(err, "Failed to post review"));
  }
}

export async function updateReview(reviewId, payload) {
  try {
    const { data } = await api.put(`/reviews/${reviewId}`, payload);
    return data;
  } catch (err) {
    throw new Error(getApiError(err, "Failed to update review"));
  }
}

export async function deleteReview(reviewId) {
  try {
    const { data } = await api.delete(`/reviews/${reviewId}`);
    return data;
  } catch (err) {
    throw new Error(getApiError(err, "Failed to delete review"));
  }
}
