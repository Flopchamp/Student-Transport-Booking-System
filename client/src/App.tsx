import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import ParentLayout from './layouts/ParentLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';
import StudentManagement from './pages/parent/StudentManagement';
import BookTransport from './pages/parent/BookTransport';
import NewBooking from './pages/parent/NewBooking';
import MyBookings from './pages/parent/MyBookings';
import PaymentPage from './pages/parent/PaymentPage';
import PaymentHistory from './pages/parent/PaymentHistory';
import ProfilePage from './pages/parent/ProfilePage';
import ComplaintsPage from './pages/parent/ComplaintsPage';
import AnnouncementsPage from './pages/parent/AnnouncementsPage';
import TrackingPage from './pages/parent/TrackingPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import RouteManagement from './pages/admin/RouteManagement';
import VehicleFleet from './pages/admin/VehicleFleet';
import DriverManagement from './pages/admin/DriverManagement';
import DriverProfile from './pages/admin/DriverProfile';
import AdminBookings from './pages/admin/BookingManagement';
import AdminPayments from './pages/admin/PaymentManagement';
import UserManagement from './pages/admin/UserManagement';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import SettingsPage from './pages/admin/SettingsPage';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';
import FleetTrackingPage from './pages/admin/FleetTrackingPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Parent Routes */}
      <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
        <Route element={<ParentLayout />}>
        <Route path="/dashboard" element={<ParentDashboard />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/book-transport" element={<BookTransport />} />
        <Route path="/new-booking" element={<NewBooking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payments" element={<PaymentHistory />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/routes" element={<RouteManagement />} />
        <Route path="/admin/vehicles" element={<VehicleFleet />} />
        <Route path="/admin/drivers" element={<DriverManagement />} />
        <Route path="/admin/drivers/:id" element={<DriverProfile />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
        <Route path="/admin/complaints" element={<ComplaintManagement />} />
        <Route path="/admin/announcements" element={<AnnouncementManagement />} />
        <Route path="/admin/audit-log" element={<AuditLogPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/fleet-tracking" element={<FleetTrackingPage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
