import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
export default function BackToHome() { return <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18 }}><Link className="back-home" to="/"><ArrowLeft size={17} /> Back to Home</Link></motion.div> }
