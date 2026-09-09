import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { navigation } from "../../data/navigation";

export default function MobileMenu({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            className="menu-backdrop"
            onClick={onClose}
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="mobile-menu"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 36 }}
            transition={{ duration: 0.25 }}
          >
            <button
              className="icon-button close-menu"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X />
            </button>
            <nav>
              {navigation.map(({ label, href }) => (
                <a href={href} key={label} onClick={onClose}>
                  {label}
                </a>
              ))}
            </nav>
            <div className="mobile-actions">
              <Link to="/login" onClick={onClose}>
                Login
              </Link>
              <Link className="button primary" to="/login" onClick={onClose}>
                Get Started <span>→</span>
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
