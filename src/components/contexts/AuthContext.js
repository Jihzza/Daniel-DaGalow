// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../utils/supabaseClient' // adjust path if needed

// 1) Create context with sane defaults
const AuthContext = createContext({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  getProfile: async () => {},
})

// 2) Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Initial session fetch
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error getting session:', err)
        setUser(null)
        setLoading(false)
      })

    return () => subscription.unsubscribe()
  }, [])

  // 3) Auth helpers
  const signUp = (email, password, options = {}) =>
    supabase.auth.signUp({ email, password, options })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () =>
    supabase.auth.signOut()

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

  const updateProfile = (updates) =>
    supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date() })

  const getProfile = () =>
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    getProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 4) Hook to consume the context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return context
}
