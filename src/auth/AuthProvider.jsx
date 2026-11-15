import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabaseClient } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseClient) {
      setLoading(false)
      return undefined
    }

    let active = true
    supabaseClient.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setLoading(false)
      }
    })

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    loading,
    configured: Boolean(supabaseClient),
    signIn: async (email, password) => {
      if (!supabaseClient) throw new Error('Authentication is not configured.')
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signOut: async () => {
      if (supabaseClient) await supabaseClient.auth.signOut()
    }
  }), [loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
