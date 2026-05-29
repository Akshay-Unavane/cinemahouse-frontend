import { describe, it, expect } from "vitest";
import { tmdbUrl, TMDB_BASE } from "./tmdb.js";

describe("tmdb config", () => {
  it("builds URL with path and params", () => {
    const url = tmdbUrl("/movie/popular", { page: 2 });
    expect(url.startsWith(TMDB_BASE)).toBe(true);
    expect(url).toContain("page=2");
  });

  it("normalizes path without leading slash", () => {
    const url = tmdbUrl("trending/movie/day");
    expect(url).toContain("/trending/movie/day");
  });
});
