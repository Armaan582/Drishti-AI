import { motion } from "framer-motion";
import FeatureCards from "./FeatureCards";
import CTAButtons from "./CTAButtons";
export default function HeroSection({ onWatch }) {
  return (
    <section className="hero-copy" id="home">
      <motion.p
        className="eyebrow"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        AI-POWERED RETINAL SCREENING
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.55 }}
      >
        Early Detection.
        <br />
        <em>Healthier Tomorrows.</em>
      </motion.h1>
      <motion.p
        className="hero-description"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.5 }}
      >
        AI-assisted screening for diabetes-associated risk and diabetic
        retinopathy.
        <br />
        <strong>Accessible. Affordable. Impactful.</strong>
      </motion.p>
      <FeatureCards />
      <CTAButtons onWatch={onWatch} />
    </section>
  );
}
