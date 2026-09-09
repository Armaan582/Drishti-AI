import { motion } from "framer-motion";

export default function FeatureCard({ icon: Icon, title, detail, index }) {
  return (
    <motion.article
      className="feature-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      whileHover={{ y: -4 }}
    >
      <span className="feature-icon">
        <Icon size={21} strokeWidth={1.9} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
    </motion.article>
  );
}
