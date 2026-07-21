import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/patient/LoginPage'
import RegisterPage from './pages/patient/RegisterPage'
import InformationPage from './pages/patient/InformationPage'
import KakaoCallbackPage from './pages/patient/KakaoCallbackPage'
import HomePage from './pages/patient/HomePage'
import ReservationPage from './pages/patient/ReservationPage'
import ReservationDetailPage from './pages/patient/ReservationDetailPage'
import RecordPage from './pages/patient/RecordPage'
import AiReportPage from './pages/patient/AiReportPage'
import ProfilePage from './pages/patient/ProfilePage'
import HospitalLoginPage from './pages/auth/LoginPage'
import HospitalSignupPage from './pages/hospital/SignupPage'
import HospitalLayout from './pages/hospital/HospitalLayout'
import DashboardPage from './pages/hospital/DashboardPage'
import ReservationsPage from './pages/hospital/ReservationsPage'
import PatientsPage from './pages/hospital/PatientsPage'
import SlotsPage from './pages/hospital/SlotsPage'
import SettingsPage from './pages/hospital/SettingsPage'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/kakao/callback" element={<KakaoCallbackPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/health" element={<InformationPage />} />
      <Route element={<ProtectedRoute role="PATIENT" />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/reservation/:id" element={<ReservationDetailPage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/record/analysis/:id" element={<AiReportPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/hospital/login" element={<HospitalLoginPage />} />
      <Route path="/hospital/1" element={<HospitalSignupPage />} />
      <Route element={<ProtectedRoute role="HOSPITAL" redirectTo="/hospital/login" />}>
        <Route element={<HospitalLayout />}>
          <Route path="/hospital/dashboard" element={<DashboardPage />} />
          <Route path="/hospital/reservations" element={<ReservationsPage />} />
          <Route path="/hospital/patients" element={<PatientsPage />} />
          <Route path="/hospital/slots" element={<SlotsPage />} />
          <Route path="/hospital/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
