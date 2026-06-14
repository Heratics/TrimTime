import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [token, setToken]             = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading]         = useState(true)   // true until startup check finishes

  // ── Startup: restore session from localStorage ──────────────────────────
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('token')
      const storedUser  = (() => {
        try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
      })()

      if (!storedToken) {
        setLoading(false)
        return
      }

      // Optimistically set state from localStorage so UI is instant
      setToken(storedToken)
      setUser(storedUser)
      setIsAuthenticated(true)

      // Then validate the token against the server
      try {
        const res = await api.get('/auth/me')
        const freshUser = res.data.user
        setUser(freshUser)
        localStorage.setItem('user', JSON.stringify(freshUser))
      } catch {
        // Token is invalid or expired — clear everything
        _clearAuth()
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  // ── Internal helper ──────────────────────────────────────────────────────
  function _clearAuth() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  // ── login() — called by Login.jsx after successful POST /auth/login ──────
  const login = useCallback((userData, jwtToken) => {
    localStorage.setItem('token', jwtToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(jwtToken)
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  // ── logout() — clears state and storage ─────────────────────────────────
  const logout = useCallback(() => {
    _clearAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}