import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import {
  Users,
  MapPin,
  CreditCard,
  Plus,
  Bus,
  Phone,
  User,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import type { Student, Booking } from '../../types';

interface DashboardStats {
  totalStudents: number;
  activeRoutes: number;
  paymentStatus: string;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeRoutes: 0,
    paymentStatus: 'Paid',
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, bookingsRes] = await Promise.all([
        api.get('/students').catch(() => ({ data: { data: [] } })),
        api.get('/bookings').catch(() => ({ data: { data: [] } })),
      ]);

      const studentData = studentsRes.data.data || [];
      const bookingData = bookingsRes.data.data || [];

      setStudents(studentData);
      setRecentBookings(bookingData.slice(0, 5));

      const activeRouteCount = new Set(
        bookingData.filter((b: Booking) => b.status === 'confirmed').map((b: Booking) => b.route_id)
      ).size;
      const hasPending = bookingData.some((b: Booking) => b.status === 'pending');

      setStats({
        totalStudents: studentData.length,
        activeRoutes: activeRouteCount || 1,
        paymentStatus: hasPending ? 'Pending' : 'Paid',
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const notifications = [
    { emoji: '📍', bg: '#eff6ff', title: 'Pickup Completed', time: '10m ago', desc: `${user?.first_name || 'Sarah'} Miller was picked up at 07:45 AM from Stop 4.` },
    { emoji: '💳', bg: '#fef3c7', title: 'Payment Reminder', time: '2h ago', desc: 'Next monthly subscription payment is due in 3 days.', link: 'Pay Now' },
    { emoji: '✅', bg: '#d1fae5', title: 'Route Update', time: 'Yesterday', desc: 'A new stop has been added to Route A-12 near your location.' },
    { emoji: '🔵', bg: '#eff6ff', title: 'System Update', time: '2 days ago', desc: 'New dashboard features are now live. Check the guide.' },
  ];

  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ───── Stat Cards ───── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {/* Registered Students */}
        <div style={{ ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users style={{ width: 22, height: 22, color: '#137fec' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Registered Students</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{stats.totalStudents}</div>
          </div>
        </div>

        {/* Active Routes */}
        <div style={{ ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin style={{ width: 22, height: 22, color: '#10b981' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Active Routes</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{stats.activeRoutes}</div>
          </div>
        </div>

        {/* Payment Status */}
        <div style={{ ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: stats.paymentStatus === 'Paid' ? '#fffbeb' : '#fff' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard style={{ width: 22, height: 22, color: '#f59e0b' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Payment Status</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{stats.paymentStatus}</div>
          </div>
        </div>
      </div>

      {/* ───── Two-Column Layout ───── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Quick Actions */}
          <div style={{ ...card, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: '0 0 16px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/students" state={{ openAddModal: true }} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                background: '#10b981', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600,
                textDecoration: 'none',
              }}>
                <Plus style={{ width: 16, height: 16 }} /> Add Student
              </Link>
              <Link to="/book-transport" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                background: '#fff', color: '#1e293b', borderRadius: 8, fontSize: 14, fontWeight: 600,
                border: '1px solid #e2e8f0', textDecoration: 'none',
              }}>
                <Bus style={{ width: 16, height: 16 }} /> Book Transport
              </Link>
            </div>
          </div>

          {/* Live Trip Tracking */}
          <div style={{ ...card, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>Live Trip Tracking</h3>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500,
                color: '#10b981', background: '#d1fae5', padding: '4px 10px', borderRadius: 20,
              }}>
                <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                In Transit
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>Route A-12 • Afternoon Drop-off</p>

            {/* Map Placeholder */}
            <div style={{
              background: '#f1f5f9', borderRadius: 12, height: 220, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', position: 'relative',
            }}>
              <div style={{
                width: 48, height: 48, background: '#137fec', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                boxShadow: '0 2px 8px rgba(19,127,236,0.3)',
              }}>
                <Bus style={{ width: 24, height: 24, color: '#fff' }} />
              </div>
              <div style={{
                background: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                color: '#1e293b', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
              }}>
                ETA: 12 mins
              </div>
            </div>

            {/* Driver Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
                <User style={{ width: 16, height: 16 }} />
                <span>Driver: <strong style={{ color: '#1e293b' }}>John Thompson</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#137fec', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                <Phone style={{ width: 14, height: 14 }} />
                Contact Driver
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN – Notifications */}
        <div style={{ ...card, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>Notifications</h3>
            <span style={{ fontSize: 13, color: '#137fec', fontWeight: 500, cursor: 'pointer' }}>Mark all read</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            {notifications.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: n.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0, marginTop: 2,
                }}>
                  {n.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{n.title}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{n.desc}</p>
                  {n.link && (
                    <a href="#" style={{ fontSize: 12, color: '#137fec', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2, marginTop: 4 }}>
                      {n.link} <ChevronRight style={{ width: 12, height: 12 }} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid #f1f5f9', marginTop: 16 }}>
            <a href="#" style={{ fontSize: 13, color: '#137fec', fontWeight: 500, textDecoration: 'none' }}>
              View All Notifications
            </a>
          </div>
        </div>
      </div>

      {/* ───── Your Students ───── */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>Your Students</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {students.length > 0 ? students.map((student) => (
            <div key={student.id} style={{ ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0,
                background: '#dbeafe', color: '#137fec',
              }}>
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
                    {student.first_name} {student.last_name}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Grade {student.grade}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 12, color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin style={{ width: 13, height: 13 }} /> Route A-12
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    <span style={{ color: '#10b981', fontWeight: 500 }}>Confirmed</span>
                  </span>
                </div>
              </div>
              <button style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <MoreVertical style={{ width: 18, height: 18 }} />
              </button>
            </div>
          )) : (
            <>
              <div style={{ ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#137fec', flexShrink: 0 }}>SM</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>Sarah Miller</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Grade 4</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 12, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin style={{ width: 13, height: 13 }} /> Route A-12</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      <span style={{ color: '#10b981', fontWeight: 500 }}>Confirmed</span>
                    </span>
                  </div>
                </div>
                <button style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><MoreVertical style={{ width: 18, height: 18 }} /></button>
              </div>
              <div style={{ ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#f59e0b', flexShrink: 0 }}>LM</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>Leo Miller</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Grade 1</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 12, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin style={{ width: 13, height: 13 }} /> Route B-05</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Booking Pending</span>
                    </span>
                  </div>
                </div>
                <button style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><MoreVertical style={{ width: 18, height: 18 }} /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
