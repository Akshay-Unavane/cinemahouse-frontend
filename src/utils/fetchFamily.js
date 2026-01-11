// utils/fetchFamily.js
export const fetchFamilyFromWikidata = async (imdbId) => {
  const cacheKey = `family_${imdbId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const url = `https://query.wikidata.org/sparql?format=json&query=
  SELECT ?prop ?name ?tmdbId WHERE {
    ?person wdt:P345 "${imdbId}".
    ?person ?prop ?relative.
    VALUES ?prop { wdt:P22 wdt:P25 wdt:P26 wdt:P40 }
    OPTIONAL { ?relative wdt:P4947 ?tmdbId }
    ?relative rdfs:label ?name.
    FILTER(lang(?name) = "en")
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  const res = await fetch(url);
  const data = await res.json();

  const family = { father: [], mother: [], spouse: [], children: [] };

  if (data && data.results && Array.isArray(data.results.bindings)) {
    data.results.bindings.forEach(r => {
      const name = r.name?.value || null;
      const tmdbId = r.tmdbId?.value || null;
      const prop = r.prop?.value || "";

      if (!name) return;

      let relation = null;
      if (prop.includes("P22")) relation = "father";
      else if (prop.includes("P25")) relation = "mother";
      else if (prop.includes("P26")) relation = "spouse";
      else if (prop.includes("P40")) relation = "children";

      if (relation) {
        family[relation].push({ name, tmdbId });
      }
    });
  }

  localStorage.setItem(cacheKey, JSON.stringify(family));
  return family;
};
