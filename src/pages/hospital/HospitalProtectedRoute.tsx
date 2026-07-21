import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function HospitalProtectedRoute() {
  const { token, role } = useAuth()
  if (!token || role !== 'HOSPITAL') {
    return <Navigate to="hospital/login" replace />
  }
  return <Outlet />
}

export default HospitalProtectedRoute