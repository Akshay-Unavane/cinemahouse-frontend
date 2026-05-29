import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Upload,
  Mail,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import {
  updateUsername,
  updateAvatarFile,
  changePassword,
  deleteAccount,
} from "../../service/auth";

async function compressImageFile(file, maxWidth = 800, quality = 0.8) {
  const image = await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
  const width = Math.min(image.width, maxWidth);
  const height = Math.round(width / (image.width / image.height));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(image, 0, 0, width, height);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
  if (!blob) throw new Error("Compression failed");
  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

const AdminAccount = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [section, setSection] = useState("personal");
  const [username, setUsername] = useState(user?.username || "");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [savingUsername, setSavingUsername] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setUsername(user?.username || "");
    setAvatar(user?.avatar || null);
  }, [user]);

  const passwordStrength = () => {
    if (!newPassword) return 0;
    if (newPassword.length < 6) return 25;
    if (newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /\d/.test(newPassword)) return 100;
    return 60;
  };

  const avatarSrc =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "Admin")}&background=f59e0b&color=000`;

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      showToast("Username must be at least 2 characters", "warning");
      return;
    }
    setSavingUsername(true);
    try {
      const res = await updateUsername(trimmed);
      updateUser({ username: res.username || trimmed });
      showToast("Username updated", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      showToast("Choose an image file", "warning");
      return;
    }
    setUploadingAvatar(true);
    try {
      let finalFile = await compressImageFile(file);
      if (finalFile.size > 5 * 1024 * 1024) {
        finalFile = await compressImageFile(file, 800, 0.5);
      }
      const res = await updateAvatarFile(finalFile);
      if (res?.avatar) {
        setAvatar(res.avatar);
        updateUser({ avatar: res.avatar });
      }
      showToast("Photo updated", "success");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast("Password updated", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete your admin account permanently?")) return;
    setDeleting(true);
    try {
      await deleteAccount();
      showToast("Account deleted", "success");
      navigate("/");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Admin account</h2>
        <p className="text-sm text-gray-400 mt-1">
          Personal details and security for your administrator account
        </p>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setSection("personal")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
            section === "personal"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-gray-400 hover:bg-white/5"
          }`}
        >
          <User size={16} /> Personal details
        </button>
        <button
          type="button"
          onClick={() => setSection("security")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
            section === "security"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-gray-400 hover:bg-white/5"
          }`}
        >
          <Shield size={16} /> Security
        </button>
      </div>

      {section === "personal" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl border border-white/10 bg-black/20">
            <img
              src={avatarSrc}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-2 border-amber-500/30"
            />
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 cursor-pointer hover:bg-white/5">
              <Upload size={16} />
              {uploadingAvatar ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploadingAvatar}
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          <form
            onSubmit={handleSaveUsername}
            className="max-w-lg space-y-4 p-5 rounded-xl border border-white/10 bg-black/20"
          >
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
                value={user?.email || ""}
                disabled
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Role</label>
              <input
                value="Administrator"
                disabled
                className="w-full bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 text-amber-300 cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={savingUsername}
              className="px-5 py-2.5 rounded-lg bg-[#01B4E4] text-black font-semibold disabled:opacity-50"
            >
              {savingUsername ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      )}

      {section === "security" && (
        <div className="space-y-6 max-w-lg">
          <form
            onSubmit={handlePasswordChange}
            className="space-y-4 p-5 rounded-xl border border-white/10 bg-black/20"
          >
            <h3 className="font-medium">Change password</h3>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Current password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 pr-10"
                  required
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
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${passwordStrength()}%` }}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5"
                required
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

          <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5">
            <h3 className="font-medium text-red-300 flex items-center gap-2">
              <Trash2 size={18} /> Danger zone
            </h3>
            <p className="text-sm text-gray-400 mt-2 mb-4">
              Deleting your account removes admin access and all associated data.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccount;
