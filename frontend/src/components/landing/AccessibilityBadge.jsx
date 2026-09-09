import { motion } from "framer-motion";
import { UsersRound } from "lucide-react";
export default function AccessibilityBadge() {
  return (
    <motion.div
      className="accessibility-badge"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.65, duration: 0.45 }}
    >
      <span>
        <UsersRound size={18} />
      </span>
      <p>
        <strong>Accessible Eye Care</strong>
        <br />
        for Every Community
      </p>
    </motion.div>
  );
}
