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
import ProtectedRoute from './routes/ProtectedRoute'
import SignupPage from "./pages/hospital/SignupPage.tsx";
import HospitalLoginPage from "./pages/hospital/HospitalLoginPage.tsx";
import JoinChoicePage from "./pages/hospital/JoinChoicePage.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<JoinChoicePage />} />
        <Route path="/hospitals/signup" element={<SignupPage />} />
        <Route path="/hospitals/login" element={<HospitalLoginPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/kakao/callback" element={<KakaoCallbackPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/health" element={<InformationPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/reservation/:id" element={<ReservationDetailPage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/record/analysis/:id" element={<AiReportPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App
