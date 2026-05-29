import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { verifyAdminAccess } from "../service/admin";
import { isAdminUnlocked, setAdminUnlocked } from "../utils/adminSession";
import { useToast } from "../context/useToast";

const AdminGate = ({ children }) => {
  const { showToast } = useToast();
  const [unlocked, setUnlocked] = useState(isAdminUnlocked);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Enter your password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await verifyAdminAccess(password);
      setAdminUnlocked(res.expiresInSeconds || 30 * 60);
      setUnlocked(true);
      setPassword("");
      showToast("Admin panel unlocked", "success");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Verification failed";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (unlocked) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <ShieldCheck className="text-amber-400" size={36} />
          </div>
          <h1 className="text-2xl font-bold">Admin verification</h1>
          <p className="text-gray-400 text-sm mt-2">
            Re-enter your account password to open the admin dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-black/40 border border-white/15 outline-none focus:border-amber-400"
                placeholder="Your login password"
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Unlock admin panel"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Access stays unlocked for 30 minutes on this browser.
        </p>
        <Link
          to="/"
          className="block text-center text-sm text-cyan-400 hover:underline mt-4"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default AdminGate;
