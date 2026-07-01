import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Truck,
  UserCheck,
  RefreshCw,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import api from '../../lib/api';
import StatCard from '../../components/ui/StatCard';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Overview {
  users: { total: number };
  students: { total: number };
  routes: { total: number; active: number };
  vehicles: { total: number; active: number };
  drivers: { total: number; available: number };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  payments: { total: number; completed: number };
  revenue: { total: number; pending: number };
}

interface MonthlyData {
  month: string;
  bookings: number;
  revenue: number;
}

interface RouteBooking {
  id: string;
  name: string;
  bookingCount: number;
}

interface RouteRevenue {
  id: string;
  name: string;
  totalRevenue: number;
  bookingCount: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface RecentActivity {
  newUsers: number;
  newStudents: number;
  newBookings: number;
  period: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_BG: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

function BarChart({
  data,
  labelKey,
  valueKey,
  color = 'bg-primary',
  prefix = '',
  suffix = '',
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  color?: string;
  prefix?: string;
  suffix?: string;
}) {
  const maxVal = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        const value = Number(item[valueKey]) || 0;
        const pct = (value / maxVal) * 100;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary truncate max-w-[60%]">
                {String(item[labelKey])}
              </span>
              <span className="font-medium text-text-primary">
                {prefix}{value.toLocaleString()}{suffix}
              </span>
            </div>
            <div className="w-full h-3 bg-bg rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      {data.length === 0 && (
        <p className="text-sm text-text-secondary text-center py-4">No data available</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function AnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [routeBookings, setRouteBookings] = useState<RouteBooking[]>([]);
  const [routeRevenue, setRouteRevenue] = useState<RouteRevenue[]>([]);
  const [statusDist, setStatusDist] = useState<StatusCount[]>([]);
  const [recent, setRecent] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, moRes, brRes, rrRes, bsRes, rcRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/monthly-bookings'),
        api.get('/analytics/bookings-by-route'),
        api.get('/analytics/revenue-by-route'),
        api.get('/analytics/bookings-by-status'),
        api.get('/analytics/recent-registrations'),
      ]);
      setOverview(ovRes.data.data);
      setMonthly(moRes.data.data);
      setRouteBookings(brRes.data.data);
      setRouteRevenue(rrRes.data.data);
      setStatusDist(bsRes.data.data);
      setRecent(rcRes.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalBookingsByStatus = statusDist.reduce(
    (sum, s) => sum + Number(s.count),
    0
  );

  const monthlyMax = Math.max(...monthly.map((m) => m.bookings), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics & Reports</h1>
          <p className="text-sm text-text-secondary mt-1">
            Comprehensive overview of system performance
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-card text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={`KES ${overview.revenue.total.toLocaleString()}`} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
          <StatCard icon={Clock} label="Pending Revenue" value={`KES ${overview.revenue.pending.toLocaleString()}`} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
          <StatCard icon={Calendar} label="Total Bookings" value={overview.bookings.total} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard icon={Users} label="Users" value={overview.users.total} iconBg="bg-purple-50" iconColor="text-purple-600" />
        </div>
      )}

      {/* Row 2 — smaller stat chips */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: 'Students', value: overview.students.total, Icon: Users, color: 'text-cyan-600' },
            { label: 'Routes', value: `${overview.routes.active}/${overview.routes.total}`, Icon: MapPin, color: 'text-green-600' },
            { label: 'Vehicles', value: `${overview.vehicles.active}/${overview.vehicles.total}`, Icon: Truck, color: 'text-indigo-600' },
            { label: 'Drivers', value: `${overview.drivers.available}/${overview.drivers.total}`, Icon: UserCheck, color: 'text-orange-600' },
            { label: 'Active Bookings', value: overview.bookings.confirmed, Icon: Calendar, color: 'text-blue-600' },
            { label: 'Payments', value: overview.payments.completed, Icon: DollarSign, color: 'text-emerald-600' },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              <s.Icon className={`w-4 h-4 ${s.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-xs text-text-secondary truncate">{s.label}</p>
                <p className="text-sm font-semibold text-text-primary">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Row 3 — Monthly Bookings Chart + Status Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Bookings */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Monthly Bookings</h3>
            </div>
            <span className="text-xs text-text-secondary">Last 6 months</span>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthly.map((m, idx) => {
              const pct = (m.bookings / monthlyMax) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-text-primary">{m.bookings}</span>
                  <div className="w-full bg-bg rounded-t-md overflow-hidden" style={{ height: '100%' }}>
                    <div
                      className="w-full bg-primary rounded-t-md transition-all duration-500"
                      style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-secondary whitespace-nowrap">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-text-primary">Booking Status</h3>
          </div>

          {/* Donut-like progress ring via stacked bars */}
          <div className="space-y-3">
            {statusDist.map((s) => {
              const pct = totalBookingsByStatus > 0
                ? ((Number(s.count) / totalBookingsByStatus) * 100).toFixed(1)
                : '0';
              return (
                <div key={s.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${STATUS_BG[s.status] || 'bg-gray-400'}`}
                      />
                      <span className="text-text-secondary capitalize">{s.status}</span>
                    </div>
                    <span className="font-medium text-text-primary">
                      {Number(s.count)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: STATUS_COLORS[s.status] || '#9ca3af',
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {statusDist.length === 0 && (
              <p className="text-sm text-text-secondary text-center py-4">No booking data</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 4 — Monthly Revenue + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Revenue */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-text-primary">Monthly Revenue</h3>
            </div>
            <span className="text-xs text-text-secondary">Last 6 months</span>
          </div>
          <BarChart
            data={monthly}
            labelKey="month"
            valueKey="revenue"
            color="bg-emerald-500"
            prefix="KES "
          />
        </div>

        {/* Recent Activity (30 days) */}
        {recent && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <ArrowUpRight className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Last 30 Days</h3>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: 'New Users',
                  value: recent.newUsers,
                  Icon: Users,
                  color: 'bg-blue-100 text-blue-600',
                },
                {
                  label: 'New Students',
                  value: recent.newStudents,
                  Icon: Users,
                  color: 'bg-purple-100 text-purple-600',
                },
                {
                  label: 'New Bookings',
                  value: recent.newBookings,
                  Icon: Calendar,
                  color: 'bg-green-100 text-green-600',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-bg rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                    <item.Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-primary">{item.value}</p>
                    <p className="text-xs text-text-secondary">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Row 5 — Bookings by Route + Revenue by Route */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings by Route */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-green-600" />
            <h3 className="text-base font-semibold text-text-primary">Bookings by Route</h3>
          </div>
          <BarChart
            data={routeBookings}
            labelKey="name"
            valueKey="bookingCount"
            color="bg-blue-500"
          />
        </div>

        {/* Revenue by Route */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-text-primary">Revenue by Route</h3>
          </div>
          <BarChart
            data={routeRevenue}
            labelKey="name"
            valueKey="totalRevenue"
            color="bg-emerald-500"
            prefix="KES "
          />
        </div>
      </div>
    </div>
  );
}
