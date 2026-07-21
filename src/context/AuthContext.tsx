import { createContext, useContext, useState, type ReactNode } from 'react'
import type { LoginResult } from '../services/kakaoAuth'

interface AuthState {
  token: string | null
  role: string | null
  userId: string | null
  login: (result: LoginResult) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function loadStored() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const userId = localStorage.getItem('userId')
  return token && role && userId ? { token, role, userId } : { token: null, role: null, userId: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadStored)

  function login(result: LoginResult) {
    localStorage.setItem('token', result.accessToken)
    localStorage.setItem('role', result.role)
    localStorage.setItem('userId', String(result.userId))
    setState({ token: result.accessToken, role: result.role, userId: String(result.userId) })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    setState({ token: null, role: null, userId: null })
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
