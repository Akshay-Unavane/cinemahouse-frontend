import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { ExternalLink, ArrowLeft } from "lucide-react"; // cleaned imports
import { motion } from "framer-motion";
import { fetchAwardsFromWikidata } from "../utils/fetchAwards";
import { fetchFamilyFromWikidata } from "../utils/fetchFamily";

const API_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const PersonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [social, setSocial] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  const [awards, setAwards] = useState([]);
  const [family, setFamily] = useState({});

  const flatFamily = useMemo(() => {
    if (!family || typeof family !== 'object') return [];
    return Object.entries(family).flatMap(([relation, members]) =>
      (members || []).map(m => ({ ...m, relation }))
    );
  }, [family]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, c, s] = await Promise.all([
          fetch(`${API_URL}/person/${id}?api_key=${API_KEY}&language=en-US`),
          fetch(`${API_URL}/person/${id}/movie_credits?api_key=${API_KEY}`),
          fetch(`${API_URL}/person/${id}/external_ids?api_key=${API_KEY}`)
        ]);

        const personData = await p.json();
        const creditsData = await c.json();
        const socialData = await s.json();

        setPerson(personData);
        setCredits(creditsData.cast || []);
        setSocial(socialData);

        if (personData.imdb_id) {
          const awardList = await fetchAwardsFromWikidata(
            personData.imdb_id
          );
          setAwards(awardList)
        }
        if (personData.imdb_id) {
  const familyData = await fetchFamilyFromWikidata(
    personData.imdb_id
  );
  setFamily(familyData);
}
      } catch (error) {
        console.error("Person details error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  if (loading) {
    return <div className="text-white text-center py-32">Loading...</div>;
  }

  if (!person) {
    return <div className="text-white text-center py-32">No data found</div>;
  }

  const ratedMovies = credits.filter(m => m.vote_average > 0);
  const avgRating =
    ratedMovies.reduce((sum, m) => sum + m.vote_average, 0) /
    (ratedMovies.length || 1);

  const shortBio =
    person.biography && person.biography.length > 350
      ? person.biography.slice(0, 350) + "..."
      : person.biography;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-12">

       {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 md:top-28 left-4 z-40 flex items-center gap-2 px-4 py-2 bg-black/70 rounded-lg hover:bg-black/90"
      >
        <ArrowLeft size={18} /> Back
      </button>
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* IMAGE */}
          <motion.img
            src={
              person.profile_path
                ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                : "/no-image.png"
            }
            alt={person.name}
            className="w-full max-w-xs mx-auto lg:mx-0 lg:w-80 rounded-2xl shadow-2xl lg:sticky lg:top-24"
            whileHover={{ scale: 1.03 }}
          />

          {/* DETAILS */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              {person.name}
            </h1>

            <div className="flex flex-wrap gap-3 text-sm text-gray-300">
              <span>🎭 {person.known_for_department}</span>
              {person.birthday && <span>🎂 {person.birthday}</span>}
              {person.place_of_birth && <span>📍 {person.place_of_birth}</span>}
            </div>

            {/* BIOGRAPHY */}
            {person.biography && (
              <div className="bg-white/5 p-4 rounded-xl">
                <h2 className="text-lg font-semibold mb-2">Biography</h2>
                <p className="text-gray-400 leading-relaxed">
                  {showFullBio ? person.biography : shortBio}
                </p>

                {person.biography.length > 350 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-2 text-[#01B4E4] font-semibold"
                  >
                    {showFullBio ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            )}

            {/* SOCIAL LINKS */}
            <div className="flex flex-wrap gap-3">
              {social.instagram_id && (
                <a
                  href={`https://instagram.com/${social.instagram_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-pink-600 rounded"
                >
                  Instagram
                </a>
              )}
              {social.twitter_id && (
                <a
                  href={`https://twitter.com/${social.twitter_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 rounded"
                >
                  Twitter
                </a>
              )}
              {person.imdb_id && (
                <a
                  href={`https://www.imdb.com/name/${person.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-yellow-500 text-black rounded font-semibold flex items-center gap-1"
                >
                  IMDb <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat title="Movies" value={credits.length} />
          <Stat title="Avg Rating" value={avgRating.toFixed(1)} />
          <Stat title="Popularity" value={person.popularity.toFixed(0)} />
          <Stat title="Known For" value={person.known_for_department} />
        </div>

        {/* INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Family">
          {flatFamily && flatFamily.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {flatFamily.map((m, i) => (
                <button
                  key={i}
                  onClick={() =>
                    m.tmdbId
                      ? navigate(`/person/${m.tmdbId}`)
                      : window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(m.name)}`,
                          "_blank"
                        )
                  }
                  className="flex-initial basis-1/3 sm:basis-[140px] md:basis-[160px] flex flex-col items-center bg-white/5 p-3 rounded-xl hover:bg-white/10 transition"
                  aria-label={`Open ${m.name}`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-semibold text-sm">
                    {m.name ? m.name.split(" ").map(n => n[0]).slice(0, 2).join("") : "--"}
                  </div>

                  <div className="mt-2 text-sm text-center text-white truncate max-w-[120px]">
                    {m.name}
                  </div>

                  <div className="text-xs text-gray-400 mt-1 capitalize">
                    {m.relation === "children" ? "Child" : m.relation}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-gray-400">No family data</div>
          )}
        </InfoCard>



<InfoCard title="Awards">
  {awards && awards.length > 0 ? (
    <div className="max-h-80 overflow-y-auto scrollbar-hide pr-2">
      <div className="space-y-3">
        {awards.map((award, index) => (
          <div key={index} className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏆</div>
              <div className="flex-1">
                <div className="font-semibold text-white">{award.name || 'Unknown Award'}</div>
                <div className="text-sm text-gray-400">{award.category || 'General'}</div>
              </div>
              {award.year && (
                <div className="ml-2 text-xs bg-white/10 text-gray-200 px-2 py-1 rounded">{award.year}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="text-gray-400">No publicly recorded awards</div>
  )}
</InfoCard>

        </div>

       {/* MOVIES */}
{credits.length > 0 && (
  <div>
    <h2 className="text-2xl font-bold mb-4">Known For</h2>

    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
      {credits
        .filter(movie => movie.poster_path) // optional: removes empty posters
        .sort((a, b) => b.popularity - a.popularity) // most popular first
        .map(movie => (
          <div
            key={movie.id}
            className="snap-start w-28 sm:w-32 cursor-pointer flex-shrink-0"
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title}
              className="rounded-xl hover:scale-105 transition duration-300"
            />
            <p className="text-sm text-center mt-2 truncate">
              {movie.title}
            </p>
          </div>
        ))}
    </div>
  </div>
)}

      </div>
    </div>
  );
};

const Stat = ({ title, value }) => (
  <div className="bg-white/10 rounded-xl p-4 text-center">
    <p className="text-gray-400 text-sm">{title}</p>
    <p className="text-xl sm:text-2xl font-bold">{value}</p>
  </div>
);

const InfoCard = ({ title, children }) => (
  <div className="bg-white/10 rounded-xl p-6">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <div className="text-gray-400">{children}</div>
  </div>
);

export default PersonDetails;
