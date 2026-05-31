import { useState, useEffect } from "react";
import { Eye, EyeOff, KeyRound, Mail, AlertTriangle } from "lucide-react";
import { useToast } from "../context/useToast";
import {
  changePassword,
  forgotPassword,
  verifyResetPassword,
} from "../service/auth";

const strengthBarClass = (variant = "cyan") =>
  variant === "amber" ? "bg-amber-400" : "bg-[#01B4E4]";

export default function ChangePasswordSection({
  email = "",
  strengthVariant = "cyan",
}) {
  const { showToast } = useToast();
  const [mode, setMode] = useState("current");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [otpStep, setOtpStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
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

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpError("");
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
      resetFields();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email?.trim()) {
      setOtpError("No email on this account");
      return;
    }
    setSavingPassword(true);
    setOtpError("");
    try {
      const res = await forgotPassword(email);
      if (!res.emailSent) {
        const msg = res.message || "Email could not be sent";
        setOtpError(msg);
        showToast(msg, "error");
        return;
      }
      setResendCooldown(60);
      setOtpStep(2);
      showToast("Check your email for the 6-digit code", "success");
    } catch (err) {
      setOtpError(err.message);
      showToast(err.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setSavingPassword(true);
    setOtpError("");
    try {
      const res = await forgotPassword(email);
      if (!res.emailSent) {
        const msg = res.message || "Could not resend code";
        setOtpError(msg);
        showToast(msg, "error");
        return;
      }
      setResendCooldown(60);
      showToast("New code sent to your email", "success");
    } catch (err) {
      setOtpError(err.message);
      showToast(err.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleOtpReset = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setOtpError("Enter the 6-digit code from your email");
      return;
    }
    if (newPassword.length < 6) {
      setOtpError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setOtpError("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    setOtpError("");
    try {
      const res = await verifyResetPassword(email, otp, newPassword);
      showToast(res.message || "Password updated", "success");
      setOtpStep(1);
      resetFields();
    } catch (err) {
      setOtpError(err.message);
      showToast(err.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setOtpStep(1);
    resetFields();
    setOtpError("");
  };

  const barClass = strengthBarClass(strengthVariant);

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-white/10 p-1 bg-black/30">
        <button
          type="button"
          onClick={() => switchMode("current")}
          className={`flex-1 py-2 text-sm rounded-md transition ${
            mode === "current"
              ? "bg-[#01B4E4] text-black font-semibold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Current password
        </button>
        <button
          type="button"
          onClick={() => switchMode("otp")}
          className={`flex-1 py-2 text-sm rounded-md transition ${
            mode === "otp"
              ? "bg-[#01B4E4] text-black font-semibold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Email code
        </button>
      </div>

      {otpError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{otpError}</span>
        </div>
      )}

      {mode === "current" ? (
        <form
          onSubmit={handlePasswordChange}
          className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-5"
        >
          <h3 className="font-medium">Update password</h3>
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
                className={`h-full transition-all ${barClass}`}
                style={{ width: `${passwordStrength()}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use 8+ chars with a number and capital letter for a strong password.
            </p>
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
      ) : otpStep === 1 ? (
        <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-5">
          <h3 className="font-medium flex items-center gap-2">
            <Mail size={18} className="text-cyan-400" /> Verify with email
          </h3>
          <p className="text-sm text-gray-400">
            We&apos;ll send a 6-digit code to{" "}
            <span className="text-white font-medium">{email || "your account email"}</span>.
            Use it to set a new password without your current one.
          </p>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={savingPassword || !email}
            className="w-full py-2.5 rounded-lg bg-[#01B4E4] text-black font-semibold disabled:opacity-50"
          >
            {savingPassword ? "Sending..." : "Send code to my email"}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleOtpReset}
          className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-5"
        >
          <h3 className="font-medium">Enter code & new password</h3>
          <p className="text-sm text-gray-400 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
            Check your inbox and spam folder. The code expires in 15 minutes.
          </p>
          <div>
            <label className="text-sm text-gray-300 block mb-1">6-digit code from email</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 text-cyan-400" size={18} />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setOtpError("");
                }}
                placeholder="000000"
                className="w-full bg-black/40 border border-white/15 rounded-lg pl-10 pr-3 py-2.5 tracking-[0.35em] font-mono"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || savingPassword}
              className="text-xs text-cyan-400 hover:underline mt-2 disabled:text-gray-500 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code to email"}
            </button>
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
                className={`h-full transition-all ${barClass}`}
                style={{ width: `${passwordStrength()}%` }}
              />
            </div>
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
          <button
            type="button"
            onClick={() => {
              setOtpStep(1);
              resetFields();
            }}
            className="w-full text-sm text-gray-400 hover:text-white"
          >
            Cancel and request a new code
          </button>
        </form>
      )}
    </div>
  );
}
