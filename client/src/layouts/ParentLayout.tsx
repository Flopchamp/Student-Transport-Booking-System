import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from '../components/NotificationBell';
import {
  Bus,
  LayoutDashboard,
  Users,
  BookOpen,
  Route as RouteIcon,
  CreditCard,
  MessageSquare,
  Megaphone,
  MapPin,
  LogOut,
  Menu,
  X,
  User,
  Settings,
} from 'lucide-react';

const mainNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Students', icon: Users, path: '/students' },
  { label: 'Bookings', icon: BookOpen, path: '/my-bookings' },
  { label: 'Routes', icon: RouteIcon, path: '/book-transport' },
  { label: 'Tracking', icon: MapPin, path: '/tracking' },
  { label: 'Payments', icon: CreditCard, path: '/payments' },
  { label: 'Complaints', icon: MessageSquare, path: '/complaints' },
  { label: 'Announcements', icon: Megaphone, path: '/announcements' },
  { label: 'Profile', icon: Settings, path: '/profile' },
];

export default function ParentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Dynamic page title based on current route
  const pageTitle = mainNav.find((item) => location.pathname === item.path)?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-60 bg-surface border-r border-border flex flex-col shrink-0 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-[10px] flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-text leading-tight">EduTrans</div>
              <div className="text-[11px] text-text-muted leading-tight">Portal</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md border-none bg-transparent cursor-pointer hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {mainNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm no-underline transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'font-semibold text-primary bg-blue-50'
                      : 'font-medium text-text-secondary hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-warning-light flex items-center justify-center shrink-0">
              <User className="w-4.5 h-4.5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-text truncate">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-[11px] text-text-muted">Parent Account</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-lg text-[13px] font-medium text-danger bg-transparent border-none cursor-pointer hover:bg-danger-light transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border-none bg-transparent cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-text-secondary" />
            </button>
            <h2 className="text-lg font-bold text-text m-0">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
