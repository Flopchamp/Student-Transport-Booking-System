import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  Navigation,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  Route as RouteIcon,
  Bus,
  AlertCircle,
  Search,
  MapPin,
} from 'lucide-react';

interface TripData {
  id: string;
  trip_reference: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  passenger_count: number;
  distance_covered_km: number | null;
  notes: string | null;
  driver: { id: string; first_name: string; last_name: string; phone: string; status: string } | null;
  vehicle: { id: string; plate_number: string; make: string; model: string; capacity: number } | null;
  route: { id: string; name: string; start_location: string; end_location: string; distance_km: number } | null;
}

interface Stats {
  total: number;
  inProgress: number;
  completedToday: number;
  scheduledToday: number;
  cancelled: number;
}

interface DriverOption { id: string; first_name: string; last_name: string }
interface VehicleOption { id: string; plate_number: string; make: string; model: string }
interface RouteOption { id: string; name: string }

export default function TripManagement() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, inProgress: 0, completedToday: 0, scheduledToday: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);

  // Options for create form
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [form, setForm] = useState({ driver_id: '', vehicle_id: '', route_id: '', scheduled_date: '', scheduled_time: '', notes: '' });

  const fetchTrips = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      const res = await api.get('/trips', { params });
      setTrips(res.data.data.trips);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      toast.error('Failed to load trips');
    }
  }, [page, statusFilter, dateFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/trips/stats');
      setStats(res.data.data.stats);
    } catch {
      // non-critical
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const [dRes, vRes, rRes] = await Promise.all([
        api.get('/drivers', { params: { limit: 200 } }),
        api.get('/vehicles', { params: { limit: 200 } }),
        api.get('/routes', { params: { limit: 200 } }),
      ]);
      setDrivers(dRes.data.data.drivers || []);
      setVehicles(vRes.data.data.vehicles || []);
      setRoutes(rRes.data.data.routes || []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTrips(), fetchStats()]);
      setLoading(false);
    };
    load();
  }, [fetchTrips, fetchStats]);

  const handleCreateTrip = async () => {
    if (!form.driver_id || !form.vehicle_id || !form.route_id || !form.scheduled_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCreating(true);
    try {
      await api.post('/trips', {
        driver_id: form.driver_id,
        vehicle_id: form.vehicle_id,
        route_id: form.route_id,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time || undefined,
        notes: form.notes || undefined,
      });
      toast.success('Trip scheduled successfully');
      setShowCreate(false);
      setForm({ driver_id: '', vehicle_id: '', route_id: '', scheduled_date: '', scheduled_time: '', notes: '' });
      fetchTrips();
      fetchStats();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create trip';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to cancel this trip?')) return;
    try {
      await api.patch(`/trips/${tripId}/cancel`, { reason: 'Cancelled by admin' });
      toast.success('Trip cancelled');
      fetchTrips();
      fetchStats();
      setSelectedTrip(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to cancel trip';
      toast.error(msg);
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return '—';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trip Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Schedule and monitor all trips</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); fetchOptions(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white border-none cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Trip
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={Navigation} label="Total Trips" value={stats.total} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard icon={Clock} label="In Progress" value={stats.inProgress} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard icon={CheckCircle2} label="Completed Today" value={stats.completedToday} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard icon={CalendarDays} label="Scheduled Today" value={stats.scheduledToday} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <StatCard icon={XCircle} label="Cancelled" value={stats.cancelled} iconBg="bg-red-50" iconColor="text-red-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Search className="w-4 h-4" />
            Filters:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs rounded-lg border border-slate-200 px-2 py-1.5 bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="text-xs rounded-lg border border-slate-200 px-2 py-1.5 bg-white text-slate-700"
          />
          {(statusFilter || dateFilter) && (
            <button
              onClick={() => { setStatusFilter(''); setDateFilter(''); setPage(1); }}
              className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer bg-transparent border-none"
            >
              Clear
            </button>
          )}
        </div>

        {/* Trip table */}
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No trips found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-bold">Reference</th>
                  <th className="px-5 py-3 font-bold">Date</th>
                  <th className="px-5 py-3 font-bold">Driver</th>
                  <th className="px-5 py-3 font-bold">Route</th>
                  <th className="px-5 py-3 font-bold">Vehicle</th>
                  <th className="px-5 py-3 font-bold">Passengers</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Duration</th>
                  <th className="px-5 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-slate-800">{trip.trip_reference}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{trip.scheduled_date}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      {trip.driver ? `${trip.driver.first_name} ${trip.driver.last_name}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 max-w-[150px] truncate">{trip.route?.name || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{trip.vehicle?.plate_number || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{trip.passenger_count}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={trip.status} domain="trip" />
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      {formatDuration(trip.actual_start_time, trip.actual_end_time)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTrip(trip)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-transparent border-none cursor-pointer"
                        >
                          View
                        </button>
                        {(trip.status === 'scheduled' || trip.status === 'in_progress') && (
                          <button
                            onClick={() => handleCancelTrip(trip.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-bold bg-transparent border-none cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Trip Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Schedule New Trip" maxWidth="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Driver *</label>
            <select
              value={form.driver_id}
              onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">Select driver</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Vehicle *</label>
            <select
              value={form.vehicle_id}
              onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plate_number} - {v.make} {v.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Route *</label>
            <select
              value={form.route_id}
              onChange={(e) => setForm({ ...form, route_id: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">Select route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.scheduled_date}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
              <input
                type="time"
                value={form.scheduled_time}
                onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white resize-none"
              placeholder="Optional notes about this trip..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTrip}
              disabled={creating}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white border-none cursor-pointer disabled:opacity-60"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule Trip'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Trip Detail Modal */}
      <Modal open={!!selectedTrip} onClose={() => setSelectedTrip(null)} title="Trip Details" maxWidth="lg">
        {selectedTrip && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-800">{selectedTrip.trip_reference}</span>
              <StatusBadge status={selectedTrip.status} domain="trip" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Date</div>
                <div className="text-sm font-bold text-slate-800">{selectedTrip.scheduled_date}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Passengers</div>
                <div className="text-sm font-bold text-slate-800">{selectedTrip.passenger_count}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Start Time</div>
                <div className="text-sm font-bold text-slate-800">{formatTime(selectedTrip.actual_start_time)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> End Time</div>
                <div className="text-sm font-bold text-slate-800">{formatTime(selectedTrip.actual_end_time)}</div>
              </div>
            </div>
            {selectedTrip.driver && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Driver</div>
                <div className="text-sm font-bold text-slate-800">
                  {selectedTrip.driver.first_name} {selectedTrip.driver.last_name}
                </div>
                <div className="text-xs text-slate-500">{selectedTrip.driver.phone}</div>
              </div>
            )}
            {selectedTrip.route && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><RouteIcon className="w-3 h-3" /> Route</div>
                <div className="text-sm font-bold text-slate-800">{selectedTrip.route.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {selectedTrip.route.start_location} → {selectedTrip.route.end_location}
                </div>
              </div>
            )}
            {selectedTrip.vehicle && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Bus className="w-3 h-3" /> Vehicle</div>
                <div className="text-sm font-bold text-slate-800">
                  {selectedTrip.vehicle.plate_number} — {selectedTrip.vehicle.make} {selectedTrip.vehicle.model}
                </div>
                <div className="text-xs text-slate-500">Capacity: {selectedTrip.vehicle.capacity}</div>
              </div>
            )}
            {selectedTrip.notes && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Notes</div>
                <div className="text-sm text-slate-700 whitespace-pre-line">{selectedTrip.notes}</div>
              </div>
            )}
            {(selectedTrip.status === 'scheduled' || selectedTrip.status === 'in_progress') && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleCancelTrip(selectedTrip.id)}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 hover:bg-red-600 text-white border-none cursor-pointer"
                >
                  Cancel Trip
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
