import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailValidator({ value }) {
  if (!value) return null;
  const valid = emailRegex.test(value.trim());
  return (
    <div className="mt-1 text-sm flex items-center gap-2">
      {valid ? (
        <span className="text-emerald-400 flex items-center gap-2"><CheckCircle size={16}/> ✔ Valid Email</span>
      ) : (
        <span className="text-rose-400 flex items-center gap-2"><XCircle size={16}/> ❌ Invalid Email Format</span>
      )}
    </div>
  );
}
