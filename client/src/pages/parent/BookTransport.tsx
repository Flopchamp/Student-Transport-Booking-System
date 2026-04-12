import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Search, MapPin } from 'lucide-react';
import type { Route } from '../../types';

const badgeBgClasses = ['bg-red-600', 'bg-primary', 'bg-green-600', 'bg-amber-500', 'bg-violet-500'];

export default function BookTransport() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const displayRoutes = filteredRoutes;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Book School Transport</h1>
        <p className="text-sm text-slate-500 mt-1">Select a route to book transport for your child</p>
      </div>

      {/* ─── Search ─── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by area or school name..."
          className="w-full h-11 pl-10 pr-3.5 text-sm border border-slate-200 rounded-[10px] bg-white outline-none text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* ─── Route Cards ─── */}
      {displayRoutes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-15 text-center">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No routes found</h3>
          <p className="text-sm text-slate-400">{search ? 'Try a different search term' : 'No routes available at the moment'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {displayRoutes.map((route, idx) => {
            const name = route.name || '';
            const routeNumber = String(idx + 1);
            const pickup = route.start_location || '';
            const dropoff = route.end_location || '';
            const price = route.price ? Number(route.price) : 0;
            const bColor = badgeBgClasses[idx % badgeBgClasses.length];

            return (
              <div key={route.id || idx} className="bg-white rounded-xl border border-slate-200 shadow-sm flex overflow-hidden min-h-45">
                {/* Left image placeholder */}
                <div className="w-55 min-h-full shrink-0 relative bg-linear-to-br from-blue-100 to-blue-200 hidden md:flex items-center justify-center">
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

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div>
                      <div className="text-[11px] text-slate-400 mb-0.5">Monthly Fare</div>
                      <div className="text-lg font-bold text-primary">
                        {price > 0 ? `KES ${price.toLocaleString()}` : 'Contact for pricing'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookRoute(route)}
                      className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white border-none hover:bg-blue-600 transition cursor-pointer shadow-sm"
                    >
                      Book Now →
                    </button>
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
