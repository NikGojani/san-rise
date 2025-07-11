"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { type UserRole } from '@/lib/auth-helpers'
import { type AppUser } from '@/lib/supabase'

interface AuthContextType {
  user: AppUser | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  hasPermission: (permission: 'edit_employees' | 'edit_contracts' | 'view_all') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  const hasPermission = (permission: 'edit_employees' | 'edit_contracts' | 'view_all'): boolean => {
    if (!user) return false
    
    // Admins haben alle Berechtigungen
    if (user.role === 'admin') return true
    
    // Team-Mitglieder können alles ansehen, aber nicht Mitarbeiter und Verträge bearbeiten
    switch (permission) {
      case 'view_all':
        return true
      case 'edit_employees':
      case 'edit_contracts':
        return false
      default:
        return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
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