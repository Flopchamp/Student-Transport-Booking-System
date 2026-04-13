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
  Activity,
  Wifi,
  WifiOff,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

interface FleetLocation {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  is_moving: boolean;
  last_updated: string;
  vehicle?: {
    id: string;
    plate_number: string;
    make: string;
    model: string;
    capacity: number;
    status: string;
  };
  driver?: { id: string; first_name: string; last_name: string; phone: string } | null;
  route?: { id: string; name: string; start_location: string; end_location: string } | null;
}

export default function FleetTrackingPage() {
  const [locations, setLocations] = useState<FleetLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await api.get('/tracking');
      setLocations(res.data.data?.locations || []);
    } catch (err) {
      console.error('Failed to fetch fleet tracking data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 15000); // Refresh every 15s
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

  const movingCount = locations.filter((l) => l.is_moving).length;
  const stoppedCount = locations.filter((l) => !l.is_moving).length;
  const selected = locations.find((l) => l.vehicle_id === selectedId) || null;

  const statCards = [
    { icon: Bus, label: 'Total Tracked', value: locations.length, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { icon: Activity, label: 'Moving', value: movingCount, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { icon: Wifi, label: 'Stopped', value: stoppedCount, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { icon: WifiOff, label: 'Offline', value: 0, iconBg: 'bg-slate-100', iconColor: 'text-slate-400' },
  ];

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
          <h1 className="text-2xl font-bold text-slate-800">Fleet Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor all vehicle locations in real-time</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {locations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 px-6 text-center">
          <div className="w-[72px] h-[72px] rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <MapPin className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1.5">No tracking data</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Vehicle locations will appear here once GPS data is received from the fleet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          {/* Map */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Fleet Map</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Auto-refreshing every 15s
              </div>
            </div>
            <div className="h-[420px] bg-slate-100 relative">
              <svg width="100%" height="100%" viewBox="0 0 800 420" fill="none" className="absolute inset-0">
                <rect width="800" height="420" fill="#f1f5f9" />
                {/* Grid */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <g key={i}>
                    <line x1="0" y1={84 * (i + 1)} x2="800" y2={84 * (i + 1)} stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1={160 * (i + 1)} y1="0" x2={160 * (i + 1)} y2="420" stroke="#e2e8f0" strokeWidth="0.5" />
                  </g>
                ))}
                {/* Major roads */}
                <line x1="0" y1="210" x2="800" y2="210" stroke="#cbd5e1" strokeWidth="8" />
                <line x1="400" y1="0" x2="400" y2="420" stroke="#cbd5e1" strokeWidth="8" />
                <line x1="0" y1="350" x2="800" y2="100" stroke="#cbd5e1" strokeWidth="5" />
              </svg>
              {/* Vehicle markers */}
              {locations.map((loc, i) => {
                const x = 100 + (i * 150) % 650;
                const y = 80 + (i * 90) % 280;
                const isSelected = selectedId === loc.vehicle_id;
                return (
                  <div
                    key={loc.vehicle_id}
                    onClick={() => setSelectedId(loc.vehicle_id)}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${
                      isSelected ? 'scale-125 z-10' : ''
                    }`}
                    style={{ left: x, top: y }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition ${
                      isSelected
                        ? 'bg-blue-600 ring-4 ring-blue-200'
                        : loc.is_moving
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                    }`}>
                      <Bus className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                      {loc.vehicle?.plate_number || 'Unknown'}
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
                <span className="w-3 h-3 rounded-full bg-blue-600" /> Selected
              </div>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex flex-col gap-3 max-h-[540px] overflow-y-auto">
            {/* Selected Detail */}
            {selected && (
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <Bus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-800">{selected.vehicle?.plate_number}</div>
                    <div className="text-xs text-slate-500">{selected.vehicle?.make} {selected.vehicle?.model}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="p-2 bg-white rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Speed</div>
                    <div className="text-sm font-bold text-slate-800">{Number(selected.speed).toFixed(0)} km/h</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Heading</div>
                    <div className="text-sm font-bold text-slate-800">{Number(selected.heading).toFixed(0)}°</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Last Update</div>
                    <div className="text-sm font-bold text-slate-800">{getTimeSince(selected.last_updated)}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
                    <div className={`text-sm font-bold ${selected.is_moving ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {selected.is_moving ? 'Moving' : 'Stopped'}
                    </div>
                  </div>
                </div>
                {selected.route && (
                  <div className="mt-2 p-2 bg-white rounded-lg flex items-center gap-2 text-[12px]">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-slate-600">{selected.route.name}: {selected.route.start_location} → {selected.route.end_location}</span>
                  </div>
                )}
                {selected.driver && (
                  <div className="mt-2 p-2 bg-white rounded-lg flex items-center gap-2 text-[12px]">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-slate-600">{selected.driver.first_name} {selected.driver.last_name}</span>
                    {selected.driver.phone && (
                      <>
                        <Phone className="w-3 h-3 ml-1 text-blue-500" />
                        <a href={`tel:${selected.driver.phone}`} className="text-blue-600 hover:underline">{selected.driver.phone}</a>
                      </>
                    )}
                  </div>
                )}
                <div className="mt-2 text-[11px] text-slate-400">
                  Coords: {Number(selected.latitude).toFixed(6)}, {Number(selected.longitude).toFixed(6)}
                </div>
              </div>
            )}

            {/* All vehicles list */}
            {locations.map((loc) => (
              <div
                key={loc.vehicle_id}
                onClick={() => setSelectedId(loc.vehicle_id)}
                className={`bg-white rounded-lg border p-3 cursor-pointer transition-all ${
                  selectedId === loc.vehicle_id ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    loc.is_moving ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    <Bus className={`w-4 h-4 ${loc.is_moving ? 'text-emerald-600' : 'text-amber-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{loc.vehicle?.plate_number || 'Unknown'}</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {loc.route?.name || 'No route assigned'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Navigation className="w-3 h-3" />
                      {Number(loc.speed).toFixed(0)} km/h
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-2.5 h-2.5" />
                      {getTimeSince(loc.last_updated)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
