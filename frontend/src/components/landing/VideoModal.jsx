import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, PlayCircle } from "lucide-react";
export default function VideoModal({ open, onClose }) {
  useEffect(() => {
    const close = (e) => e.key === "Escape" && onClose();
    if (open) addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          role="presentation"
          onMouseDown={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            className="video-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-title"
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
          >
            <button
              className="icon-button modal-close"
              onClick={onClose}
              aria-label="Close video modal"
            >
              <X />
            </button>
            <PlayCircle size={42} />
            <h2 id="video-title">Drishti AI</h2>
            <p>Video Coming Soon</p>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
