import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OTPPage from './pages/auth/OTPPage';

import DashboardPage from './pages/DashboardPage';
import MyRescuesPage from './pages/dashboard/MyRescuesPage';
import SavedPetsPage from './pages/dashboard/SavedPetsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import ApplicationsPage from './pages/dashboard/ApplicationsPage';
import MyPetsPage from './pages/dashboard/MyPetsPage';
import ListPetPage from './pages/dashboard/ListPetPage';
import DonationsPage from './pages/dashboard/DonationPage';
import CampaignsPage from './pages/dashboard/CampaignsPage';
import RescueReportPage from './pages/rescue/RescueReportPage';
import CaseTrackingPage from './pages/rescue/CaseTrackingPage';
import RescueListPage from './pages/rescue/RescueListPage';
import AdoptionGalleryPage from './pages/adoption/AdoptionGalleryPage';
import PetDetailPage from './pages/adoption/PetDetailPage';
import AdoptionFormPage from './pages/adoption/AdoptionFormPage';
import ApplicationSubmittedPage from './pages/adoption/ApplicationSubmittedPage';
import DonatePage from './pages/donate/DonatePage';
import CampaignDetailPage from './pages/donate/CampaignDetailPage';
import NgoProfilePage from './pages/donate/NgoProfilePage';
import PaymentPage from './pages/donate/PaymentPage';
import ReceiptPage from './pages/donate/ReceiptPage';
import ComingSoonPage from './pages/ComingSoonPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<OTPPage />} />

          <Route path="/rescue" element={<RescueListPage />} />
          <Route path="/rescue/report" element={<RescueReportPage />} />
          <Route path="/rescue/:id" element={<CaseTrackingPage />} />

          <Route path="/adopt" element={<AdoptionGalleryPage />} />
          <Route path="/adopt/:id" element={<PetDetailPage />} />

          <Route path="/donate" element={<DonatePage />} />
          <Route path="/donate/campaign/:id" element={<CampaignDetailPage />} />
          <Route path="/donate/ngo/:id" element={<NgoProfilePage />} />

          <Route path="/lost-found" element={
            <ComingSoonPage title="Lost & Found"
              description="Report a lost pet or help reunite a found one. Launching soon." />
          } />
          <Route path="/volunteer" element={
            <ComingSoonPage title="Volunteer Opportunities"
              description="Find rescue drives, shelter shifts and awareness campaigns near you." />
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

          <Route element={<PrivateRoute />}>
            <Route path="/adopt/:id/apply" element={<AdoptionFormPage />} />
            <Route path="/adopt/application/:id" element={<ApplicationSubmittedPage />} />

            <Route path="/donate/payment/:id" element={<PaymentPage />} />
            <Route path="/donate/receipt/:id" element={<ReceiptPage />} />

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/rescues" element={<MyRescuesPage />} />
            <Route path="/dashboard/saved-pets" element={<SavedPetsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/applications" element={<ApplicationsPage />} />
            <Route path="/dashboard/my-pets" element={<MyPetsPage />} />
            <Route path="/dashboard/my-pets/new" element={<ListPetPage />} />
            <Route path="/dashboard/donations" element={<DonationsPage />} />
            <Route path="/dashboard/campaigns" element={<CampaignsPage />} />

            <Route path="/dashboard/lost-found" element={
              <ComingSoonPage title="My Lost & Found Reports"
                description="Pets you've reported lost or found will appear here." />
            } />
            <Route path="/dashboard/volunteer" element={
              <ComingSoonPage title="My Volunteer Tasks"
                description="Tasks you sign up for will appear here." />
            } />
            <Route path="/dashboard/events" element={
              <ComingSoonPage title="My Events"
                description="Events you're attending will appear here." />
            } />
            <Route path="/dashboard/community" element={
              <ComingSoonPage title="My Posts"
                description="Stories and updates you've shared will appear here." />
            } />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;