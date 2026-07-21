import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/patient/LoginPage'
import RegisterPage from './pages/patient/RegisterPage'
import InformationPage from './pages/patient/InformationPage'
import HomePage from './pages/patient/HomePage'
import ReservationPage from './pages/patient/ReservationPage'
import RecordPage from './pages/patient/RecordPage'
import AiReportPage from './pages/patient/AiReportPage'
import ProfilePage from './pages/patient/ProfilePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/health" element={<InformationPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/reservation" element={<ReservationPage />} />
      <Route path="/record" element={<RecordPage />} />
      <Route path="/record/analysis/:id" element={<AiReportPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  )
}

export default App
