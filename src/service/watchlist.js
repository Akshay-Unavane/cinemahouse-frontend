import { getToken } from "./auth";

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

/* ===========================
   SAFE RESPONSE PARSER
=========================== */
async function safeParseJSON(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Server returned non-JSON response");
  }
}

/* ===========================
   GET WATCHLIST
=========================== */
export async function getWatchlist() {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  const res = await fetch(`${API_URL}/watchlist`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await safeParseJSON(res);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch watchlist");
  }

  return Array.isArray(data) ? data : [];
}

/* ===========================
   ADD TO WATCHLIST
=========================== */
export async function addToWatchlist(payload) {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  const res = await fetch(`${API_URL}/watchlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await safeParseJSON(res);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to add to watchlist");
  }

  return data;
}

/* ===========================
   REMOVE FROM WATCHLIST
=========================== */
export async function removeFromWatchlist(movieId, mediaType) {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!movieId || !mediaType) {
    throw new Error("movieId and mediaType are required");
  }

  const res = await fetch(`${API_URL}/watchlist/${movieId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ mediaType }),
  });

  const data = await safeParseJSON(res);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to remove from watchlist");
  }

  return data;
}
