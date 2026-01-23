/* @refresh reset */
// Toast context for global notifications
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { ToastContext } from "./contexts";

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const clearExisting = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const showToast = useCallback((message, type = "success", ttl = 3000) => {
    clearExisting();
    setToast({ message, type });
    timeoutRef.current = setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, ttl);
  }, []);

  useEffect(() => {
    return () => clearExisting();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded shadow-lg text-white font-semibold flex items-center gap-3 max-w-xl w-full sm:w-auto`}
        >
          <div className={`p-2 rounded-full flex items-center justify-center ${
            toast.type === 'success' ? 'bg-green-700' : toast.type === 'error' ? 'bg-red-700' : toast.type === 'warning' ? 'bg-yellow-600' : 'bg-sky-600'
          }`}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <X size={18} />}
            {toast.type === 'warning' && <AlertTriangle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
          </div>
          <div className="flex-1 text-sm">{toast.message}</div>
          <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

/* Note: `useToast` moved to a separate module to avoid fast-refresh export issues. */
