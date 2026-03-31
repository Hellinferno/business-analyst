'use client'

import { useState, useEffect, useCallback } from 'react'
import { auth } from '@/lib/api'
import type { User, AuthTokens } from '@/types/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    setState(prev => ({
      ...prev,
      isAuthenticated: !!token,
      isLoading: false,
    }))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthTokens> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const tokens = await auth.login(email, password) as AuthTokens
      setState(prev => ({ ...prev, isAuthenticated: true, isLoading: false }))
      return tokens
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setState(prev => ({ ...prev, isLoading: false, error: message }))
      throw err
    }
  }, [])

  const register = useCallback(
    async (email: string, username: string, password: string, fullName?: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      try {
        const result = await auth.register(email, username, password, fullName)
        setState(prev => ({ ...prev, isLoading: false }))
        return result
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed'
        setState(prev => ({ ...prev, isLoading: false, error: message }))
        throw err
      }
    },
    []
  )

  const logout = useCallback(() => {
    auth.logout()
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    login,
    register,
    logout,
  }
}
