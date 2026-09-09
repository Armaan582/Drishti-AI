import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import MobileMenu from './MobileMenu'
import { navigation } from '../../data/navigation'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  useEffect(() => { const close = e => e.key === 'Escape' && setOpen(false); addEventListener('keydown', close); return () => removeEventListener('keydown', close) }, [])
  return <motion.header className="navbar" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
    <Logo /><nav className="desktop-nav" aria-label="Main navigation">{navigation.map(({ label, href }, index) => <motion.a key={label} href={href} className={index === 0 ? 'active' : ''} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18 + index * .055 }}>{label}</motion.a>)}</nav>
    <div className="nav-actions"><Link to="/login" className="login-link">Login</Link><Link to="/login" className="button primary">Get Started <span>→</span></Link></div>
    <button className="icon-button menu-toggle" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button><MobileMenu open={open} onClose={() => setOpen(false)} />
  </motion.header>
}
