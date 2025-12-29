import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const ImageViewer = ({ open, onClose, imageUrl, title }) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-4xl w-full"
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.85 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white hover:text-red-400"
          >
            <X size={28} />
          </button>

          {/* Title */}
          {title && (
            <h2 className="text-center text-white mb-3 text-lg font-semibold">
              {title}
            </h2>
          )}

          {/* Image */}
          <img
            src={imageUrl}
            alt={title || "Preview"}
            className="rounded-xl w-full max-h-[80vh] object-contain shadow-2xl"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageViewer;
