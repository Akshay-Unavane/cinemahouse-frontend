/* @refresh reset */
// Toast context for global notifications
import { X } from "lucide-react";
import { useState } from "react";
import { ToastContext } from "./contexts";

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
          
        </div>
      )}
    </ToastContext.Provider>
  );
}

/* Note: `useToast` moved to a separate module to avoid fast-refresh export issues. */
