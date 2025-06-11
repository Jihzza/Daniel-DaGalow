// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient' // adjust path if needed

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
    // console.log("AuthContext: Setting up listeners and fetching session.");
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // console.log('AuthContext: onAuthStateChange EVENT:', event, 'SESSION:', session);
        if (event === 'SIGNED_IN') {
          // console.log('AuthContext: User signed in via onAuthStateChange:', session?.user);
        }
        if (event === 'USER_UPDATED') {
          // console.log('AuthContext: User updated via onAuthStateChange:', session?.user);
        }
        if (event === 'SIGNED_OUT') {
          // console.log('AuthContext: User signed out via onAuthStateChange');
        }
        if (event === 'INITIAL_SESSION') {
          // console.log('AuthContext: Initial session event via onAuthStateChange.', session);
        }
        setUser(session?.user ?? null);
        setLoading(false); // setLoading should be false once an event is processed
      }
    );

    // Initial session fetch
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        // console.log('AuthContext: getSession RESPONSE:', session);
        // Only set user and loading state if onAuthStateChange hasn't already done so
        // This helps prevent unnecessary re-renders if onAuthStateChange (e.g. INITIAL_SESSION) fires first.
        if (loading) { // Check if loading is still true
           setUser(session?.user ?? null);
           setLoading(false);
        }
      })
      .catch(err => {
        // console.error('AuthContext: Error getting session:', err);
        if (loading) { // Check if loading is still true
            setUser(null);
            setLoading(false);
        }
      });

    return () => {
      // console.log("AuthContext: Unsubscribing auth listener.");
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount and cleans up on unmount.

  // 3) Auth helpers
  const signUp = (email, password, options = {}) =>
    supabase.auth.signUp({ email, password, options })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () =>
    supabase.auth.signOut()

  const resetPassword = (email, options = {}) => // Added options parameter
    supabase.auth.resetPasswordForEmail(email, {
      // Use options.redirectTo if provided, otherwise default
      redirectTo: options.redirectTo || `${window.location.origin}/reset-password`,
      ...options // Spread any other options
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
      {/* Consider rendering children only when not loading initial auth state, 
          or handle loading state within child components (like PrivateRoute does) */}
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