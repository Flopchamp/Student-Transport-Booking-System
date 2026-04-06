import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Search, Bus, Users as UsersIcon, MapPin } from 'lucide-react';
import type { Route } from '../../types';

/* ─── demo routes shown when API returns none ─── */
const demoRoutes = [
  {
    id: 'demo-1', name: 'Downtown Express', routeNumber: '102',
    start_location: 'Main Square Station, 7:15 AM', end_location: 'Central Academy High, 7:55 AM',
    driverName: 'Marcus Chen', capacity: 32, seatsLeft: 12, badgeColor: 'bg-red-600', price: 0,
  },
  {
    id: 'demo-2', name: 'Westside Shuttle', routeNumber: '205',
    start_location: 'Sunset & 5th Ave, 7:30 AM', end_location: 'Lincoln Elementary, 8:10 AM',
    driverName: 'Elena Rodriguez', capacity: 16, seatsLeft: 4, badgeColor: 'bg-primary', capacityLabel: '16 Seats (Mini)', price: 0,
  },
  {
    id: 'demo-3', name: 'North Park Loop', routeNumber: '308',
    start_location: 'Community Library, 7:00 AM', end_location: 'St. Jude Middle School, 7:45 AM',
    driverName: 'John Smith', capacity: 0, seatsLeft: 0, badgeColor: 'bg-green-600', price: 0,
  },
];

const badgeBgClasses = ['bg-red-600', 'bg-primary', 'bg-green-600', 'bg-amber-500', 'bg-violet-500'];

export default function BookTransport() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('morning');
  const [schoolFilter, setSchoolFilter] = useState('elementary');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [routesRes] = await Promise.all([
        api.get('/routes').catch(() => ({ data: { data: {} } })),
      ]);
      const rawRoutes = routesRes.data.data;
      setRoutes(Array.isArray(rawRoutes) ? rawRoutes : (rawRoutes?.routes || []));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoute = (route: Route) => {
    navigate('/new-booking', { state: { route } });
  };

  const filteredRoutes = routes.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.start_location || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.end_location || '').toLowerCase().includes(search.toLowerCase()),
  );

  const useDemo = routes.length === 0;
  const displayRoutes = useDemo ? demoRoutes : filteredRoutes;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Header + Stepper ─── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Book School Transport</h1>
          <p className="text-sm text-slate-500 mt-1">Secure your child's seat for the academic year</p>
        </div>

        {/* 3-Step Progress */}
        <div className="flex items-center">
          {[
            { num: 1, label: 'Route', active: true },
            { num: 2, label: 'Seat', active: false },
            { num: 3, label: 'Pay', active: false },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              {i > 0 && <div className={`w-12 h-0.5 ${s.active ? 'bg-primary' : 'bg-slate-200'}`} />}
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold
                  ${s.active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                  {s.num}
                </div>
                <span className={`text-[11px] font-medium ${s.active ? 'text-primary' : 'text-slate-400'}`}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Search + Filters ─── */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by area or school name..."
            className="w-full h-11 pl-10 pr-3.5 text-sm border border-slate-200 rounded-[10px] bg-white outline-none text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="h-10 px-3.5 pr-8 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-800 outline-none appearance-none focus:ring-2 focus:ring-primary"
        >
          <option value="morning">Morning (7:00 AM)</option>
          <option value="afternoon">Afternoon (2:00 PM)</option>
          <option value="evening">Evening (5:00 PM)</option>
        </select>
        <select
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value)}
          className="h-10 px-3.5 pr-8 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-800 outline-none appearance-none focus:ring-2 focus:ring-primary"
        >
          <option value="elementary">Elementary</option>
          <option value="middle">Middle School</option>
          <option value="high">High School</option>
          <option value="all">All Schools</option>
        </select>
      </div>

      {/* ─── Route Cards ─── */}
      {displayRoutes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-[60px] text-center">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No routes found</h3>
          <p className="text-sm text-slate-400">{search ? 'Try a different search term' : 'No routes available at the moment'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {displayRoutes.map((item, idx) => {
            const isReal = 'is_active' in item;
            const route = isReal ? (item as Route) : null;
            const demo = !isReal ? (item as (typeof demoRoutes)[0]) : null;

            const name = route?.name || demo?.name || '';
            const routeNumber = demo?.routeNumber || String(idx + 102);
            const pickup = route?.start_location || demo?.start_location || '';
            const dropoff = route?.end_location || demo?.end_location || '';
            const driverName = demo?.driverName || (route?.Driver?.first_name ? `${route.Driver.first_name} ${route.Driver.last_name || ''}`.trim() : 'Assigned Driver');
            const capacity = demo?.capacity ?? route?.Vehicle?.capacity ?? 32;
            const seatsLeft = demo?.seatsLeft ?? Math.max(0, capacity - Math.floor(Math.random() * capacity));
            const capacityLabel = demo?.capacityLabel || `${capacity} Seats`;
            const bColor = demo?.badgeColor || badgeBgClasses[idx % badgeBgClasses.length];
            const isWaitlist = seatsLeft === 0;
            const isLow = seatsLeft > 0 && seatsLeft <= 5;

            return (
              <div key={demo?.id || route?.id || idx} className="bg-white rounded-xl border border-slate-200 shadow-sm flex overflow-hidden min-h-[180px]">
                {/* Left image placeholder */}
                <div className="w-[220px] min-h-full shrink-0 relative bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center hidden md:flex">
                  <div className="absolute inset-0 opacity-15">
                    <svg width="100%" height="100%" viewBox="0 0 220 200" fill="none">
                      <path d="M0 80 Q55 40 110 80 T220 80" stroke="#137fec" strokeWidth="2" fill="none" />
                      <path d="M0 120 Q55 80 110 120 T220 120" stroke="#137fec" strokeWidth="2" fill="none" />
                      <circle cx="60" cy="80" r="4" fill="#137fec" />
                      <circle cx="160" cy="80" r="4" fill="#137fec" />
                      <circle cx="110" cy="120" r="4" fill="#16a34a" />
                    </svg>
                  </div>
                  <div className={`absolute top-4 left-4 ${bColor} text-white text-[11px] font-bold tracking-wide px-3 py-1 rounded-md uppercase`}>
                    Route {routeNumber}
                  </div>
                </div>

                {/* Right content */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-800">{name}</h3>
                      <span className={`text-xs font-bold tracking-wide uppercase whitespace-nowrap
                        ${isWaitlist ? 'text-slate-400' : isLow ? 'text-amber-500' : 'text-primary'}`}>
                        {isWaitlist ? 'WAITLIST ONLY' : `${seatsLeft} SEATS LEFT`}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                        <span>Pickup: <strong className="font-semibold text-slate-800">{pickup}</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                        <span>Drop-off: <strong className="font-semibold text-slate-800">{dropoff}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-1">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-[11px] text-slate-400 mb-0.5">Driver</div>
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100">
                            <UsersIcon className="w-3 h-3 text-slate-500" />
                          </span>
                          {driverName}
                        </div>
                      </div>
                      {capacity > 0 && (
                        <div>
                          <div className="text-[11px] text-slate-400 mb-0.5">Capacity</div>
                          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                            <Bus className="w-3.5 h-3.5 text-slate-500" />
                            {capacityLabel}
                          </div>
                        </div>
                      )}
                    </div>

                    {isWaitlist ? (
                      <button className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition cursor-pointer">
                        Join Waitlist
                      </button>
                    ) : (
                      <button
                        onClick={() => { if (route) handleBookRoute(route); }}
                        className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white border-none hover:bg-blue-600 transition cursor-pointer shadow-sm"
                      >
                        Book Now →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
