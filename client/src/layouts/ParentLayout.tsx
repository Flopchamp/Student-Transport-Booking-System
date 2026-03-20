import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Bus,
  LayoutDashboard,
  Users,
  BookOpen,
  Route as RouteIcon,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
} from 'lucide-react';

const mainNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Students', icon: Users, path: '/students' },
  { label: 'Bookings', icon: BookOpen, path: '/my-bookings' },
  { label: 'Routes', icon: RouteIcon, path: '/book-transport' },
  { label: 'Payments', icon: CreditCard, path: '/payment' },
];

const accountNav = [
  { label: 'Settings', icon: Settings, path: '#settings' },
];

export default function ParentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#137fec' : '#64748b',
    background: isActive ? '#eff6ff' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.15s',
    cursor: 'pointer',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          className="lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}
        style={{
          width: 240,
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#137fec', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bus style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>EduTrans</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.2 }}>Portal</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{ padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <X style={{ width: 20, height: 20, color: '#64748b' }} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {mainNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => linkStyle(isActive)}
              >
                <item.icon style={{ width: 20, height: 20 }} />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Account Section */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 12px' }}>
              Account
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {accountNav.map((item) => (
                <a
                  key={item.label}
                  href={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#64748b',
                    textDecoration: 'none',
                  }}
                >
                  <item.icon style={{ width: 20, height: 20 }} />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* User Card */}
        <div style={{ padding: 12, borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User style={{ width: 18, height: 18, color: '#f59e0b' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Parent Account</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              marginTop: 4,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: '#ef4444',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut style={{ width: 18, height: 18 }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="sidebar-offset">
        {/* Top Bar */}
        <header style={{
          height: 64,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <Menu style={{ width: 20, height: 20, color: '#64748b' }} />
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Dashboard Overview</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search */}
            <div style={{ position: 'relative' }} className="hidden md:block">
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
              <input
                placeholder="Search activities..."
                style={{
                  width: 220,
                  height: 38,
                  paddingLeft: 36,
                  paddingRight: 12,
                  fontSize: 13,
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  background: '#f8fafc',
                  outline: 'none',
                  color: '#1e293b',
                }}
              />
            </div>

            {/* Notification Bell */}
            <button style={{
              position: 'relative',
              width: 38,
              height: 38,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Bell style={{ width: 18, height: 18, color: '#64748b' }} />
              <span style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                background: '#ef4444',
                borderRadius: '50%',
                border: '2px solid #fff',
              }} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
