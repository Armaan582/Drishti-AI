import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

async function loadProfile(user) {
  if (!supabase || !user) return null
  const { data } = await supabase.from('profiles').select('id, full_name, email, phone').eq('id', user.id).maybeSingle()
  return data
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return undefined }
    let active = true
    const setAuthState = async (nextSession) => {
      if (!active) return
      setSession(nextSession)
      setProfile(nextSession?.user ? await loadProfile(nextSession.user) : null)
      if (active) setLoading(false)
    }
    supabase.auth.getSession().then(({ data }) => setAuthState(data.session)).catch(() => active && setLoading(false))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => { setAuthState(nextSession) })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  const value = useMemo(() => ({ session, user: session?.user ?? null, profile, loading, refreshProfile: () => session?.user && loadProfile(session.user).then(setProfile) }), [session, profile, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
