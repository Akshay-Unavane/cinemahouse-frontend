export const TMDB_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://api.themoviedb.org/3";

export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";

export const TMDB_TOKEN = import.meta.env.VITE_API_TOKEN || "";

export const TMDB_IMG = "https://image.tmdb.org/t/p";

export function tmdbUrl(path, params = {}) {
  const url = new URL(`${TMDB_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  if (TMDB_API_KEY) url.searchParams.set("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") url.searchParams.set(k, String(v));
  });
  return url.toString();
}

export function isTmdbConfigured() {
  return Boolean(TMDB_API_KEY || TMDB_TOKEN);
}
