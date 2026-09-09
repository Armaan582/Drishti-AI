import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import '../styles/dashboard.css'

export default function DashboardPreview() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const name = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'
  const logout = async () => { setLoggingOut(true); await supabase.auth.signOut(); navigate('/login', { replace: true }) }
  return <main className="dashboard-preview"><motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}><span className="dashboard-mark">DRISHTI AI</span><div className="dashboard-icon"><Sparkles size={24} /></div><p className="dashboard-eyebrow">DASHBOARD PREVIEW</p><h1>Welcome, <em>{name}</em></h1><p>Your Drishti AI dashboard is being prepared. This is a temporary preview—the full experience will be available soon.</p><button onClick={logout} disabled={loggingOut}>{loggingOut ? 'Logging out…' : <><LogOut size={17} /> Logout</>}</button></motion.section></main>
}
