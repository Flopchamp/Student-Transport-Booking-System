import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import {
  ArrowRight,
  Check,
  MapPin,
  Clock,
  Bus,
  Users,
  Shield,
  Plus,
  CheckCircle,
  Settings,
} from 'lucide-react';
import type { Route, Student, Vehicle } from '../../types';

/* ─── Demo data when API returns nothing ─── */
const demoStudents = [
  { id: 1, first_name: 'Leo', last_name: 'Thompson', grade: '5-A', school_name: 'Central Academy High' },
  { id: 2, first_name: 'Mia', last_name: 'Thompson', grade: '3-B', school_name: 'Lincoln Elementary' },
];

const demoStops = [
  { name: 'Maple St. Station', time: '07:15 AM' },
  { name: 'Oak Avenue Square', time: '07:30 AM' },
  { name: 'Riverside Park East', time: '07:45 AM' },
];

const demoVehicle = {
  name: 'Transit-Pro B12',
  desc: '*Priority Education Route*',
  driver: 'Michael Vance',
  filled: 24,
  capacity: 32,
};

export default function NewBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedRoute = (location.state as { route?: Route })?.route || null;

  const [step, setStep] = useState(passedRoute ? 1 : 0);
  const [students, setStudents] = useState<Student[]>([]);
  const [, setAvailableRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedStudent, setSelectedStudent] = useState<Student | (typeof demoStudents)[0] | null>(null);
  const [selectedRoute] = useState<Route | null>(passedRoute);
  const [selectedStop, setSelectedStop] = useState<string>(demoStops[0].name);
  const [bookingType, setBookingType] = useState('round_trip');
  const [startDate, setStartDate] = useState('');
  const [pickupTime, setPickupTime] = useState('07:15');

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, routesRes, vehiclesRes] = await Promise.all([
        api.get('/students').catch(() => ({ data: { data: {} } })),
        api.get('/routes').catch(() => ({ data: { data: {} } })),
        api.get('/vehicles').catch(() => ({ data: { data: {} } })),
      ]);
      const rawS = studentsRes.data.data;
      const rawR = routesRes.data.data;
      const rawV = vehiclesRes.data.data;
      setStudents(Array.isArray(rawS) ? rawS : (rawS?.students || []));
      setAvailableRoutes(Array.isArray(rawR) ? rawR : (rawR?.routes || []));
      setVehicles(Array.isArray(rawV) ? rawV : (rawV?.vehicles || []));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRoute || !selectedStudent) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/bookings', {
        student_id: selectedStudent.id,
        route_id: selectedRoute.id,
        booking_type: bookingType,
        start_date: startDate || new Date().toISOString().split('T')[0],
        pickup_time: pickupTime,
        pickup_location: selectedStop || selectedRoute.start_location,
        dropoff_location: selectedRoute.end_location,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Which items to display ─── */
  const displayStudents = students.length > 0 ? students : demoStudents;

  // Route stops
  const routeStops: { name: string; time: string }[] =
    selectedRoute?.stops && selectedRoute.stops.length > 0
      ? selectedRoute.stops.map((s: string | { name?: string; address?: string }, i: number) => ({
          name: typeof s === 'string' ? s : (s as { name?: string }).name || `Stop ${i + 1}`,
          time: `07:${String(15 + i * 15).padStart(2, '0')} AM`,
        }))
      : demoStops;

  // Vehicle for the route
  const routeVehicle = selectedRoute?.Vehicle || (vehicles.length > 0 ? vehicles[0] : null);

  /* ─── Steps ─── */
  const steps = [
    { num: 1, label: 'SELECT STUDENT' },
    { num: 2, label: 'CHOOSE ROUTE' },
    { num: 3, label: 'SELECT BUS' },
    { num: 4, label: 'REVIEW' },
  ];

  const canGoNext = (): boolean => {
    if (step === 0) return !!selectedStudent;
    if (step === 1) return !!selectedRoute && !!selectedStop;
    if (step === 2) return true;
    return true;
  };

  /* ─── Styles ─── */
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 12,
    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px', fontSize: 14,
    border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff',
    outline: 'none', color: '#1e293b',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
        <CheckCircle style={{ width: 64, height: 64, color: '#10b981' }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Booking Confirmed!</h2>
        <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', maxWidth: 400 }}>
          Your transport booking for <strong>{selectedStudent?.first_name}</strong> has been submitted.
          You'll receive a confirmation once approved.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={() => navigate('/my-bookings')} style={{
            padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: '#137fec', color: '#fff', border: 'none', cursor: 'pointer',
          }}>
            View My Bookings
          </button>
          <button onClick={() => navigate('/book-transport')} style={{
            padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: '#fff', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer',
          }}>
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ═══ Header ═══ */}
      <div>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#137fec' }}>New Booking</span>
      </div>

      {/* ═══ 4-Step Progress ═══ */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
        {steps.map((s, i) => {
          const isCompleted = step > i;
          const isActive = step === i;
          return (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div style={{ width: 72, height: 2, background: isCompleted ? '#137fec' : '#e2e8f0', marginBottom: 20 }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  background: isCompleted ? '#137fec' : isActive ? '#137fec' : '#f1f5f9',
                  color: isCompleted || isActive ? '#fff' : '#94a3b8',
                  border: !isCompleted && !isActive ? '2px solid #e2e8f0' : 'none',
                }}>
                  {isCompleted ? <Check style={{ width: 18, height: 18 }} /> : s.num}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: isCompleted || isActive ? '#137fec' : '#94a3b8',
                }}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Step Content ═══ */}

      {/* ── STEP 0: Select Student ── */}
      {step === 0 && (
        <div style={{ ...card, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Select a Student</h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>Choose which child you're booking transport for</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayStudents.map((s) => {
              const isSelected = selectedStudent?.id === s.id;
              const initials = s.first_name[0] + s.last_name[0];
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudent(s as Student)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 10, cursor: 'pointer',
                    border: isSelected ? '2px solid #137fec' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', flexShrink: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16,
                    background: isSelected ? '#dbeafe' : '#f1f5f9', color: isSelected ? '#137fec' : '#64748b',
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{s.first_name} {s.last_name}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{s.school_name} • Grade {s.grade}</div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    border: isSelected ? 'none' : '2px solid #cbd5e1',
                    background: isSelected ? '#137fec' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSelected && <Check style={{ width: 14, height: 14, color: '#fff' }} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add new student link */}
          <button
            onClick={() => navigate('/students', { state: { openAddModal: true } })}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 0',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#137fec',
            }}
          >
            <Plus style={{ width: 16, height: 16 }} /> Add New Student
          </button>
        </div>
      )}

      {/* ── STEP 1: Choose Route + Pickup Points ── */}
      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
          {/* Left — Map / Route Area */}
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Route Area: {selectedRoute?.name || 'Downtown Hub'}
                </h3>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: '2px 0 0' }}>
                  Visualizing stops for Route {selectedRoute?.route_number || 'B-12'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin style={{ width: 14, height: 14, color: '#64748b' }} />
                </button>
                <button style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings style={{ width: 14, height: 14, color: '#64748b' }} />
                </button>
              </div>
            </div>
            {/* Map placeholder */}
            <div style={{
              height: 340, background: '#f0f4f8', position: 'relative', overflow: 'hidden',
            }}>
              {/* Stylized map roads */}
              <svg width="100%" height="100%" viewBox="0 0 600 340" fill="none" style={{ position: 'absolute', inset: 0 }}>
                {/* Grid lines */}
                <line x1="0" y1="85" x2="600" y2="85" stroke="#dde4ed" strokeWidth="1.5" />
                <line x1="0" y1="170" x2="600" y2="170" stroke="#dde4ed" strokeWidth="1.5" />
                <line x1="0" y1="255" x2="600" y2="255" stroke="#dde4ed" strokeWidth="1.5" />
                <line x1="150" y1="0" x2="150" y2="340" stroke="#dde4ed" strokeWidth="1.5" />
                <line x1="300" y1="0" x2="300" y2="340" stroke="#dde4ed" strokeWidth="1.5" />
                <line x1="450" y1="0" x2="450" y2="340" stroke="#dde4ed" strokeWidth="1.5" />
                {/* Roads */}
                <line x1="60" y1="0" x2="60" y2="340" stroke="#d0d8e3" strokeWidth="8" strokeLinecap="round" />
                <line x1="0" y1="200" x2="600" y2="200" stroke="#d0d8e3" strokeWidth="8" strokeLinecap="round" />
                <line x1="200" y1="0" x2="380" y2="340" stroke="#d0d8e3" strokeWidth="6" strokeLinecap="round" />
                <line x1="400" y1="60" x2="580" y2="280" stroke="#d0d8e3" strokeWidth="6" strokeLinecap="round" />
                {/* Route line */}
                <path d="M120 280 Q250 150 300 190 Q350 230 420 120" stroke="#137fec" strokeWidth="3" strokeDasharray="8 4" fill="none" />
              </svg>
              {/* Markers */}
              <div style={{ position: 'absolute', left: 115, top: 175, transform: 'translate(-50%,-100%)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#137fec', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(19,127,236,0.4)' }}>
                  <MapPin style={{ width: 14, height: 14, color: '#fff' }} />
                </div>
              </div>
              <div style={{ position: 'absolute', left: 410, top: 260, transform: 'translate(-50%,-100%)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}>
                  <MapPin style={{ width: 14, height: 14, color: '#fff' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right — Pickup Points + Vehicle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Pickup Points */}
            <div style={{ ...card, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Pickup Points</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>
                Select a stop for {selectedStudent?.first_name || 'your child'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {routeStops.map((stop) => {
                  const isSelected = selectedStop === stop.name;
                  return (
                    <div
                      key={stop.name}
                      onClick={() => setSelectedStop(stop.name)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: isSelected ? '2px solid #137fec' : '1px solid #e2e8f0',
                        background: isSelected ? '#eff6ff' : '#fff',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: isSelected ? '#137fec' : '#f1f5f9',
                      }}>
                        <MapPin style={{ width: 15, height: 15, color: isSelected ? '#fff' : '#94a3b8' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{stop.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>Pickup: {stop.time}</div>
                      </div>
                      {/* Radio circle */}
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        border: isSelected ? '6px solid #137fec' : '2px solid #cbd5e1',
                        background: '#fff',
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Vehicle Card */}
            <div style={{
              padding: 20, borderRadius: 12, background: '#eff6ff', border: '1px solid #dbeafe',
            }}>
              <div style={{
                display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#137fec', background: '#dbeafe',
                padding: '3px 10px', borderRadius: 4, marginBottom: 10,
              }}>
                SELECTED VEHICLE
              </div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>
                {routeVehicle ? `${routeVehicle.make} ${routeVehicle.model}` : demoVehicle.name}
              </h4>
              <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', margin: '0 0 12px' }}>
                {routeVehicle ? `${routeVehicle.vehicle_type}` : demoVehicle.desc}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Driver</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {routeVehicle?.Driver ? `${routeVehicle.Driver.first_name} ${routeVehicle.Driver.last_name}` : demoVehicle.driver}
                  </div>
                </div>
                <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Capacity</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {routeVehicle ? `${routeVehicle.capacity} Seats` : `${demoVehicle.filled} / ${demoVehicle.capacity} Seats`}
                  </div>
                </div>
              </div>
              {/* Bus icon top-right */}
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <Bus style={{ width: 20, height: 20, color: '#94a3b8' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Select Bus / Schedule ── */}
      {step === 2 && (
        <div style={{ ...card, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Select Schedule</h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>Choose your booking type and start date</p>

          {/* Booking Type */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Booking Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 400 }}>
              {[
                { value: 'one_way', label: 'One Way', desc: 'School pickup only' },
                { value: 'round_trip', label: 'Round Trip', desc: 'Pickup + Drop-off' },
              ].map((t) => (
                <div
                  key={t.value}
                  onClick={() => setBookingType(t.value)}
                  style={{
                    padding: 16, borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    border: bookingType === t.value ? '2px solid #137fec' : '1px solid #e2e8f0',
                    background: bookingType === t.value ? '#eff6ff' : '#fff',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: bookingType === t.value ? '#137fec' : '#1e293b' }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 400 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Start Date
              </label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Pickup Time
              </label>
              <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Schedule preview */}
          <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Clock style={{ width: 16, height: 16, color: '#137fec' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Schedule Preview</span>
            </div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
              <div>Mon-Fri, {pickupTime || '7:15'} AM (Pickup)</div>
              {bookingType === 'round_trip' && <div>Mon-Fri, 3:45 PM (Drop-off)</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review ── */}
      {step === 3 && (
        <div style={{ ...card, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Review Your Booking</h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>Please confirm all details before submitting</p>

          {error && (
            <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Left summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Student */}
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Users style={{ width: 16, height: 16, color: '#137fec' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{selectedStudent?.first_name} {selectedStudent?.last_name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{selectedStudent?.school_name || ''} • Grade {selectedStudent?.grade}</div>
              </div>

              {/* Schedule */}
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Clock style={{ width: 16, height: 16, color: '#f59e0b' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schedule</span>
                </div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
                  <div>Mon-Fri, {pickupTime || '7:15'} AM (Pickup)</div>
                  {bookingType === 'round_trip' && <div>Mon-Fri, 3:45 PM (Drop-off)</div>}
                </div>
              </div>

              {/* Stops */}
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <MapPin style={{ width: 16, height: 16, color: '#10b981' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stops</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                  {selectedStop} to {selectedRoute?.end_location || 'School'}
                </div>
              </div>
            </div>

            {/* Right — Pricing */}
            <div style={{ ...card, padding: 20 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>Pricing Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Monthly Base Fare</span>
                  <span style={{ fontWeight: 600 }}>${selectedRoute?.price ? Number(selectedRoute.price).toFixed(2) : '120.00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Early Booking Discount</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>-$10.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Service Fee (2.5%)</span>
                  <span style={{ fontWeight: 600 }}>$2.75</span>
                </div>
                <div style={{ height: 1, background: '#e2e8f0', margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Total Amount</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#137fec' }}>
                      ${selectedRoute?.price ? (Number(selectedRoute.price) - 10 + 2.75).toFixed(2) : '112.75'}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>USD PER MONTH</div>
                  </div>
                </div>
              </div>

              {/* Security note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <Shield style={{ width: 16, height: 16, color: '#94a3b8', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Secure 256-bit SSL Encrypted Payment</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Navigation Buttons ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <button
          onClick={() => (step === 0 ? navigate('/book-transport') : setStep(step - 1))}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 32px',
            borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: '#fff', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer',
          }}
        >
          Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => { if (canGoNext()) setStep(step + 1); }}
            disabled={!canGoNext()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 40px',
              borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: canGoNext() ? '#137fec' : '#94a3b8', color: '#fff',
              border: 'none', cursor: canGoNext() ? 'pointer' : 'not-allowed',
            }}
          >
            Next Step <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 40px',
              borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Submitting...' : 'Confirm Booking'}
            {!submitting && <CheckCircle style={{ width: 16, height: 16 }} />}
          </button>
        )}
      </div>

      {/* ═══ Footer ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', padding: '8px 0', borderTop: '1px solid #f1f5f9' }}>
        <span>© 2024 Azure Transit Management Systems. All security checks enabled.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            Server Status: Online
          </span>
          <a href="#" style={{ color: '#137fec', textDecoration: 'none' }}>Privacy</a>
        </div>
      </div>
    </div>
  );
}
