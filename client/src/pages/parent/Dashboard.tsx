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

      const rawStudents = studentsRes.data.data;
      const rawBookings = bookingsRes.data.data;
      const studentData = Array.isArray(rawStudents) ? rawStudents : (rawStudents?.students || []);
      const bookingData = Array.isArray(rawBookings) ? rawBookings : (rawBookings?.bookings || []);

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
      <div className="flex items-center justify-center h-[300px]">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const notifications = [
    { emoji: '📍', bg: 'bg-blue-50', title: 'Pickup Completed', time: '10m ago', desc: `${user?.first_name || 'Sarah'} Miller was picked up at 07:45 AM from Stop 4.` },
    { emoji: '💳', bg: 'bg-amber-50', title: 'Payment Reminder', time: '2h ago', desc: 'Next monthly subscription payment is due in 3 days.', link: 'Pay Now' },
    { emoji: '✅', bg: 'bg-green-50', title: 'Route Update', time: 'Yesterday', desc: 'A new stop has been added to Route A-12 near your location.' },
    { emoji: '🔵', bg: 'bg-blue-50', title: 'System Update', time: '2 days ago', desc: 'New dashboard features are now live. Check the guide.' },
  ];

  const cardClass = 'bg-white rounded-xl border border-border shadow-sm';

  return (
    <div className="flex flex-col gap-6">

      {/* ───── Stat Cards ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${cardClass} p-5 flex items-center gap-4`}>
          <div className="w-11 h-11 rounded-[10px] bg-blue-50 flex items-center justify-center">
            <Users className="w-[22px] h-[22px] text-primary" />
          </div>
          <div>
            <div className="text-[13px] text-slate-500 mb-0.5">Registered Students</div>
            <div className="text-[28px] font-bold text-slate-800">{stats.totalStudents}</div>
          </div>
        </div>

        <div className={`${cardClass} p-5 flex items-center gap-4`}>
          <div className="w-11 h-11 rounded-[10px] bg-green-100 flex items-center justify-center">
            <MapPin className="w-[22px] h-[22px] text-emerald-500" />
          </div>
          <div>
            <div className="text-[13px] text-slate-500 mb-0.5">Active Routes</div>
            <div className="text-[28px] font-bold text-slate-800">{stats.activeRoutes}</div>
          </div>
        </div>

        <div className={`${cardClass} p-5 flex items-center gap-4 ${stats.paymentStatus === 'Paid' ? 'bg-amber-50' : ''}`}>
          <div className="w-11 h-11 rounded-[10px] bg-amber-100 flex items-center justify-center">
            <CreditCard className="w-[22px] h-[22px] text-amber-500" />
          </div>
          <div>
            <div className="text-[13px] text-slate-500 mb-0.5">Payment Status</div>
            <div className="text-[28px] font-bold text-slate-800">{stats.paymentStatus}</div>
          </div>
        </div>
      </div>

      {/* ───── Two-Column Layout ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Quick Actions */}
          <div className={`${cardClass} p-6`}>
            <h3 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="flex gap-3">
              <Link to="/students" state={{ openAddModal: true }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold no-underline hover:bg-emerald-600 transition-colors">
                <Plus className="w-4 h-4" /> Add Student
              </Link>
              <Link to="/book-transport" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-800 rounded-lg text-sm font-semibold border border-border no-underline hover:bg-gray-50 transition-colors">
                <Bus className="w-4 h-4" /> Book Transport
              </Link>
            </div>
          </div>

          {/* Live Trip Tracking */}
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-slate-800 m-0">Live Trip Tracking</h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-green-100 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                In Transit
              </span>
            </div>
            <p className="text-[13px] text-slate-500 mb-4">Route A-12 • Afternoon Drop-off</p>

            <div className="bg-slate-100 rounded-xl h-[220px] flex flex-col items-center justify-center border border-border relative">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2 shadow-md shadow-primary/30">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 shadow-sm border border-border">
                ETA: 12 mins
              </div>
            </div>

            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-[13px]">
                <User className="w-4 h-4" />
                <span>Driver: <strong className="text-slate-800">John Thompson</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-primary text-[13px] font-medium cursor-pointer hover:underline">
                <Phone className="w-3.5 h-3.5" />
                Contact Driver
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN – Notifications */}
        <div className={`${cardClass} p-6 flex flex-col`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-800 m-0">Notifications</h3>
            <span className="text-[13px] text-primary font-medium cursor-pointer hover:underline">Mark all read</span>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {notifications.map((n, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-8 h-8 rounded-full ${n.bg} flex items-center justify-center text-sm shrink-0 mt-0.5`}>
                  {n.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[13px] font-semibold text-slate-800">{n.title}</span>
                    <span className="text-[11px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">{n.desc}</p>
                  {n.link && (
                    <a href="#" className="text-xs text-primary font-semibold no-underline inline-flex items-center gap-0.5 mt-1 hover:underline">
                      {n.link} <ChevronRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4 border-t border-slate-100 mt-4">
            <a href="#" className="text-[13px] text-primary font-medium no-underline hover:underline">
              View All Notifications
            </a>
          </div>
        </div>
      </div>

      {/* ───── Your Students ───── */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Your Students</h3>
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
          {students.length > 0 ? students.map((student) => (
            <div key={student.id} className={`${cardClass} p-5 flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shrink-0 bg-blue-100 text-primary">
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-slate-800">{student.first_name} {student.last_name}</span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Grade {student.grade}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-[13px] h-[13px]" /> {student.school_name || 'Route A-12'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-emerald-500 font-medium">Active</span>
                  </span>
                </div>
              </div>
              <button className="p-1 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600">
                <MoreVertical className="w-[18px] h-[18px]" />
              </button>
            </div>
          )) : (
            <div className={`${cardClass} p-8 text-center col-span-full`}>
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No students registered yet.</p>
              <Link to="/students" state={{ openAddModal: true }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold no-underline hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Add Your First Student
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
