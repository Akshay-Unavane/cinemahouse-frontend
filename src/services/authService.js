import axios from "axios";

const ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const API = `${ROOT}/api`;

const client = axios.create({ baseURL: API, headers: { "Content-Type": "application/json" } });

export async function checkEmail(email) {
  const { data } = await client.get(`/auth/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
  return data;
}

export async function register({ name, username, email, password }) {
  const { data } = await client.post("/auth/register", { name, username, email, password });
  return data;
}

export async function resendOtp(email) {
  const { data } = await client.post("/auth/resend-otp", { email });
  return data;
}

export async function verifyOtp({ email, otp, newPassword }) {
  const { data } = await client.post("/auth/verify-otp", { email, otp, newPassword });
  return data;
}

export default { checkEmail, register, resendOtp, verifyOtp };
