import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "../context/useToast";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const passwordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (/[A-Z]/.test(password) && /\d/.test(password)) return "Strong";
    return "Medium";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        showToast("Password reset successful!", "success");
        setEmail("");
        setNewPassword("");
      } else {
        setError(data.message || "Reset failed");
        showToast(data.message || "Reset failed", "error");
      }
    } catch {
      setError("Server error");
      showToast("Server error", "error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#020024] via-[#333232] to-[#7f8484]">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl space-y-6 text-white"
      >
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>

        {error && (
          <p className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
            {error}
          </p>
        )}

        {/* Email */}
        <div className="flex items-center gap-2 bg-black/30 border border-white/20 rounded-lg px-3">
          <Mail size={18} className="text-gray-300" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-2 bg-transparent text-white outline-none placeholder-gray-400"
            required
          />
        </div>

        {/* New Password */}
        <div className="flex items-center gap-2 bg-black/30 border border-white/20 rounded-lg px-3">
          <Lock size={18} className="text-gray-300" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full py-2 bg-transparent text-white outline-none placeholder-gray-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-gray-300 hover:text-white transition"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Password strength */}
        {newPassword && (
          <p className="text-sm text-gray-300">
            Strength:{" "}
            <span
              className={
                passwordStrength(newPassword) === "Strong"
                  ? "text-green-400"
                  : passwordStrength(newPassword) === "Medium"
                  ? "text-yellow-400"
                  : "text-red-400"
              }
            >
              {passwordStrength(newPassword)}
            </span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-gradient-to-r from-[#01B4E4] to-[#90dbf4] text-black font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="text-center text-gray-400 text-sm mt-2">
          Remembered your password?{" "}
          <Link to="/login" className="text-white hover:underline">
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default ResetPassword;
