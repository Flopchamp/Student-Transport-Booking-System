import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  Users,
  MapPin,
  Truck,
  Calendar,
  DollarSign,
  UserCheck,
  ArrowUpRight,
} from 'lucide-react';
import type { Booking, Driver } from '../../types';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';

interface AdminStats {
  totalStudents: number;
  totalRoutes: number;
  totalVehicles: number;
  totalDrivers: number;
  totalBookings: number;
  activeBookings: number;
  revenue: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalRoutes: 0,
    totalVehicles: 0,
    totalDrivers: 0,
    totalBookings: 0,
    activeBookings: 0,
    revenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, routesRes, vehiclesRes, driversRes, bookingsRes] = await Promise.all([
        api.get('/students').catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
        api.get('/routes').catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
        api.get('/vehicles').catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
        api.get('/drivers').catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
        api.get('/bookings').catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
      ]);

      const rawBookings = bookingsRes.data.data;
      const rawDrivers = driversRes.data.data;
      const bookingData = Array.isArray(rawBookings) ? rawBookings : (rawBookings?.bookings || []);
      const driverData = Array.isArray(rawDrivers) ? rawDrivers : (rawDrivers?.drivers || []);

      setRecentBookings(bookingData.slice(0, 5));
      setDrivers(driverData.slice(0, 6));

      const revenue = bookingData
        .filter((b: Booking) => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum: number, b: Booking) => sum + (b.amount || 0), 0);

      setStats({
        totalStudents: studentsRes.data.pagination?.total || (Array.isArray(studentsRes.data.data) ? studentsRes.data.data : studentsRes.data.data?.students)?.length || 0,
        totalRoutes: routesRes.data.pagination?.total || (Array.isArray(routesRes.data.data) ? routesRes.data.data : routesRes.data.data?.routes)?.length || 0,
        totalVehicles: vehiclesRes.data.pagination?.total || (Array.isArray(vehiclesRes.data.data) ? vehiclesRes.data.data : vehiclesRes.data.data?.vehicles)?.length || 0,
        totalDrivers: driversRes.data.pagination?.total || driverData.length || 0,
        totalBookings: bookingsRes.data.pagination?.total || bookingData.length || 0,
        activeBookings: bookingData.filter((b: Booking) => b.status === 'confirmed').length,
        revenue,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Routes', value: stats.totalRoutes, icon: MapPin, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Vehicles', value: stats.totalVehicles, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Drivers', value: stats.totalDrivers, icon: UserCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Revenue', value: `KES ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
        <p className="text-text-secondary mt-1">Overview of your transport management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            iconBg={stat.bg}
            iconColor={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-semibold text-text">Recent Bookings</h3>
            <button onClick={() => navigate('/admin/bookings')} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Reference</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Fare</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-text-muted">
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-border hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-mono text-text">{booking.booking_reference}</td>
                      <td className="px-6 py-3 text-sm text-text">
                        {booking.student ? `${booking.student.first_name} ${booking.student.last_name}` : '-'}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={booking.status} domain="booking" />
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-text">
                        KES {booking.amount?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Availability */}
        <div className="card">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-semibold text-text">Driver Status</h3>
            <button onClick={() => navigate('/admin/drivers')} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {drivers.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No drivers yet</p>
            ) : (
              drivers.map((driver) => (
                <div key={driver.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {driver.first_name[0]}{driver.last_name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {driver.first_name} {driver.last_name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {driver.phone} • {driver.license_number}
                    </p>
                  </div>
                  <StatusBadge status={driver.status} domain="driver" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
