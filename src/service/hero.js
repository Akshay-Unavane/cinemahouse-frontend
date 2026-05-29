import axios from "axios";

const _RAW_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ROOT = _RAW_ROOT.replace(/\/$/, "").replace(/\/api$/i, "");
const API_URL = `${ROOT}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function getHeroSlides() {
  const { data } = await api.get("/hero");
  return data.slides ?? [];
}

/** Map DB slide to TMDB-like shape for HeroSection */
export function mapHeroSlideToTmdb(slide) {
  const isMovie = slide.mediaType === "movie";
  return {
    id: slide.tmdbId,
    media_type: slide.mediaType,
    title: isMovie ? slide.title : undefined,
    name: !isMovie ? slide.title : undefined,
    overview: slide.overview,
    backdrop_path: slide.backdrop_path,
    poster_path: slide.poster_path,
    vote_average: slide.vote_average,
    release_date: isMovie ? slide.release_date : undefined,
    first_air_date: !isMovie ? slide.release_date : undefined,
  };
}
