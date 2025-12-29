import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Loader({ visible, message }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;
    if (visible) {
      // Minimum 500ms visible
      setShow(true);
    } else {
      // Delay hiding for smooth fade-out
      timer = setTimeout(() => setShow(false), 900);
    }
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="p-6 rounded-lg flex flex-col items-center gap-4 shadow-lg max-w-xs w-full mx-4 bg-white/90 dark:bg-gray-900/90">
            
            {/* Spinner with animated dots */}
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 bg-indigo-600 rounded-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 0,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Text */}
            <div className="text-center">
              <div className="font-medium text-indigo-600">{message || "Loading..."}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Please wait a moment
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Loader;
