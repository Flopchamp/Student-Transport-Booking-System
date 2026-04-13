import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
  Play,
  Square,
  MapPin,
  Clock,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Route,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Navigation,
} from 'lucide-react';

interface Trip {
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
  vehicle: { id: string; plate_number: string; make: string; model: string } | null;
  route: { id: string; name: string; start_location: string; end_location: string; distance_km: number } | null;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Clock className="w-3.5 h-3.5" /> },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Navigation className="w-3.5 h-3.5" /> },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function DriverTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTrips = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/driver-portal/trips', { params });
      setTrips(res.data.data.trips);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      toast.error('Failed to load trips');
    }
  }, [page, statusFilter]);

  const fetchActiveTrip = useCallback(async () => {
    try {
      const res = await api.get('/driver-portal/trips/active');
      setActiveTrip(res.data.data.trip);
    } catch {
      // no active trip
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTrips(), fetchActiveTrip()]);
      setLoading(false);
    };
    load();
  }, [fetchTrips, fetchActiveTrip]);

  const handleStartTrip = async () => {
    setStarting(true);
    try {
      // Try to get GPS coords
      let lat: number | undefined;
      let lng: number | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // GPS not available, proceed without coords
      }

      const res = await api.post('/driver-portal/trips/start', { latitude: lat, longitude: lng });
      setActiveTrip(res.data.data.trip);
      toast.success('Trip started!');
      fetchTrips();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to start trip';
      toast.error(msg);
    } finally {
      setStarting(false);
    }
  };

  const handleEndTrip = async () => {
    if (!activeTrip) return;
    setEnding(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // GPS not available
      }

      await api.patch(`/driver-portal/trips/${activeTrip.id}/end`, {
        latitude: lat,
        longitude: lng,
      });
      setActiveTrip(null);
      toast.success('Trip completed!');
      fetchTrips();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to end trip';
      toast.error(msg);
    } finally {
      setEnding(false);
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return null;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Trip Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Start, end, and review your trips</p>
      </div>

      {/* Active Trip / Start Trip */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {activeTrip ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-800">Trip In Progress</div>
                  <div className="text-xs text-slate-500">
                    {activeTrip.trip_reference} • Started {formatTime(activeTrip.actual_start_time)}
                  </div>
                </div>
              </div>
              <button
                onClick={handleEndTrip}
                disabled={ending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-red-500 hover:bg-red-600 text-white border-none cursor-pointer transition-colors disabled:opacity-60"
              >
                {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                End Trip
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Route className="w-3 h-3" /> Route</div>
                <div className="text-sm font-bold text-slate-800 truncate">{activeTrip.route?.name || '—'}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Vehicle</div>
                <div className="text-sm font-bold text-slate-800">{activeTrip.vehicle?.plate_number || '—'}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Passengers</div>
                <div className="text-sm font-bold text-slate-800">{activeTrip.passenger_count}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</div>
                <div className="text-sm font-bold text-slate-800">
                  {activeTrip.actual_start_time
                    ? formatDuration(activeTrip.actual_start_time, new Date().toISOString()) || 'Just started'
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Play className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <div className="text-base font-bold text-slate-800">No Active Trip</div>
                <div className="text-xs text-slate-500">Start a trip to begin your route</div>
              </div>
            </div>
            <button
              onClick={handleStartTrip}
              disabled={starting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white border-none cursor-pointer transition-colors disabled:opacity-60"
            >
              {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Start Trip
            </button>
          </div>
        )}
      </div>

      {/* Trip History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Trip History</h2>
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
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No trips found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {trips.map((trip) => {
              const cfg = statusConfig[trip.status] || statusConfig.scheduled;
              return (
                <div key={trip.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{trip.trip_reference}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
                        {cfg.icon}
                        {trip.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{trip.scheduled_date}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Route: </span>
                      <span className="font-medium text-slate-700">{trip.route?.name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Vehicle: </span>
                      <span className="font-medium text-slate-700">{trip.vehicle?.plate_number || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Passengers: </span>
                      <span className="font-medium text-slate-700">{trip.passenger_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Duration: </span>
                      <span className="font-medium text-slate-700">
                        {formatDuration(trip.actual_start_time, trip.actual_end_time) || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
}
