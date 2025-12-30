import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
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
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      showToast("Login successful!", "success");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
      showToast(err.message || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4">
      {loading && <Loader message="Logging in..." />}

      <Motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        <h1 className="text-3xl font-extrabold text-center mb-2">
          🎬 Welcome Back
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm">
          Login to continue exploring movies & TV shows
        </p>

        {error && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-rose-400 text-sm"
          >
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
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
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
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-gray-900/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg font-semibold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition disabled:opacity-50"
          >
            Login
          </button>
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
