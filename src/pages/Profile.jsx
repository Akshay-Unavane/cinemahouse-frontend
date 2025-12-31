import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { getWatchlist } from "../service/watchlist";
import { updateUsername, deleteAccount, updateAvatarFile } from "../service/auth";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL; // Ensure it ends WITHOUT trailing slash

// Helper: compress/resize image file to JPEG via canvas
async function compressImageFile(file, maxWidth = 800, quality = 0.8) {
  if (!file) throw new Error("No file provided");

  // Load image into an HTMLImageElement
  const image = await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };
    img.src = url;
  });

  const ratio = image.width / image.height;
  const width = image.width > maxWidth ? maxWidth : image.width;
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) throw new Error("Image compression failed");

  const newName = (file.name || "avatar").replace(/\.[^/.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

const tabs = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Shield },
  { key: "activity", label: "Activity", icon: Clock },
  { key: "settings", label: "Settings", icon: Settings },
];

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("profile");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [watchlistStats, setWatchlistStats] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sessionHistory = [
    { id: 1, date: "20 Dec 2025 • 10:30 AM", ip: "192.168.1.2" },
    { id: 2, date: "19 Dec 2025 • 05:15 PM", ip: "192.168.1.5" },
  ];

  const movieCount = watchlistStats.filter(item => item.mediaType === "movie").length;
  const tvCount = watchlistStats.filter(item => item.mediaType === "tv").length;

  const watchlistData = {
    labels: ["Movies", "TV Shows"],
    datasets: [
      {
        label: "Watchlist",
        data: [movieCount, tvCount],
        backgroundColor: ["#FACC15", "#60A5FA"],
        borderColor: ["#FACC15", "#60A5FA"],
        borderWidth: 1,
      },
    ],
  };

  const watchlistChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "white",
        },
      },
    },
  };

  // useEffect(() =>{
  //   if(user?.username){
  //     setUsername(user.username)
  //   }
  // }, [user]);

  useEffect(() =>{
    if (!user || !token) return;

    getWatchlist()
      .then((data) => setWatchlistStats(data))
      .catch((err) =>
        showToast(err.message || "Failed to fetch watchlist stats", "error")
      );

  }, [user, token, showToast]);

  useEffect(() => {
    if (user && token) {
      showToast("User authenticated");
    }
  }, [user, token, showToast]);

  if (!user){ 
    return <div className="text-center py-24 text-white">Please login</div>;
  }
  const passwordStrength = () => {
    if (newPassword.length < 6) return 30;
    if (/[A-Z]/.test(newPassword) && /\d/.test(newPassword)) return 100;
    return 60;
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showToast("Passwords do not match", "error");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, newPassword }),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast("Password updated. Please login again.", "success");
      await logout();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Password update failed", "error");
    }
    setLoading(false);
  };

  const handleUpdateUsername = async () => {
    setUpdatingUsername(true);
    try {
      const newUsername = prompt("Enter new username:");
      if (newUsername) {
        const response = await updateUsername(newUsername);
        alert(response.message);
      }
    } catch (err) {
      console.error("UPDATE USERNAME ERROR:", err);
      alert("Failed to update username");
    } finally {
      setUpdatingUsername(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // immediate preview (fast) while we compress/upload
    const avatarPreview = URL.createObjectURL(file);
    setAvatar(avatarPreview);

    try {
      showToast("Compressing avatar...", "info");

      const compressed = await compressImageFile(file, 800, 0.8);

      // If still too large, try lower quality
      const MAX_BYTES = 5 * 1024 * 1024; // match server limit
      let finalFile = compressed;
      if (finalFile.size > MAX_BYTES) {
        showToast("Compressing at lower quality...", "info");
        // try lower quality pass
        finalFile = await compressImageFile(file, 800, 0.6);
      }

      if (finalFile.size > MAX_BYTES) {
        throw new Error("Compressed image still exceeds 5MB limit. Choose a smaller image.");
      }

      showToast("Uploading avatar...", "info");
      const res = await updateAvatarFile(finalFile);

      if (res && res.avatar) {
        setAvatar(res.avatar);
        updateUser({ avatar: res.avatar });
        showToast("Avatar uploaded", "success");
      } else {
        showToast("Avatar uploaded (server did not return URL)", "warning");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      showToast(err.message || "Avatar upload failed", "error");
    }
  };
  return (
    <div className="bg-gradient-to-br mt-10 from-[#020024] via-[#111] to-[#0D253F] min-h-screen px-4 py-10 flex justify-center">
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl text-white flex flex-col md:flex-row overflow-hidden"
      >
        {/* Sidebar for desktop */}
        <div className="hidden md:flex w-60 bg-black/40 flex-col p-4 space-y-4">
          <div className="flex flex-col items-center py-6 border-b border-white/20">
            <img
              src={avatar || `https://ui-avatars.com/api/?name=${user.username || "User"}&background=01B4E4&color=000`}
              className="w-24 h-24 rounded-full border-2 border-white/30 object-cover"
            />
            <label className="mt-2 flex gap-3 items-center px-2 rounded text-white font-bold cursor-pointer text-sm border-x">
              <Upload size={14} /> Upload
              <input type="file" hidden onChange={handleAvatarUpload} />
            </label>
            <h2 className="mt-2 font-bold text-lg">{user.username}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>

          <div className="flex flex-col flex-1 gap-2">
            {tabs.map(({ key, label, icon }) => {
              const IconComp = icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === key
                      ? "bg-[#01B4E4] text-black font-semibold"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <IconComp size={18} /> {label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 mt-auto">
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-300 hover:text-red-500 text-lg border py-2 px-3 rounded-lg"
            >
              <LogOut size={18} /> Logout
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 text-gray-300 hover:text-red-500 text-lg border py-2 px-3 rounded-lg"
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden flex justify-between items-center bg-black/40 p-3 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img
              src={avatar || `https://ui-avatars.com/api/?name=${user.username || "User"}&background=01B4E4&color=000`}
              className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
            />
            <h2 className="font-semibold">{user.username}</h2>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-black/30 px-4 py-2 flex flex-col gap-2"
            >
              {tabs.map(({ key, label, icon }) => {
                const IconComp = icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full ${
                      activeTab === key
                        ? "bg-[#01B4E4] text-black font-semibold"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <IconComp size={16} /> {label}
                  </button>
                );
              })}
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="flex border-t-2 border-gray-700 items-center gap-2 w-full py-2 text-red-400"
              >
                <Trash2 size={16} /> Delete Account
              </button>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* PROFILE */}
          {activeTab === "profile" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg p-5 text-center bg-black/30 hover:bg-black/40 transition">
                  <p className="text-gray-400">Watchlist Movies</p>
                  <p className="text-4xl font-bold text-yellow-400">{movieCount}</p>
                </div>
                <div className="rounded-lg p-5 text-center bg-black/30 hover:bg-black/40 transition">
                  <p className="text-gray-400">Watchlist TV Shows</p>
                  <p className="text-4xl font-bold text-blue-400">{tvCount}</p>
                </div>
                <div className="rounded-lg p-5 text-center bg-black/30 hover:bg-black/40 transition">
                  <p className="text-gray-400">Account Type</p>
                  <p className="text-xl font-bold">Free</p>
                </div>
              </div>
              {/* Chart */}
              <div className="mt-10 bg-black/30 p-6 rounded-xl max-w-md mx-auto">
                <h3 className="text-center text-lg font-semibold mb-4">Watchlist Distribution</h3>
                <Doughnut data={watchlistData} options={watchlistChartOptions} />
              </div>
            </>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <h2 className="text-xl font-semibold">Change Password</h2>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/20 rounded px-3 py-2"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="h-2 bg-white/10 rounded">
                <div
                  className="h-full bg-[#01B4E4] rounded transition-all"
                  style={{ width: `${passwordStrength()}%` }}
                />
              </div>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2"
                autoComplete="new-password"
              />
              <button
                disabled={loading}
                className="w-full bg-[#01B4E4] text-black py-2 rounded font-semibold"
              >
                Update Password
              </button>
            </form>
          )}

          {/* ACTIVITY */}
          {activeTab === "activity" && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Session History</h2>
              {sessionHistory.map(s => (
                <div
                  key={s.id}
                  className="flex justify-between bg-black/30 px-4 py-3 rounded hover:bg-black/40 transition"
                >
                  <span>{s.date}</span>
                  <span className="text-gray-400">{s.ip}</span>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-xl font-semibold">Account Settings</h2>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2"
              />
              <button
                onClick={handleUpdateUsername}
                disabled={updatingUsername}
                className="w-full bg-[#01B4E4] text-black py-2 rounded font-semibold"
              >
                Update Username
              </button>
            </div>
          )}
        </div>

        {/* Delete Account Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <Motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="bg-[#0D253F] rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl border border-white/10"
              >
                <h2 className="text-lg font-semibold text-red-400 mb-3 text-center">
                  Delete Account
                </h2>
                <p className="text-gray-300 mb-6 text-center text-sm leading-relaxed">
                  This action is <span className="text-red-400 font-semibold">permanent</span>.
                  All your data, watchlist and profile information will be deleted forever.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="px-5 py-2 rounded-lg text-gray-300 bg-white/10 hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
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
