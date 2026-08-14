import React, { useRef, useState, useEffect } from "react";

export default function OTPInput({ length = 6, onComplete, resend, resendCooldown = 60 }) {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputs = useRef([]);
  const [timer, setTimer] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (values.every((v) => v !== "")) {
      onComplete && onComplete(values.join(""));
    }
  }, [values, onComplete]);

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    const next = [...values];
    next[i] = v;
    setValues(next);
    if (v && inputs.current[i + 1]) inputs.current[i + 1].focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !values[i] && inputs.current[i - 1]) {
      const prev = [...values];
      prev[i - 1] = "";
      setValues(prev);
      inputs.current[i - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").trim().slice(0, length);
    const arr = text.split("").map((c) => c.replace(/[^0-9]/g, ""));
    const next = Array(length).fill("");
    arr.forEach((c, idx) => (next[idx] = c));
    setValues(next);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setTimer(resendCooldown);
    setCanResend(false);
    if (resend) await resend();
    // restart timer
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            value={values[i]}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-12 h-12 text-center rounded-md bg-white/5 text-white border border-white/20 focus:border-[#01B4E4] outline-none"
          />
        ))}
      </div>

      <div className="mt-3 text-center text-sm text-gray-300">
        <button disabled={!canResend} onClick={handleResend} className={`underline ${canResend? 'text-white':'text-gray-500'}`}>
          Resend code {canResend ? "" : `(${timer}s)`}
        </button>
      </div>
    </div>
  );
}
