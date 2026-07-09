import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OTPPage from './pages/auth/OTPPage';
import DashboardPage from './pages/DashboardPage';
import RescueReportPage from './pages/rescue/RescueReportPage';
import CaseTrackingPage from './pages/rescue/CaseTrackingPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<OTPPage />} />
          <Route path="/rescue/report" element={<RescueReportPage />} />
          <Route path="/rescue/:id" element={<CaseTrackingPage />} />

          {/* Protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;