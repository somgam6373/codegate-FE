import { createContext, useContext, useState, type ReactNode } from 'react'
import type { LoginResult } from '../services/kakaoAuth'

interface AuthState {
  token: string | null
  role: string | null
  userId: string | null
  name: string | null
  login: (result: LoginResult, name?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function loadStored() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const userId = localStorage.getItem('userId')
  const name = localStorage.getItem('name')
  return token && role && userId
    ? { token, role, userId, name }
    : { token: null, role: null, userId: null, name: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadStored)

  function login(result: LoginResult, name?: string) {
    localStorage.setItem('token', result.accessToken)
    localStorage.setItem('role', result.role)
    localStorage.setItem('userId', String(result.userId))
    if (name) localStorage.setItem('name', name)
    setState({
      token: result.accessToken,
      role: result.role,
      userId: String(result.userId),
      name: name ?? localStorage.getItem('name'),
    })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('name')
    setState({ token: null, role: null, userId: null, name: null })
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
