import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Clapperboard } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { register as registerApi } from "../service/auth";

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* PASSWORD STRENGTH */
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[@$!%*?&]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.password);
  const isPasswordValid = passwordStrength === 100;

  const strengthLabel =
    passwordStrength < 50
      ? "Weak"
      : passwordStrength < 75
      ? "Medium"
      : passwordStrength < 100
      ? "Strong"
      : "Very Strong";

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = form;

    if (!username || !email || !password) {
      showToast("All fields are required", "warning");
      return;
    }

    if (!isPasswordValid) {
      showToast("Password does not meet requirements", "warning");
      return;
    }

    setLoading(true);
    try {
      await registerApi(username, email, password);
      showToast("Account created successfully 🎉", "success");
      setForm({ username: "", email: "", password: "" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#020024] via-[#1f2933] to-[#0f172a]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          w-full max-w-md
          bg-white/10 backdrop-blur-xl
          border border-white/20
          rounded-2xl p-6 sm:p-8
          shadow-2xl
        "
      >
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white">
            Create Account
          </h1>
          <p className="text-gray-300 text-sm mt-1 flex justify-center gap-2">
            Join CinemaHouse and explore <Clapperboard size={18}/>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            icon={<User size={18} />}
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Your name"
          />

          <Input
            label="Email"
            icon={<Mail size={18} />}
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-200">Password</label>
            <div className="mt-1 flex items-center gap-2 bg-black/30 border border-white/20 rounded-lg px-3 focus-within:border-[#01B4E4]">
              <Lock size={18} className="text-gray-300" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full py-2 bg-transparent text-white outline-none placeholder-gray-400"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-300 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* STRENGTH BAR */}
            <div className="mt-2">
              <div className="h-2 bg-white/10 rounded">
                <div
                  className={`h-full rounded transition-all ${
                    passwordStrength < 50
                      ? "bg-red-500"
                      : passwordStrength < 75
                      ? "bg-yellow-400"
                      : passwordStrength < 100
                      ? "bg-green-400"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
              <p className="text-xs mt-1 text-gray-300">
                Strength:{" "}
                <span className="font-semibold text-white">
                  {strengthLabel}
                </span>
              </p>
            </div>
          </div>

          {/* SUBMIT */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !isPasswordValid}
            className="
              w-full py-3 rounded-lg font-semibold
              bg-gradient-to-r from-[#01B4E4] to-[#90dbf4]
              text-black
              hover:brightness-110
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            {loading ? "Creating Account..." : "Register"}
          </motion.button>

          {/* FOOTER */}
          <p className="text-center text-gray-300 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline hover:text-white transition"
            >
              Login
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

/* INPUT COMPONENT */
const Input = ({ label, icon, ...props }) => (
  <div>
    <label className="text-sm text-gray-200">{label}</label>
    <div className="mt-1 flex items-center gap-2 bg-black/30 border border-white/20 rounded-lg px-3 focus-within:border-[#01B4E4]">
      <span className="text-gray-300">{icon}</span>
      <input
        {...props}
        className="
          w-full py-2 bg-transparent text-white outline-none
          placeholder-gray-400
          focus:ring-0
        "
      />
    </div>
  </div>
);

export default Register;
