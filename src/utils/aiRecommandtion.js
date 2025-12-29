import { getUserPrefs } from "./aiTracker";

export const rankByAI = (items) => {
  const prefs = getUserPrefs();

  return items
    .map((item) => {
      let score = 0;

      // Popularity
      score += (item.popularity || 0) * 0.3;

      // Rating
      score += (item.vote_average || 0) * 10 * 0.25;

      // Media type preference
      if (prefs.media[item.media_type]) {
        score += prefs.media[item.media_type] * 5;
      }

      // Genre preference
      if (item.genre_ids) {
        item.genre_ids.forEach((id) => {
          if (prefs.genres[id]) {
            score += prefs.genres[id] * 4;
          }
        });
      }

      // Recency boost
      const date =
        item.release_date || item.first_air_date || "2000-01-01";
      const daysOld =
        (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24);

      if (daysOld < 90) score += 20;

      return { ...item, aiScore: score };
    })
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 8);
};
