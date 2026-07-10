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
import DonationsPage from './pages/dashboard/DonationsPage';
import CampaignsPage from './pages/dashboard/CampaignsPage';
import VolunteerTasksPage from './pages/dashboard/VolunteerTasksPage';
import NgoTasksPage from './pages/dashboard/NgoTasksPage';
import MyLostFoundPage from './pages/dashboard/MyLostFoundPage';
import MyPostsPage from './pages/dashboard/MyPostsPage';
import MyEventsPage from './pages/dashboard/MyEventsPage';
import NgoEventsPage from './pages/dashboard/NgoEventsPage';

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

import VolunteerListPage from './pages/volunteer/VolunteerListPage';
import TaskDetailPage from './pages/volunteer/TaskDetailPage';
import TaskSignupPage from './pages/volunteer/TaskSignupPage';
import SignupConfirmationPage from './pages/volunteer/SignupConfirmationPage';

import LostFoundListPage from './pages/lostfound/LostFoundListPage';
import ReportLostFoundPage from './pages/lostfound/ReportLostFoundPage';
import LostFoundDetailPage from './pages/lostfound/LostFoundDetailPage';

import CommunityPage from './pages/community/CommunityPage';
import PostDetailPage from './pages/community/PostDetailPage';
import CreatePostPage from './pages/community/CreatePostPage';

import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';
import EventRsvpPage from './pages/events/EventRsvpPage';
import EventTicketPage from './pages/events/EventTicketPage';

import EmergencyPage from './pages/EmergencyPage';
import AboutPage from './pages/AboutPage';

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

          <Route path="/volunteer" element={<VolunteerListPage />} />
          <Route path="/volunteer/:id" element={<TaskDetailPage />} />

          <Route path="/lost-found" element={<LostFoundListPage />} />
          <Route path="/lost-found/:id" element={<LostFoundDetailPage />} />

          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/:id" element={<PostDetailPage />} />

          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />

          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/forgot-password" element={
            <ComingSoonPage title="Reset Password"
              description="Password reset via email is coming soon." />
          } />

          <Route element={<PrivateRoute />}>
            <Route path="/adopt/:id/apply" element={<AdoptionFormPage />} />
            <Route path="/adopt/application/:id" element={<ApplicationSubmittedPage />} />

            <Route path="/donate/payment/:id" element={<PaymentPage />} />
            <Route path="/donate/receipt/:id" element={<ReceiptPage />} />

            <Route path="/volunteer/:id/signup" element={<TaskSignupPage />} />
            <Route path="/volunteer/confirmation/:id" element={<SignupConfirmationPage />} />

            <Route path="/lost-found/report" element={<ReportLostFoundPage />} />

            <Route path="/community/new" element={<CreatePostPage />} />

            <Route path="/events/:id/rsvp" element={<EventRsvpPage />} />
            <Route path="/events/ticket/:id" element={<EventTicketPage />} />

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/rescues" element={<MyRescuesPage />} />
            <Route path="/dashboard/saved-pets" element={<SavedPetsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/applications" element={<ApplicationsPage />} />
            <Route path="/dashboard/my-pets" element={<MyPetsPage />} />
            <Route path="/dashboard/my-pets/new" element={<ListPetPage />} />
            <Route path="/dashboard/donations" element={<DonationsPage />} />
            <Route path="/dashboard/campaigns" element={<CampaignsPage />} />
            <Route path="/dashboard/volunteer" element={<VolunteerTasksPage />} />
            <Route path="/dashboard/tasks" element={<NgoTasksPage />} />
            <Route path="/dashboard/lost-found" element={<MyLostFoundPage />} />
            <Route path="/dashboard/community" element={<MyPostsPage />} />
            <Route path="/dashboard/events" element={<MyEventsPage />} />
            <Route path="/dashboard/ngo-events" element={<NgoEventsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;