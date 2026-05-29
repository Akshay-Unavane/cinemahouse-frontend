import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, MessageSquare, Pencil, Trash2, Send } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import {
  fetchReviews,
  postReview,
  updateReview,
  deleteReview,
} from "../service/reviews";

function StarRating({ value, onChange, readonly = false }) {
  const filled = Math.round((value || 0) / 2);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(n * 2)}
          className={`p-0.5 transition ${readonly ? "cursor-default" : "hover:scale-110"}`}
          title={`${n * 2}/10`}
        >
          <Star
            size={readonly ? 14 : 22}
            className={
              n <= filled ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
            }
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function UserAvatar({ user }) {
  if (user?.avatar?.startsWith("data:image")) {
    return (
      <img
        src={user.avatar}
        alt=""
        className="w-10 h-10 rounded-full object-cover border border-white/10"
      />
    );
  }
  const initial = (user?.username || "?")[0].toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center font-bold text-sm border border-white/10">
      {initial}
    </div>
  );
}

const ReviewSection = ({
  tmdbId,
  mediaType,
  title,
  poster_path = null,
  overview = "",
  release_date = null,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ count: 0, averageRating: null });
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(8);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchReviews(mediaType, tmdbId);
      setReviews(data.reviews || []);
      setStats(data.stats || { count: 0, averageRating: null });
      setMyReview(data.myReview || null);
      if (data.myReview && !editing) {
        setComment(data.myReview.comment);
        setRating(data.myReview.rating ?? 8);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mediaType, tmdbId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const moviePayload = () => ({
    tmdbId: Number(tmdbId),
    mediaType,
    title,
    poster_path,
    overview,
    release_date,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login to write a review", "warning");
      return;
    }

    setSubmitting(true);
    try {
      if (editing && myReview) {
        const res = await updateReview(myReview._id, { comment, rating });
        showToast("Review updated", "success");
        setEditing(false);
        setMyReview({
          _id: res.review._id,
          comment: res.review.comment,
          rating: res.review.rating,
          createdAt: res.review.createdAt,
        });
      } else {
        await postReview({ ...moviePayload(), comment, rating });
        showToast("Review published!", "success");
        setComment("");
        setRating(8);
      }
      await loadReviews();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await deleteReview(reviewId);
      showToast("Review deleted", "success");
      setMyReview(null);
      setComment("");
      setRating(8);
      setEditing(false);
      await loadReviews();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const startEdit = () => {
    if (!myReview) return;
    setComment(myReview.comment);
    setRating(myReview.rating ?? 8);
    setEditing(true);
  };

  return (
    <section className="mt-16 border-t border-white/10 pt-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="text-cyan-400" size={24} />
            Audience Reviews
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Reviews from CinemaHouse members
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {stats.averageRating != null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Star className="fill-yellow-400 text-yellow-400" size={18} />
              <span className="font-bold text-yellow-300">{stats.averageRating}</span>
              <span className="text-gray-400">/ 10</span>
            </div>
          )}
          <span className="text-gray-400">
            {stats.count} review{stats.count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Write review */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-6 mb-8">
        {!user ? (
          <p className="text-gray-400 text-sm">
            <Link to="/login" className="text-cyan-400 hover:underline">
              Log in
            </Link>{" "}
            to rate and review this {mediaType === "tv" ? "show" : "movie"}.
          </p>
        ) : myReview && !editing ? (
          <div className="space-y-3">
            <p className="text-sm text-emerald-400">You already reviewed this title.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Pencil size={14} /> Edit review
              </button>
              <button
                type="button"
                onClick={() => handleDelete(myReview._id)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/40"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-2">Your rating</label>
              <StarRating value={rating} onChange={setRating} />
              <p className="text-xs text-gray-500 mt-1">{rating}/10</p>
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-2">Your review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                minLength={10}
                maxLength={2000}
                placeholder="Share your thoughts (min 10 characters)..."
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/15 text-white outline-none focus:border-cyan-400 resize-y"
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {comment.length}/2000
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || comment.trim().length < 10}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#01B4E4] text-black font-semibold hover:bg-[#02c7ff] disabled:opacity-50"
              >
                <Send size={16} />
                {submitting
                  ? "Saving..."
                  : editing
                    ? "Update review"
                    : "Post review"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setComment(myReview?.comment || "");
                    setRating(myReview?.rating ?? 8);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-white/15 text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Review list */}
      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8 border border-dashed border-white/15 rounded-xl">
          No reviews yet. Be the first to share your opinion!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <article
              key={r._id}
              className={`p-4 md:p-5 rounded-xl border ${
                r.isOwn
                  ? "border-cyan-500/30 bg-cyan-500/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="flex gap-3">
                <UserAvatar user={r.user} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {r.user?.username || "User"}
                        {r.isOwn && (
                          <span className="ml-2 text-[10px] uppercase text-cyan-400">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(r.createdAt)}</p>
                    </div>
                    {r.rating != null && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                        <Star size={14} className="fill-yellow-400" />
                        {r.rating}/10
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 mt-3 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {r.comment}
                  </p>
                  {r.isOwn && (
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={startEdit}
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r._id)}
                        className="text-xs text-red-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewSection;
