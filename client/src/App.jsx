import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OTPPage from './pages/auth/OTPPage';
import DashboardPage from './pages/DashboardPage';
import MyRescuesPage from './pages/dashboard/MyRescuesPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import RescueReportPage from './pages/rescue/RescueReportPage';
import CaseTrackingPage from './pages/rescue/CaseTrackingPage';
import RescueListPage from './pages/rescue/RescueListPage';
import ComingSoonPage from './pages/ComingSoonPage';
import NotFoundPage from './pages/NotFoundPage';

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

          {/* Rescue */}
          <Route path="/rescue" element={<RescueListPage />} />
          <Route path="/rescue/report" element={<RescueReportPage />} />
          <Route path="/rescue/:id" element={<CaseTrackingPage />} />

          {/* Coming soon — public */}
          <Route path="/adopt" element={
            <ComingSoonPage title="Adopt a Pet"
              description="Browse animals looking for a forever home. This section opens soon." />
          } />
          <Route path="/lost-found" element={
            <ComingSoonPage title="Lost & Found"
              description="Report a lost pet or help reunite a found one. Launching soon." />
          } />
          <Route path="/volunteer" element={
            <ComingSoonPage title="Volunteer Opportunities"
              description="Find rescue drives, shelter shifts and awareness campaigns near you." />
          } />
          <Route path="/donate" element={
            <ComingSoonPage title="Support a Campaign"
              description="Fund rescue operations and NGO campaigns across Nepal." />
          } />
          <Route path="/community" element={
            <ComingSoonPage title="Community"
              description="Share rescue stories, updates and connect with other animal lovers." />
          } />
          <Route path="/emergency" element={
            <ComingSoonPage title="Emergency Contacts"
              description="Quick access to vets and rescue NGOs. For now, report a rescue to get help." />
          } />
          <Route path="/about" element={
            <ComingSoonPage title="About PaluwaSathi"
              description="Learn about our mission and animal welfare guides." />
          } />
          <Route path="/events" element={
            <ComingSoonPage title="Events & News"
              description="Upcoming adoption fairs, rescue drives and awareness events." />
          } />
          <Route path="/forgot-password" element={
            <ComingSoonPage title="Reset Password"
              description="Password reset via email is coming soon." />
          } />

          {/* Protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/rescues" element={<MyRescuesPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />

            <Route path="/dashboard/saved-pets" element={
              <ComingSoonPage title="Saved Pets"
                description="Pets you've saved will appear here once adoption launches." />
            } />
            <Route path="/dashboard/donations" element={
              <ComingSoonPage title="Donation History"
                description="Your donations and receipts will appear here." />
            } />
            <Route path="/dashboard/volunteer" element={
              <ComingSoonPage title="My Volunteer Tasks"
                description="Tasks you sign up for will appear here." />
            } />
            <Route path="/dashboard/events" element={
              <ComingSoonPage title="My Events"
                description="Events you're attending will appear here." />
            } />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;