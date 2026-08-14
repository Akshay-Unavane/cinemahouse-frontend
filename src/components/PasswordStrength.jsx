import React from "react";

export default function PasswordStrength({ password }) {
  const checks = [
    { label: "Minimum 8 Characters", ok: password.length >= 8 },
    { label: "One Uppercase", ok: /[A-Z]/.test(password) },
    { label: "One Lowercase", ok: /[a-z]/.test(password) },
    { label: "One Number", ok: /[0-9]/.test(password) },
    { label: "One Special Character", ok: /[@$!%*?&]/.test(password) },
  ];

  return (
    <div className="mt-2 text-sm">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2 text-gray-200">
          <div className={`w-3 h-3 rounded-full ${c.ok ? "bg-emerald-400" : "bg-white/20"}`} />
          <span className={c.ok ? "text-gray-100" : "text-gray-400"}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}
