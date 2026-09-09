import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
export default function CTAButtons({ onWatch }) {
  return (
    <motion.div
      className="cta-buttons"
      initial={{ opacity: 0, y: 13 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
    >
      <Link className="button primary" to="/login">
        Get Started <span>→</span>
      </Link>
      <button className="button secondary" onClick={onWatch}>
        <Play size={15} fill="currentColor" /> Watch Video
      </button>
    </motion.div>
  );
}
