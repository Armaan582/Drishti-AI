import { motion } from "framer-motion";
import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";
export default function DashboardPlaceholder({ title }) {
  return (
    <main className="dashboard-placeholder">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Construction size={30} />
        <p>DRISHTI AI</p>
        <h1>{title}</h1>
        <span>
          This workspace is being prepared and will be available soon.
        </span>
        <Link to="/dashboard">
          <ArrowLeft size={17} /> Back to Dashboard
        </Link>
      </motion.section>
    </main>
  );
}
