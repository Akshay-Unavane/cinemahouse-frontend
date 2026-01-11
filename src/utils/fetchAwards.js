// utils/fetchAwards.js
export const fetchAwardsFromWikidata = async (imdbId) => {
  const cacheKey = `awards_${imdbId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const url = `https://query.wikidata.org/sparql?format=json&query=
  SELECT ?awardLabel ?year ?categoryLabel WHERE {
    ?person wdt:P345 "${imdbId}".
    ?person p:P166 ?awardStatement.
    ?awardStatement ps:P166 ?award.
    OPTIONAL { ?awardStatement pq:P585 ?year. }
    OPTIONAL { ?awardStatement pq:P2517 ?category. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  const res = await fetch(url);
  const data = await res.json();

  const awards = data.results.bindings.map(a => ({
    name: a.awardLabel?.value,
    year: a.year?.value?.slice(0, 4),
    category: a.categoryLabel?.value || "General"
  }));

  localStorage.setItem(cacheKey, JSON.stringify(awards));
  return awards;
};
