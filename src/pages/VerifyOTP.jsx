import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OTPInput from "../components/OTPInput";
import { verifyOtp, resendOtp } from "../services/authService";
import { useToast } from "../context/useToast";

export default function VerifyOTP() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const params = new URLSearchParams(loc.search);
  const email = params.get("email") || "";

  const [loading, setLoading] = useState(false);

  const handleComplete = async (code) => {
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp: code });
      showToast(res.message || "Verified", "success");
      navigate("/login");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await resendOtp(email);
      showToast(res.message || "OTP resent", "success");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Could not resend", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#020024] via-[#1f2933] to-[#0f172a]">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Verify Code</h2>
        <p className="text-sm text-gray-300 text-center mb-4">Enter the 6-digit code sent to <strong className="text-white">{email}</strong></p>
        <OTPInput length={6} onComplete={handleComplete} resend={handleResend} />
        <div className="mt-4 text-center">
          {loading ? <div className="text-gray-300">Verifying...</div> : null}
        </div>
      </div>
    </div>
  );
}
