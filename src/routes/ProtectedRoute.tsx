import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  role?: string
  redirectTo?: string
}

function ProtectedRoute({ role, redirectTo = '/login' }: ProtectedRouteProps) {
  const { token, role: currentRole } = useAuth()
  const authorized = token && (!role || currentRole === role)
  return authorized ? <Outlet /> : <Navigate to={redirectTo} replace />
}

export default ProtectedRoute
