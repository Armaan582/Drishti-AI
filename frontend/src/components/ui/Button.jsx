import { motion } from "framer-motion";

export default function Button({
  children,
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`button ${className}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
