import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useToast } from "../context/useToast";
import { forgotPassword, verifyResetPassword } from "../service/auth";
import Loader from "../component/Loader";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const passwordStrength = () => {
    if (!newPassword) return 0;
    if (newPassword.length < 6) return 25;
    if (newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /\d/.test(newPassword)) return 100;
    return 60;
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your account email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await forgotPassword(email);
      if (!res.emailSent) {
        setError(res.message || "Email could not be sent");
        showToast(res.message || "Email could not be sent", "error");
        return;
      }
      setResendCooldown(60);
      setStep(2);
      showToast("Check your email for the 6-digit code", "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await forgotPassword(email);
      if (!res.emailSent) {
        setError(res.message || "Could not resend code");
        showToast(res.message || "Could not resend code", "error");
        return;
      }
      setResendCooldown(60);
      showToast("New code sent to your email", "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError("Enter the 6-digit reset code from your email");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await verifyResetPassword(email, otp, newPassword);
      showToast(res.message || "Password reset!", "success");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4 py-16">
      {loading && <Loader message={step === 1 ? "Sending code..." : "Resetting password..."} />}

      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-2xl bg-[#01B4E4]/10 border border-[#01B4E4]/30 mb-3">
            {step === 1 ? (
              <Mail className="text-[#01B4E4]" size={32} />
            ) : (
              <ShieldCheck className="text-[#01B4E4]" size={32} />
            )}
          </div>
          <h1 className="text-2xl font-bold text-center">
            {step === 1 ? "Forgot password" : "Reset password"}
          </h1>
          <p className="text-gray-400 text-sm text-center mt-2">
            {step === 1
              ? "We'll email a 6-digit code to your registered address."
              : `Enter the code we sent to ${email}`}
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-[#01B4E4]" : "bg-white/10"}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-[#01B4E4]" : "bg-white/10"}`} />
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              Send reset code to email
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-gray-400 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              Check your inbox and spam folder. The code expires in 15 minutes.
            </p>

            <div>
              <label className="text-sm text-gray-300 block mb-1">6-digit code from email</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder="000000"
                  className="input-field pl-10 tracking-[0.4em] font-mono text-lg"
                  required
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-xs text-cyan-400 hover:underline mt-2 disabled:text-gray-500 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : "Resend code to email"}
              </button>
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-1">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#01B4E4] transition-all"
                  style={{ width: `${passwordStrength()}%` }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-1">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              Reset password
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
              }}
              className="w-full text-sm text-gray-400 hover:text-white flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} /> Change email
            </button>
          </form>
        )}

        <p className="text-center text-gray-400 text-sm mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Back to login
          </Link>
        </p>
      </Motion.div>
    </div>
  );
};

export default ForgotPassword;
