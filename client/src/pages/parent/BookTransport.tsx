import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  Search,
  Bus,
  Users as UsersIcon,
  MapPin,
} from 'lucide-react';
import type { Route } from '../../types';

/* ─── demo routes shown when API returns none ─── */
const demoRoutes = [
  {
    id: 'demo-1',
    name: 'Downtown Express',
    routeNumber: '102',
    start_location: 'Main Square Station, 7:15 AM',
    end_location: 'Central Academy High, 7:55 AM',
    driverName: 'Marcus Chen',
    capacity: 32,
    seatsLeft: 12,
    badgeColor: '#dc2626',
    price: 0,
  },
  {
    id: 'demo-2',
    name: 'Westside Shuttle',
    routeNumber: '205',
    start_location: 'Sunset & 5th Ave, 7:30 AM',
    end_location: 'Lincoln Elementary, 8:10 AM',
    driverName: 'Elena Rodriguez',
    capacity: 16,
    seatsLeft: 4,
    badgeColor: '#137fec',
    capacityLabel: '16 Seats (Mini)',
    price: 0,
  },
  {
    id: 'demo-3',
    name: 'North Park Loop',
    routeNumber: '308',
    start_location: 'Community Library, 7:00 AM',
    end_location: 'St. Jude Middle School, 7:45 AM',
    driverName: 'John Smith',
    capacity: 0,
    seatsLeft: 0,
    badgeColor: '#16a34a',
    price: 0,
  },
];

export default function BookTransport() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('morning');
  const [schoolFilter, setSchoolFilter] = useState('elementary');

  useEffect(() => {
    fetchData();
  }, []);

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

  /* ─── helpers ─── */
  const filteredRoutes = routes.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.start_location || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.end_location || '').toLowerCase().includes(search.toLowerCase())
  );

  const useDemo = routes.length === 0;
  const displayRoutes = useDemo ? demoRoutes : filteredRoutes;

  const badgeColors = ['#dc2626', '#137fec', '#16a34a', '#f59e0b', '#8b5cf6'];

  /* ─── styles ─── */
  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 44,
    padding: '0 14px',
    fontSize: 14,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    background: '#fff',
    outline: 'none',
    color: '#1e293b',
  };
  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    height: 40,
    fontSize: 13,
    paddingRight: 32,
    appearance: 'none' as React.CSSProperties['appearance'],
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ═══════ Header + Stepper ═══════ */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Book School Transport</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Secure your child's seat for the academic year</p>
        </div>

        {/* 3-Step Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {[
            { num: 1, label: 'Route', active: true },
            { num: 2, label: 'Seat', active: false },
            { num: 3, label: 'Pay', active: false },
          ].map((step, i) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div style={{ width: 48, height: 2, background: step.active ? '#137fec' : '#e2e8f0' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: step.active ? '#137fec' : '#f1f5f9',
                  color: step.active ? '#fff' : '#94a3b8',
                  border: step.active ? 'none' : '1px solid #e2e8f0',
                }}>
                  {step.num}
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: step.active ? '#137fec' : '#94a3b8' }}>{step.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════ Search + Filters ═══════ */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by area or school name..."
            style={{ ...inputStyle, paddingLeft: 42, height: 44, borderRadius: 10 }}
          />
        </div>
        {/* Time filter */}
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} style={{ ...selectStyle, width: 170 }}>
          <option value="morning">Morning (7:00 AM)</option>
          <option value="afternoon">Afternoon (2:00 PM)</option>
          <option value="evening">Evening (5:00 PM)</option>
        </select>
        {/* School filter */}
        <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} style={{ ...selectStyle, width: 150 }}>
          <option value="elementary">Elementary</option>
          <option value="middle">Middle School</option>
          <option value="high">High School</option>
          <option value="all">All Schools</option>
        </select>
      </div>

      {/* ═══════ Route Cards ═══════ */}
      {displayRoutes.length === 0 ? (
        <div style={{ ...card, padding: 60, textAlign: 'center' }}>
          <MapPin style={{ width: 48, height: 48, color: '#cbd5e1', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>No routes found</h3>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>
            {search ? 'Try a different search term' : 'No routes available at the moment'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {displayRoutes.map((item, idx) => {
            const isReal = 'is_active' in item;
            const route = isReal ? (item as Route) : null;
            const demo = !isReal ? (item as typeof demoRoutes[0]) : null;

            const name = route?.name || demo?.name || '';
            const routeNumber = demo?.routeNumber || String(idx + 100 + 2);
            const pickup = route?.start_location || demo?.start_location || '';
            const dropoff = route?.end_location || demo?.end_location || '';
            const driverName = demo?.driverName || route?.Driver?.first_name ? `${route?.Driver?.first_name || ''} ${route?.Driver?.last_name || ''}`.trim() : 'Assigned Driver';
            const capacity = demo?.capacity ?? route?.Vehicle?.capacity ?? 32;
            const seatsLeft = demo?.seatsLeft ?? Math.max(0, capacity - Math.floor(Math.random() * capacity));
            const capacityLabel = demo?.capacityLabel || `${capacity} Seats`;
            const bColor = demo?.badgeColor || badgeColors[idx % badgeColors.length];
            const isWaitlist = seatsLeft === 0;
            const isLow = seatsLeft > 0 && seatsLeft <= 5;

            return (
              <div key={demo?.id || route?.id || idx} style={{ ...card, display: 'flex', overflow: 'hidden', minHeight: 180 }}>
                {/* Left image placeholder */}
                <div style={{
                  width: 220, minHeight: '100%', flexShrink: 0, position: 'relative',
                  background: 'linear-gradient(135deg, #e0ecff 0%, #c7d8f5 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {/* Map/image placeholder pattern */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                    <svg width="100%" height="100%" viewBox="0 0 220 200" fill="none">
                      <path d="M0 80 Q55 40 110 80 T220 80" stroke="#137fec" strokeWidth="2" fill="none" />
                      <path d="M0 120 Q55 80 110 120 T220 120" stroke="#137fec" strokeWidth="2" fill="none" />
                      <circle cx="60" cy="80" r="4" fill="#137fec" />
                      <circle cx="160" cy="80" r="4" fill="#137fec" />
                      <circle cx="110" cy="120" r="4" fill="#16a34a" />
                    </svg>
                  </div>

                  {/* Route badge */}
                  <div style={{
                    position: 'absolute', top: 16, left: 16,
                    background: bColor, color: '#fff',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
                    padding: '5px 12px', borderRadius: 6, textTransform: 'uppercase',
                  }}>
                    Route {routeNumber}
                  </div>
                </div>

                {/* Right content */}
                <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Top: name + seats */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>{name}</h3>
                      <span style={{
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                        color: isWaitlist ? '#94a3b8' : isLow ? '#f59e0b' : '#137fec',
                      }}>
                        {isWaitlist ? 'WAITLIST ONLY' : `${seatsLeft} SEATS LEFT`}
                      </span>
                    </div>

                    {/* Pickup / Dropoff */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#475569' }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                        <span>Pickup: <strong style={{ fontWeight: 600, color: '#1e293b' }}>{pickup}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#475569' }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#137fec', flexShrink: 0 }} />
                        <span>Drop-off: <strong style={{ fontWeight: 600, color: '#1e293b' }}>{dropoff}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: driver, capacity, button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      {/* Driver */}
                      <div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Driver</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#f1f5f9' }}>
                            <UsersIcon style={{ width: 12, height: 12, color: '#64748b' }} />
                          </span>
                          {driverName}
                        </div>
                      </div>
                      {/* Capacity */}
                      {capacity > 0 && (
                        <div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Capacity</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                            <Bus style={{ width: 14, height: 14, color: '#64748b' }} />
                            {capacityLabel}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Book / Waitlist button */}
                    {isWaitlist ? (
                      <button style={{
                        padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                        background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer',
                      }}>
                        Join Waitlist
                      </button>
                    ) : (
                      <button
                        onClick={() => { if (route) handleBookRoute(route); }}
                        style={{
                          padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                          background: '#137fec', color: '#fff', border: 'none', cursor: 'pointer',
                        }}
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════ Footer ═══════ */}
      <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 13, color: '#94a3b8' }}>
        Need help? Contact School Transport Support at{' '}
        <a href="mailto:support@edutrans.com" style={{ color: '#137fec', textDecoration: 'none', fontWeight: 500 }}>
          support@edutrans.com
        </a>
      </div>
    </div>
  );
}
