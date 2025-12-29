export const trackInteraction = (item) => {
  const prefs = JSON.parse(localStorage.getItem("ai_prefs")) || {
    genres: {},
    media: {},
  };

  // Track media type
  prefs.media[item.media_type] =
    (prefs.media[item.media_type] || 0) + 1;

  // Track genres
  if (item.genre_ids) {
    item.genre_ids.forEach((id) => {
      prefs.genres[id] = (prefs.genres[id] || 0) + 1;
    });
  }

  localStorage.setItem("ai_prefs", JSON.stringify(prefs));
};

export const getUserPrefs = () => {
  return JSON.parse(localStorage.getItem("ai_prefs")) || {
    genres: {},
    media: {},
  };
};
