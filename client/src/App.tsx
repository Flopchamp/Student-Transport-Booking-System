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

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';
import StudentManagement from './pages/parent/StudentManagement';
import BookTransport from './pages/parent/BookTransport';
import NewBooking from './pages/parent/NewBooking';
import MyBookings from './pages/parent/MyBookings';
import PaymentPage from './pages/parent/PaymentPage';
import PaymentHistory from './pages/parent/PaymentHistory';
import ProfilePage from './pages/parent/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import RouteManagement from './pages/admin/RouteManagement';
import VehicleFleet from './pages/admin/VehicleFleet';
import DriverManagement from './pages/admin/DriverManagement';
import DriverProfile from './pages/admin/DriverProfile';
import AdminBookings from './pages/admin/BookingManagement';
import AdminPayments from './pages/admin/PaymentManagement';

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
        <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/routes" element={<RouteManagement />} />
        <Route path="/admin/vehicles" element={<VehicleFleet />} />
        <Route path="/admin/drivers" element={<DriverManagement />} />
        <Route path="/admin/drivers/:id" element={<DriverProfile />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
