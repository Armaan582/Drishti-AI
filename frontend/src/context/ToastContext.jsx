import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react'
import '../styles/toast.css'

const ToastContext = createContext(null)
const defaults = { success: 3000, info: 3000, warning: 4000, error: 5000 }
const icons = { success: CheckCircle2, info: Info, warning: TriangleAlert, error: CircleAlert }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); const timers = useRef(new Map())
  const dismissToast = useCallback(id => { window.clearTimeout(timers.current.get(id)); timers.current.delete(id); setToasts(current => current.filter(toast => toast.id !== id)) }, [])
  const showToast = useCallback(({ type = 'info', title, message, duration }) => { const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`; const toast = { id, type, title: title || type, message }; setToasts(current => [toast, ...current.filter(item => !(item.type === type && item.message === message))].slice(0, 4)); timers.current.set(id, window.setTimeout(() => dismissToast(id), duration ?? defaults[type] ?? defaults.info)); return id }, [dismissToast])
  useEffect(() => () => { timers.current.forEach(timer => window.clearTimeout(timer)); timers.current.clear() }, [])
  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast])
  return <ToastContext.Provider value={value}>{children}<section className="toast-region" aria-live="polite" aria-relevant="additions"> <AnimatePresence initial={false}>{toasts.map(toast => { const Icon = icons[toast.type] || Info; return <motion.article key={toast.id} className={`toast ${toast.type}`} role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 28 }} transition={{ duration: .22 }}><Icon size={20} /><div><strong>{toast.title}</strong>{toast.message && <span>{toast.message}</span>}</div><button aria-label="Dismiss notification" onClick={() => dismissToast(toast.id)}><X size={16} /></button></motion.article> })}</AnimatePresence></section></ToastContext.Provider>
}

export function useToast() { const context = useContext(ToastContext); if (!context) throw new Error('useToast must be used within ToastProvider'); return context }
