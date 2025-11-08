"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  user: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<string | null>(null)

  useEffect(() => {
    // Check login status on mount
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const username = localStorage.getItem('adminUser')
    
    setIsLoggedIn(loggedIn)
    setUser(username)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Hardcoded credentials
    const ADMIN_USERNAME = "admin"
    const ADMIN_PASSWORD = "pojokcitayam123"

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('adminUser', username)
      setIsLoggedIn(true)
      setUser(username)
      return true
    }
    
    return false
  }

  const logout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('adminUser')
    setIsLoggedIn(false)
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}