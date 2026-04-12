import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import {
  Users,
  MapPin,
  CreditCard,
  Plus,
  Bus,
  Calendar,
} from 'lucide-react';
import type { Student, Booking } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';

interface DashboardStats {
  totalStudents: number;
  activeRoutes: number;
  paymentStatus: string;
}

export default function ParentDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeRoutes: 0,
    paymentStatus: 'Paid',
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
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
        activeRoutes: activeRouteCount,
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

          {/* Recent Bookings */}
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 m-0">Recent Bookings</h3>
              <Link to="/my-bookings" className="text-[13px] text-primary font-medium no-underline hover:underline">
                View All
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No bookings yet.</p>
                <Link to="/book-transport" className="text-sm text-primary font-semibold no-underline hover:underline">
                  Book your first transport →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Bus className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {booking.student ? `${booking.student.first_name} ${booking.student.last_name}` : 'Student'}
                        </span>
                        <StatusBadge status={booking.status} domain="booking" showDot />
                      </div>
                      <div className="text-xs text-slate-500">
                        {booking.route?.name || 'Route'} • {new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-800 shrink-0">
                      KES {Number(booking.amount || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN – Payment Summary */}
        <div className={`${cardClass} p-6 flex flex-col`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-800 m-0">Payment Overview</h3>
            <Link to="/payment" className="text-[13px] text-primary font-medium no-underline hover:underline">
              Pay Now
            </Link>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {recentBookings.filter(b => b.status === 'pending').length > 0 ? (
              <>
                <div className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Pending Payments</div>
                    <div className="text-xs text-slate-500">
                      {recentBookings.filter(b => b.status === 'pending').length} booking(s) awaiting payment
                    </div>
                  </div>
                </div>
                {recentBookings.filter(b => b.status === 'pending').slice(0, 3).map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-slate-800">{b.route?.name || 'Route'}</div>
                      <div className="text-xs text-slate-500">{b.booking_reference}</div>
                    </div>
                    <span className="text-sm font-bold text-amber-600">KES {Number(b.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-slate-800">All Caught Up!</p>
                <p className="text-xs text-slate-500">No pending payments</p>
              </div>
            )}
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
              <Link to="/students" className="p-1 bg-transparent border-none cursor-pointer text-slate-400 hover:text-primary no-underline">
                <MapPin className="w-[18px] h-[18px]" />
              </Link>
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
