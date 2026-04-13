import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  MapPin,
  Bus,
  Navigation,
  Clock,
  User,
  Phone,
  RefreshCw,
  Timer,
  AlertTriangle,
} from 'lucide-react';

interface VehicleTracking {
  booking: {
    id: string;
    booking_reference: string;
    status: string;
    student: { id: string; first_name: string; last_name: string };
    route: { id: string; name: string; start_location: string; end_location: string };
  };
  vehicle: {
    id: string;
    plate_number: string;
    make: string;
    model: string;
    driver?: { id: string; first_name: string; last_name: string; phone: string };
  };
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    is_moving: boolean;
    last_updated: string;
  } | null;
}

interface ETAData {
  booking: {
    id: string;
    booking_reference: string;
    status: string;
    student: { id: string; first_name: string; last_name: string };
    route: { id: string; name: string; end_location: string };
  };
  vehicle: {
    id: string;
    plate_number: string;
    make: string;
    model: string;
    driver?: { id: string; first_name: string; last_name: string; phone: string };
  };
  eta: {
    distanceKm: number;
    etaMinutes: number;
    etaFormatted: string;
  } | null;
  proximity: 'arrived' | 'approaching' | 'nearby' | 'en_route' | 'far' | null;
}

const proximityConfig: Record<string, { label: string; color: string; bg: string }> = {
  arrived: { label: 'Arrived', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  approaching: { label: 'Approaching', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  nearby: { label: 'Nearby', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  en_route: { label: 'En Route', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  far: { label: 'Far Away', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
};

export default function TrackingPage() {
  const [vehicles, setVehicles] = useState<VehicleTracking[]>([]);
  const [etas, setEtas] = useState<ETAData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTracking | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocations = useCallback(async () => {
    try {
      const [trackRes, etaRes] = await Promise.all([
        api.get('/tracking/my-vehicles'),
        api.get('/tracking/my-etas'),
      ]);
      setVehicles(trackRes.data.data?.vehicles || []);
      setEtas(etaRes.data.data?.etas || []);
    } catch (err) {
      console.error('Failed to fetch tracking data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLocations, 30000);
    return () => clearInterval(interval);
  }, [fetchLocations]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLocations();
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vehicle Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">Track your children&apos;s transport in real-time</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 px-6 text-center">
          <div className="w-[72px] h-[72px] rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <Bus className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1.5">No vehicles to track</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            You&apos;ll see vehicle locations here once your bookings have been assigned a vehicle by the admin.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* ETA Cards */}
          {etas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-800">Estimated Arrival Times</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {etas.map((e) => {
                  const prox = e.proximity ? proximityConfig[e.proximity] : null;
                  return (
                    <div
                      key={e.booking.id}
                      className={`rounded-xl border p-4 transition-all ${prox ? prox.bg : 'bg-white border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-bold text-slate-800">
                          {e.booking.student.first_name} {e.booking.student.last_name}
                        </div>
                        {prox && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${prox.color} ${prox.bg}`}>
                            {prox.label}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mb-3">
                        {e.booking.route.name} • {e.vehicle.plate_number}
                      </div>
                      {e.eta ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-slate-800">{e.eta.etaFormatted}</span>
                          <span className="text-xs text-slate-500 ml-1">({e.eta.distanceKm} km away)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          No GPS data available
                        </div>
                      )}
                      {e.vehicle.driver && (
                        <div className="mt-2 pt-2 border-t border-black/5 text-[11px] text-slate-500 flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          {e.vehicle.driver.first_name} {e.vehicle.driver.last_name}
                          {e.vehicle.driver.phone && (
                            <a href={`tel:${e.vehicle.driver.phone}`} className="text-blue-600 ml-1">
                              <Phone className="w-3 h-3 inline" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Map + Vehicle List */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
          {/* Map placeholder */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Live Map</h3>
                <p className="text-[13px] text-slate-400 mt-0.5">
                  {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} being tracked
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Updates
              </div>
            </div>
            <div className="h-96 bg-slate-100 relative flex items-center justify-center">
              {/* Map visualization placeholder */}
              <svg width="100%" height="100%" viewBox="0 0 700 384" fill="none" className="absolute inset-0">
                <rect width="700" height="384" fill="#f1f5f9" />
                {/* Grid lines */}
                <line x1="0" y1="96" x2="700" y2="96" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="0" y1="192" x2="700" y2="192" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="0" y1="288" x2="700" y2="288" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="175" y1="0" x2="175" y2="384" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="350" y1="0" x2="350" y2="384" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="525" y1="0" x2="525" y2="384" stroke="#e2e8f0" strokeWidth="1" />
                {/* Roads */}
                <line x1="0" y1="192" x2="700" y2="192" stroke="#cbd5e1" strokeWidth="6" />
                <line x1="350" y1="0" x2="350" y2="384" stroke="#cbd5e1" strokeWidth="6" />
                <line x1="100" y1="0" x2="500" y2="384" stroke="#cbd5e1" strokeWidth="4" />
              </svg>
              {/* Vehicle markers */}
              {vehicles.map((v, i) => {
                const x = 150 + (i * 180) % 500;
                const y = 100 + (i * 70) % 250;
                return (
                  <div
                    key={v.vehicle.id}
                    onClick={() => setSelectedVehicle(v)}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${
                      selectedVehicle?.vehicle.id === v.vehicle.id ? 'scale-110 z-10' : ''
                    }`}
                    style={{ left: x, top: y }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                      v.location?.is_moving
                        ? 'bg-emerald-500'
                        : v.location
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                    }`}>
                      <Bus className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                      {v.vehicle.plate_number}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Moving
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Stopped
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-400" /> No Signal
              </div>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex flex-col gap-3">
            {vehicles.map((v) => {
              const isSelected = selectedVehicle?.vehicle.id === v.vehicle.id;
              return (
                <div
                  key={v.vehicle.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      v.location?.is_moving ? 'bg-emerald-100' : 'bg-amber-100'
                    }`}>
                      <Bus className={`w-5 h-5 ${v.location?.is_moving ? 'text-emerald-600' : 'text-amber-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800">{v.vehicle.plate_number}</div>
                      <div className="text-xs text-slate-500">{v.vehicle.make} {v.vehicle.model}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      v.location?.is_moving
                        ? 'bg-emerald-50 text-emerald-700'
                        : v.location
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                    }`}>
                      {v.location?.is_moving ? 'Moving' : v.location ? 'Stopped' : 'No Signal'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <User className="w-3 h-3" />
                      <span>{v.booking.student.first_name} {v.booking.student.last_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{v.booking.route.name}</span>
                    </div>
                    {v.location && (
                      <>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Navigation className="w-3 h-3" />
                          <span>{Number(v.location.speed).toFixed(0)} km/h</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{getTimeSince(v.location.last_updated)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {v.vehicle.driver && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[12px] text-slate-500">
                      <User className="w-3 h-3" />
                      <span>{v.vehicle.driver.first_name} {v.vehicle.driver.last_name}</span>
                      {v.vehicle.driver.phone && (
                        <>
                          <Phone className="w-3 h-3 ml-2" />
                          <a href={`tel:${v.vehicle.driver.phone}`} className="text-blue-600 hover:underline">
                            {v.vehicle.driver.phone}
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
