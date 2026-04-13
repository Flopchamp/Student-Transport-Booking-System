import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Bus,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  Navigation,
  Calendar,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface DashboardData {
  driver: {
    id: string;
    first_name: string;
    last_name: string;
    status: string;
    vehicle?: { id: string; plate_number: string; make: string; model: string; capacity: number; status: string };
    route?: { id: string; name: string; start_location: string; end_location: string; distance_km: number };
  };
  todayBookings: Array<{
    id: string;
    booking_reference: string;
    status: string;
    pickup_time: string;
    student: { id: string; first_name: string; last_name: string; school_name: string; grade: string; pickup_address: string; special_needs: string | null };
    route: { id: string; name: string; start_location: string; end_location: string };
  }>;
  stats: {
    totalBookings: number;
    completedTrips: number;
    activeBookings: number;
    todayCount: number;
  };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  on_trip: { label: 'On Trip', color: 'text-blue-700', bg: 'bg-blue-50' },
  off_duty: { label: 'Off Duty', color: 'text-slate-500', bg: 'bg-slate-100' },
};

export default function DriverDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/driver-portal/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    setStatusUpdating(true);
    try {
      await api.patch('/driver-portal/status', { status });
      fetchDashboard();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No driver profile found</h3>
        <p className="text-sm text-slate-500 mt-1">Please contact admin to link your account.</p>
      </div>
    );
  }

  const { driver, todayBookings, stats } = data;
  const statusInfo = statusConfig[driver.status] || statusConfig.available;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome + Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome, {driver.first_name}!
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here&apos;s your dashboard for today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <select
            value={driver.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={statusUpdating}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="off_duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today\'s Rides', value: stats.todayCount, icon: Clock, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Active Bookings', value: stats.activeBookings, icon: Users, bg: 'bg-amber-50', color: 'text-amber-600' },
          { label: 'Completed Trips', value: stats.completedTrips, icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Total Bookings', value: stats.totalBookings, icon: Navigation, bg: 'bg-purple-50', color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Vehicle & Route */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bus className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Assigned Vehicle</h3>
          </div>
          {driver.vehicle ? (
            <div className="space-y-2">
              <div className="text-lg font-bold text-slate-800">{driver.vehicle.plate_number}</div>
              <div className="text-sm text-slate-500">{driver.vehicle.make} {driver.vehicle.model}</div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {driver.vehicle.capacity} seats
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  driver.vehicle.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {driver.vehicle.status}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No vehicle assigned</p>
          )}
        </div>

        {/* Route */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Assigned Route</h3>
          </div>
          {driver.route ? (
            <div className="space-y-2">
              <div className="text-lg font-bold text-slate-800">{driver.route.name}</div>
              <div className="text-sm text-slate-500">
                {driver.route.start_location} → {driver.route.end_location}
              </div>
              {driver.route.distance_km && (
                <div className="text-xs text-slate-400">{driver.route.distance_km} km</div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No route assigned</p>
          )}
        </div>
      </div>

      {/* Today's Bookings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <h3 className="text-base font-bold text-slate-800">Today&apos;s Rides</h3>
          </div>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
            {todayBookings.length} ride{todayBookings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {todayBookings.length === 0 ? (
          <div className="p-10 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No rides scheduled for today</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayBookings.map((b) => (
              <div key={b.id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50 transition">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      {b.student.first_name} {b.student.last_name}
                    </span>
                    <span className="text-xs text-slate-400">{b.booking_reference}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {b.student.school_name} • Grade {b.student.grade}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Pickup: {b.student.pickup_address || 'Not specified'}
                  </div>
                  {b.student.special_needs && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="w-3 h-3" />
                      {b.student.special_needs}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-slate-800">{b.pickup_time}</div>
                  <div className={`text-[10px] font-bold uppercase mt-1 ${
                    b.status === 'confirmed' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {b.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
