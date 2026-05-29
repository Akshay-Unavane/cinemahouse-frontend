import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertTriangle, Clapperboard } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { login as loginApi } from "../service/auth";
import Loader from "../component/Loader";

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: localStorage.getItem("rememberEmail") || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(!!localStorage.getItem("rememberEmail"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [capsLock, setCapsLock] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("All fields are required");
      showToast("All fields are required", "warning");
      return;
    }

    setLoading(true);

    try {
      const res = await loginApi(form.email, form.password);
      login(res.token);

      if (remember) {
        localStorage.setItem("rememberEmail", form.email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      showToast("Login successful!", "success");
      navigate("/", { replace: true });
    } catch (err) {
      const message = err.message || "Invalid credentials";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength =
    form.password.length >= 8 ? "Strong password" : "Use at least 8 characters";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4">
      {loading && <Loader message="Logging in..." />}

      <Motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_25px_80px_rgba(0,0,0,0.7)]"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-2xl bg-[#01B4E4]/10 border border-[#01B4E4]/30 mb-3">
            <Clapperboard className="text-[#01B4E4]" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-center">Welcome Back</h1>
        </div>
        <p className="text-center text-gray-400 mb-6 text-sm -mt-2">
          Login to continue exploring movies & TV shows
        </p>

        {error && (
          <Motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="mb-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-rose-400 text-sm"
          >
            <AlertTriangle size={16} />
            {error}
          </Motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
              <input
                autoFocus
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-900/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-gray-900/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-between mt-1 text-xs">
              <span className="text-gray-400">{passwordStrength}</span>
              {capsLock && <span className="text-yellow-400">Caps Lock ON</span>}
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              className="accent-cyan-400"
            />
            Remember me
          </div>

          {/* Submit */}
          <Motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </Motion.button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400 space-y-2">
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-cyan-400 hover:underline">
              Create one
            </Link>
          </p>
          <p>
            Forgot password?{" "}
            <Link to="/reset-password" className="text-cyan-400 hover:underline">
              Reset here
            </Link>
          </p>
        </div>
      </Motion.div>
    </div>
  );
};

export default Login;
