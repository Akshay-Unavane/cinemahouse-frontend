import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LogOut,
  Trash2,
  Upload,
  Clock,
  Shield,
  Settings,
  User,
  Menu,
  X,
  LayoutDashboard,
  BookmarkCheck,
  Mail,
  Bell,
} from "lucide-react";
import { getWatchlist } from "../service/watchlist";
import {
  updateUsername,
  deleteAccount,
  updateAvatarFile,
  changePassword,
} from "../service/auth";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Loader from "../component/Loader";

ChartJS.register(ArcElement, Tooltip, Legend);

const PREFS_KEY = "ml_profile_prefs";

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {
      emailUpdates: true,
      showSpoilers: false,
    };
  } catch {
    return { emailUpdates: true, showSpoilers: false };
  }
}

async function compressImageFile(file, maxWidth = 800, quality = 0.8) {
  const image = await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });

  const ratio = image.width / image.height;
  const width = image.width > maxWidth ? maxWidth : image.width;
  const height = Math.round(width / ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(image, 0, 0, width, height);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("Image compression failed");
  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

const allTabs = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Shield },
  { key: "activity", label: "Activity", icon: Clock },
  { key: "settings", label: "Settings", icon: Settings },
];

const adminTabs = [{ key: "activity", label: "Activity", icon: Clock }];

const Profile = () => {
  const { user, logout, updateUser, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [pageLoading, setPageLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [watchlistStats, setWatchlistStats] = useState([]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [prefs, setPrefs] = useState(loadPrefs);
  const [sessionHistory, setSessionHistory] = useState([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  const isPrime = (user?.role || "").toLowerCase() === "prime";
  const accountLabel = isAdmin ? "Administrator" : isPrime ? "Prime" : "Free";
  const visibleTabs = isAdmin ? adminTabs : allTabs;

  const movieCount = watchlistStats.filter((i) => i.mediaType === "movie").length;
  const tvCount = watchlistStats.filter((i) => i.mediaType === "tv").length;

  const passwordStrength = () => {
    if (!newPassword) return 0;
    if (newPassword.length < 6) return 25;
    if (newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /\d/.test(newPassword)) return 100;
    return 60;
  };

  const syncUserFields = useCallback(() => {
    if (!user) return;
    setUsername(user.username || "");
    setAvatar(user.avatar || null);
  }, [user]);

  const loadWatchlist = useCallback(async () => {
    try {
      const data = await getWatchlist();
      setWatchlistStats(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || "Failed to load watchlist", "error");
    }
  }, [showToast]);

  const loadSessionHistory = useCallback(async () => {
    if (!user?._id) return;
    const sessionKey = `ml_sessions_${user._id}`;
    const activeKey = `ml_active_session_${user._id}`;

    try {
      const existing = JSON.parse(sessionStorage.getItem(sessionKey) || "[]");

      if (!sessionStorage.getItem(activeKey)) {
        let ip = "—";
        try {
          const r = await fetch("https://api.ipify.org?format=json");
          if (r.ok) {
            const d = await r.json();
            ip = d.ip || "—";
          }
        } catch {
          /* optional */
        }

        const entry = {
          id: Date.now(),
          date: new Date().toLocaleString(),
          ip,
          device: /Mobile/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        };
        const updated = [entry, ...existing].slice(0, 10);
        sessionStorage.setItem(sessionKey, JSON.stringify(updated));
        sessionStorage.setItem(activeKey, "1");
        setSessionHistory(updated);
      } else {
        setSessionHistory(existing);
      }
    } catch {
      setSessionHistory([]);
    }
  }, [user?._id]);

  useEffect(() => {
    if (isAdmin) setActiveTab("activity");
  }, [isAdmin]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPageLoading(false);
      return;
    }
    syncUserFields();
    const loaders = isAdmin
      ? [loadSessionHistory()]
      : [loadWatchlist(), loadSessionHistory()];
    Promise.all(loaders).finally(() => setPageLoading(false));
  }, [user, authLoading, isAdmin, syncUserFields, loadWatchlist, loadSessionHistory]);

  const savePrefs = (next) => {
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    showToast("Preferences saved", "success");
  };

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      showToast("Username must be at least 2 characters", "warning");
      return;
    }
    if (trimmed === user.username) {
      showToast("No changes to save", "info");
      return;
    }
    setSavingUsername(true);
    try {
      const res = await updateUsername(trimmed);
      updateUser({ username: res.username || trimmed });
      showToast(res.message || "Username updated", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingUsername(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      showToast(res.message || "Password updated", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "warning");
      return;
    }

    setUploadingAvatar(true);
    const preview = URL.createObjectURL(file);
    setAvatar(preview);

    try {
      let finalFile = await compressImageFile(file, 800, 0.8);
      const MAX = 5 * 1024 * 1024;
      if (finalFile.size > MAX) {
        finalFile = await compressImageFile(file, 800, 0.5);
      }
      if (finalFile.size > MAX) {
        throw new Error("Image too large. Try a smaller file.");
      }
      const res = await updateAvatarFile(finalFile);
      if (res?.avatar) {
        setAvatar(res.avatar);
        updateUser({ avatar: res.avatar });
      }
      showToast("Profile photo updated", "success");
    } catch (err) {
      setAvatar(user.avatar || null);
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      showToast("Account deleted", "success");
      setShowDeleteModal(false);
      navigate("/");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || pageLoading) {
    return <Loader visible message="Loading profile..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-400">Please log in to view your profile.</p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-lg bg-[#01B4E4] text-black font-semibold"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const avatarSrc =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || "User")}&background=01B4E4&color=000`;

  const SidebarNav = ({ onNavigate }) => (
    <div className="flex flex-col flex-1 gap-2">
      {visibleTabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => {
            setActiveTab(key);
            onNavigate?.();
          }}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
            activeTab === key
              ? "bg-[#01B4E4] text-black font-semibold"
              : "text-gray-300 hover:bg-white/10"
          }`}
        >
          <Icon size={18} /> {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-[#020024] via-[#111] to-[#0D253F] min-h-screen px-3 sm:px-4 py-6 sm:py-10 flex justify-center">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl text-white flex flex-col md:flex-row overflow-hidden min-h-[640px]"
      >
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 bg-black/40 flex-col p-4">
          <div className="flex flex-col items-center py-6 border-b border-white/20">
            <div className="relative">
              <img
                src={avatarSrc}
                alt={user.username}
                className="w-24 h-24 rounded-full border-2 border-white/30 object-cover"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-xs">
                  ...
                </div>
              )}
            </div>
            {!isAdmin && (
              <label className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 text-sm cursor-pointer hover:bg-white/10">
                <Upload size={14} /> Change photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            )}
            <h2 className="mt-3 font-bold text-lg">{user.username}</h2>
            <p className="text-gray-400 text-sm text-center break-all">{user.email}</p>
            <span
              className={`mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isAdmin
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : isPrime
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : "bg-white/10 text-gray-300 border-white/20"
              }`}
            >
              {accountLabel}
            </span>
          </div>

          <SidebarNav />

          <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-white/10">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300"
              >
                <LayoutDashboard size={18} />
                Admin Dashboard
              </Link>
            )}
            <Link
              to="/watchlist"
              className="flex items-center gap-2 justify-center py-2 rounded-lg border border-white/15 text-gray-200 hover:bg-white/10 text-sm"
            >
              <BookmarkCheck size={16} /> My Watchlist
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 justify-center py-2 rounded-lg border border-white/15 text-gray-300 hover:text-red-400 hover:border-red-500/30"
            >
              <LogOut size={18} /> Logout
            </button>
            {!isAdmin && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 justify-center py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm"
              >
                <Trash2 size={16} /> Delete account
              </button>
            )}
          </div>
        </aside>

        {/* Mobile header */}
        <div className="md:hidden flex justify-between items-center bg-black/40 p-3 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <img src={avatarSrc} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold truncate">{user.username}</p>
              <p className="text-xs text-gray-400 truncate">{accountLabel}</p>
            </div>
          </div>
          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/40 px-4 py-3 border-b border-white/10 overflow-hidden"
            >
              <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/10">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-black bg-amber-400"
                  >
                    <LayoutDashboard size={16} /> Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/watchlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm text-cyan-400"
                >
                  My Watchlist
                </Link>
                <button type="button" onClick={logout} className="py-2 text-red-400 text-sm">
                  Logout
                </button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto">
          {isAdmin && (
            <p className="text-sm text-gray-400 mb-6 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              Personal details and security are managed in{" "}
              <Link to="/admin/account" className="text-amber-300 hover:underline">
                Admin Dashboard → My account
              </Link>
              .
            </p>
          )}

          {!isAdmin && activeTab === "profile" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold">Overview</h2>
                <p className="text-gray-400 text-sm mt-1">Your CinemaHouse activity at a glance</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl p-5 bg-black/30 border border-white/10 text-center">
                  <p className="text-gray-400 text-sm">Watchlist Movies</p>
                  <p className="text-4xl font-bold text-yellow-400 mt-1">{movieCount}</p>
                </div>
                <div className="rounded-xl p-5 bg-black/30 border border-white/10 text-center">
                  <p className="text-gray-400 text-sm">Watchlist TV</p>
                  <p className="text-4xl font-bold text-blue-400 mt-1">{tvCount}</p>
                </div>
                <div className="rounded-xl p-5 bg-black/30 border border-white/10 text-center">
                  <p className="text-gray-400 text-sm">Account</p>
                  <p className={`text-xl font-bold mt-2 ${isAdmin ? "text-amber-400" : ""}`}>
                    {accountLabel}
                  </p>
                </div>
              </div>
              {movieCount + tvCount > 0 ? (
                <div className="bg-black/30 border border-white/10 p-6 rounded-xl max-w-sm mx-auto">
                  <h3 className="text-center font-semibold mb-4">Watchlist split</h3>
                  <Doughnut
                    data={{
                      labels: ["Movies", "TV Shows"],
                      datasets: [
                        {
                          data: [movieCount, tvCount],
                          backgroundColor: ["#FACC15", "#60A5FA"],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      plugins: { legend: { labels: { color: "#fff" } } },
                    }}
                  />
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm">
                  Add titles to your{" "}
                  <Link to="/watchlist" className="text-cyan-400 hover:underline">
                    watchlist
                  </Link>{" "}
                  to see stats here.
                </p>
              )}
            </div>
          )}

          {!isAdmin && activeTab === "security" && (
            <div className="max-w-md space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Security</h2>
                <p className="text-gray-400 text-sm mt-1">Update your password securely</p>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-5">
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Current password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 pr-10"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-400"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                    >
                      {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1">New password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 pr-10"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-400"
                      onClick={() => setShowNewPw(!showNewPw)}
                    >
                      {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-[#01B4E4] transition-all"
                      style={{ width: `${passwordStrength()}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Use 8+ chars with a number and capital letter for a strong password.</p>
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full py-2.5 rounded-lg bg-[#01B4E4] text-black font-semibold disabled:opacity-50"
                >
                  {savingPassword ? "Updating..." : "Update password"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Activity</h2>
                <p className="text-gray-400 text-sm mt-1">Recent login sessions on this account</p>
              </div>
              {sessionHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">No sessions recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {sessionHistory.map((s, i) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap justify-between gap-2 bg-black/30 border border-white/10 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {i === 0 ? "Current session" : "Previous session"}
                        </p>
                        <p className="text-gray-400 text-xs">{s.date}</p>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <p>{s.device}</p>
                        <p>IP: {s.ip}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!isAdmin && activeTab === "settings" && (
            <div className="max-w-lg space-y-8">
              <div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-gray-400 text-sm mt-1">Manage your account details</p>
              </div>

              <form onSubmit={handleSaveUsername} className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-5">
                <h3 className="font-semibold flex items-center gap-2">
                  <User size={18} /> Profile details
                </h3>
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={30}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1 flex items-center gap-1">
                    <Mail size={14} /> Email
                  </label>
                  <input
                    value={user.email}
                    disabled
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed here.</p>
                </div>
                <button
                  type="submit"
                  disabled={savingUsername}
                  className="w-full py-2.5 rounded-lg bg-[#01B4E4] text-black font-semibold disabled:opacity-50"
                >
                  {savingUsername ? "Saving..." : "Save username"}
                </button>
              </form>

              <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-5">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell size={18} /> Preferences
                </h3>
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <span className="text-sm text-gray-300">Email me about new releases</span>
                  <input
                    type="checkbox"
                    checked={prefs.emailUpdates}
                    onChange={(e) =>
                      savePrefs({ ...prefs, emailUpdates: e.target.checked })
                    }
                    className="w-5 h-5 accent-cyan-400"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <span className="text-sm text-gray-300">Hide spoiler warnings</span>
                  <input
                    type="checkbox"
                    checked={prefs.showSpoilers}
                    onChange={(e) =>
                      savePrefs({ ...prefs, showSpoilers: e.target.checked })
                    }
                    className="w-5 h-5 accent-cyan-400"
                  />
                </label>
                <p className="text-xs text-gray-500">
                  Preferences are saved on this device instantly.
                </p>
              </div>

              <label className="md:hidden flex items-center justify-center gap-2 py-2 rounded-lg border border-white/15 cursor-pointer">
                <Upload size={16} /> Upload profile photo
                <input type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
              </label>
            </div>
          )}
        </main>

        <AnimatePresence>
          {showDeleteModal && (
            <Motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-[#0D253F] rounded-2xl p-6 w-full max-w-sm border border-white/10"
              >
                <h2 className="text-lg font-semibold text-red-400 text-center">Delete account?</h2>
                <p className="text-gray-300 text-sm text-center mt-3 mb-6">
                  This permanently removes your account, watchlist, and reviews.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>
      </Motion.div>
    </div>
  );
};

export default Profile;
