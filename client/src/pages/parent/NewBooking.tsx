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
import type { Route, Student } from '../../types';

export default function NewBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedRoute = (location.state as { route?: Route })?.route || null;

  const [step, setStep] = useState(passedRoute ? 1 : 0);
  const [students, setStudents] = useState<Student[]>([]);
  const [, setAvailableRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedRoute] = useState<Route | null>(passedRoute);
  const [selectedStop, setSelectedStop] = useState<string>('');
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
      const [studentsRes, routesRes] = await Promise.all([
        api.get('/students').catch(() => ({ data: { data: {} } })),
        api.get('/routes').catch(() => ({ data: { data: {} } })),
      ]);
      const rawS = studentsRes.data.data;
      const rawR = routesRes.data.data;
      setStudents(Array.isArray(rawS) ? rawS : (rawS?.students || []));
      setAvailableRoutes(Array.isArray(rawR) ? rawR : (rawR?.routes || []));
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
        start_date: startDate || new Date().toISOString().split('T')[0],
        pickup_time: pickupTime,
        dropoff_time: bookingType === 'round_trip' ? '15:45' : undefined,
        notes: selectedStop ? `Pickup stop: ${selectedStop}` : undefined,
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
  const displayStudents = students;

  // Route stops
  const routeStops: { name: string; time: string }[] =
    selectedRoute?.stops && selectedRoute.stops.length > 0
      ? selectedRoute.stops.map((s: string | { name?: string; address?: string }, i: number) => ({
          name: typeof s === 'string' ? s : (s as { name?: string }).name || `Stop ${i + 1}`,
          time: `07:${String(15 + i * 15).padStart(2, '0')} AM`,
        }))
      : [];

  // Vehicle info is not available from the route — assigned by admin after booking
  const routeVehicle = null as { make?: string; model?: string; plate_number?: string; capacity?: number; Driver?: { first_name: string; last_name: string } } | null;

  /* ─── Steps ─── */
  const steps = [
    { num: 1, label: 'SELECT STUDENT' },
    { num: 2, label: 'CHOOSE ROUTE' },
    { num: 3, label: 'SELECT BUS' },
    { num: 4, label: 'REVIEW' },
  ];

  const canGoNext = (): boolean => {
    if (step === 0) return !!selectedStudent;
    if (step === 1) return !!selectedRoute && (!!selectedStop || routeStops.length === 0);
    if (step === 2) return true;
    return true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <CheckCircle className="w-16 h-16 text-emerald-500" />
        <h2 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Your transport booking for <strong>{selectedStudent?.first_name}</strong> has been submitted.
          You'll receive a confirmation once approved.
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate('/my-bookings')}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate('/book-transport')}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ═══ Header ═══ */}
      <div>
        <span className="text-sm font-semibold text-blue-600">New Booking</span>
      </div>

      {/* ═══ 4-Step Progress ═══ */}
      <div className="flex items-start justify-center">
        {steps.map((s, i) => {
          const isCompleted = step > i;
          const isActive = step === i;
          return (
            <div key={s.num} className="flex items-center">
              {i > 0 && (
                <div className={`w-18 h-0.5 mb-5 ${isCompleted ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
              <div className="flex flex-col items-center gap-1.5 min-w-20">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                  ${isCompleted || isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4.5 h-4.5" /> : s.num}
                </div>
                <span className={`text-[10px] font-bold tracking-wider uppercase
                  ${isCompleted || isActive ? 'text-blue-600' : 'text-slate-400'}`}
                >
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Select a Student</h2>
          <p className="text-sm text-slate-500 mb-5">Choose which child you're booking transport for</p>

          <div className="flex flex-col gap-3">
            {displayStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No students registered yet.</p>
                <button
                  onClick={() => navigate('/students', { state: { openAddModal: true } })}
                  className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold border-none cursor-pointer hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" /> Add Your First Student
                </button>
              </div>
            ) : (
            displayStudents.map((s) => {
              const isSelected = selectedStudent?.id === s.id;
              const initials = s.first_name[0] + s.last_name[0];
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudent(s as Student)}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all
                    ${isSelected
                      ? 'border-2 border-blue-600 bg-blue-50'
                      : 'border border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold text-base
                    ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold text-slate-800">{s.first_name} {s.last_name}</div>
                    <div className="text-[13px] text-slate-500">{s.school_name} • Grade {s.grade}</div>
                  </div>
                  <div className={`w-5.5 h-5.5 rounded-full shrink-0 flex items-center justify-center
                    ${isSelected ? 'bg-blue-600' : 'border-2 border-slate-300'}`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              );
            })
            )}
          </div>

          {/* Add new student link */}
          <button
            onClick={() => navigate('/students', { state: { openAddModal: true } })}
            className="flex items-center gap-2 mt-4 py-2.5 bg-transparent border-none cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Add New Student
          </button>
        </div>
      )}

      {/* ── STEP 1: Choose Route + Pickup Points ── */}
      {step === 1 && (
        <div className="grid grid-cols-[1fr_340px] gap-5 items-start">
          {/* Left — Map / Route Area */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Route Area: {selectedRoute?.name || 'Downtown Hub'}
                </h3>
                <p className="text-[13px] text-slate-400 mt-0.5">
                  Visualizing stops for Route {selectedRoute?.name || 'B-12'}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button className="w-8 h-8 rounded-md border border-slate-200 bg-white cursor-pointer flex items-center justify-center hover:bg-slate-50">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button className="w-8 h-8 rounded-md border border-slate-200 bg-white cursor-pointer flex items-center justify-center hover:bg-slate-50">
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
            {/* Map placeholder */}
            <div className="h-85 bg-slate-100 relative overflow-hidden">
              {/* Stylized map roads */}
              <svg width="100%" height="100%" viewBox="0 0 600 340" fill="none" className="absolute inset-0">
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
              <div className="absolute left-28.75 top-43.75 -translate-x-1/2 -translate-y-full">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_2px_8px_rgba(19,127,236,0.4)]">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="absolute left-102.5 top-65 -translate-x-1/2 -translate-y-full">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Right — Pickup Points + Vehicle */}
          <div className="flex flex-col gap-4">
            {/* Pickup Points */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-bold text-slate-800 mb-1">Pickup Points</h3>
              <p className="text-[13px] text-slate-400 mb-4">
                Select a stop for {selectedStudent?.first_name || 'your child'}
              </p>

              <div className="flex flex-col gap-2.5">
                {routeStops.map((stop) => {
                  const isSelected = selectedStop === stop.name;
                  return (
                    <div
                      key={stop.name}
                      onClick={() => setSelectedStop(stop.name)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-all
                        ${isSelected
                          ? 'border-2 border-blue-600 bg-blue-50'
                          : 'border border-slate-200 bg-white hover:border-slate-300'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center
                        ${isSelected ? 'bg-blue-600' : 'bg-slate-100'}`}
                      >
                        <MapPin className={`w-3.75 h-3.75 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800">{stop.name}</div>
                        <div className="text-xs text-slate-400">Pickup: {stop.time}</div>
                      </div>
                      {/* Radio circle */}
                      <div className={`w-5 h-5 rounded-full shrink-0 bg-white
                        ${isSelected ? 'border-[6px] border-blue-600' : 'border-2 border-slate-300'}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Vehicle Card */}
            <div className="relative p-5 rounded-xl bg-blue-50 border border-blue-100">
              <div className="inline-block text-[10px] font-bold tracking-wider uppercase text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded mb-2.5">
                SELECTED VEHICLE
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-0.5">
                {routeVehicle ? `${routeVehicle.make} ${routeVehicle.model}` : 'No vehicle assigned'}
              </h4>
              <p className="text-[13px] text-slate-500 italic mb-3">
                {routeVehicle ? `${routeVehicle.plate_number}` : 'Vehicle details pending'}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white rounded-lg px-3 py-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Driver</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {routeVehicle?.Driver ? `${routeVehicle.Driver.first_name} ${routeVehicle.Driver.last_name}` : 'TBD'}
                  </div>
                </div>
                <div className="bg-white rounded-lg px-3 py-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Capacity</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {routeVehicle ? `${routeVehicle.capacity} Seats` : '—'}
                  </div>
                </div>
              </div>
              {/* Bus icon top-right */}
              <div className="absolute top-3 right-3">
                <Bus className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Select Bus / Schedule ── */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Select Schedule</h2>
          <p className="text-sm text-slate-500 mb-6">Choose your booking type and start date</p>

          {/* Booking Type */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Booking Type
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {[
                { value: 'one_way', label: 'One Way', desc: 'School pickup only' },
                { value: 'round_trip', label: 'Round Trip', desc: 'Pickup + Drop-off' },
              ].map((t) => (
                <div
                  key={t.value}
                  onClick={() => setBookingType(t.value)}
                  className={`p-4 rounded-xl cursor-pointer text-center transition-all
                    ${bookingType === t.value
                      ? 'border-2 border-blue-600 bg-blue-50'
                      : 'border border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className={`text-sm font-semibold ${bookingType === t.value ? 'text-blue-600' : 'text-slate-800'}`}>{t.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-3.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Pickup Time
              </label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full h-11 px-3.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Schedule preview */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-800">Schedule Preview</span>
            </div>
            <div className="text-[13px] text-slate-600 leading-relaxed">
              <div>Mon-Fri, {pickupTime || '7:15'} AM (Pickup)</div>
              {bookingType === 'round_trip' && <div>Mon-Fri, 3:45 PM (Drop-off)</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review ── */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Review Your Booking</h2>
          <p className="text-sm text-slate-500 mb-6">Please confirm all details before submitting</p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px] mb-5">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            {/* Left summary */}
            <div className="flex flex-col gap-4">
              {/* Student */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Student</span>
                </div>
                <div className="text-[15px] font-semibold text-slate-800">{selectedStudent?.first_name} {selectedStudent?.last_name}</div>
                <div className="text-[13px] text-slate-500">{selectedStudent?.school_name || ''} • Grade {selectedStudent?.grade}</div>
              </div>

              {/* Schedule */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Schedule</span>
                </div>
                <div className="text-[13px] text-slate-600 leading-relaxed">
                  <div>Mon-Fri, {pickupTime || '7:15'} AM (Pickup)</div>
                  {bookingType === 'round_trip' && <div>Mon-Fri, 3:45 PM (Drop-off)</div>}
                </div>
              </div>

              {/* Stops */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Stops</span>
                </div>
                <div className="text-sm font-medium text-slate-800">
                  {selectedStop} to {selectedRoute?.end_location || 'School'}
                </div>
              </div>
            </div>

            {/* Right — Pricing */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-[15px] font-bold text-slate-800 mb-4">Pricing Breakdown</h4>
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Monthly Base Fare</span>
                  <span className="font-semibold">${selectedRoute?.price ? Number(selectedRoute.price).toFixed(2) : '120.00'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Early Booking Discount</span>
                  <span className="font-semibold text-emerald-500">-$10.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Service Fee (2.5%)</span>
                  <span className="font-semibold">$2.75</span>
                </div>
                <div className="h-px bg-slate-200 my-1.5" />
                <div className="flex justify-between items-baseline">
                  <span className="text-[15px] font-bold text-slate-800">Total Amount</span>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-blue-600">
                      ${selectedRoute?.price ? (Number(selectedRoute.price) - 10 + 2.75).toFixed(2) : '112.75'}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">USD PER MONTH</div>
                  </div>
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 mt-4 p-3 bg-slate-50 rounded-lg">
                <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-400">Secure 256-bit SSL Encrypted Payment</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Navigation Buttons ═══ */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => (step === 0 ? navigate('/book-transport') : setStep(step - 1))}
          className="flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold bg-white text-slate-600 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => { if (canGoNext()) setStep(step + 1); }}
            disabled={!canGoNext()}
            className={`flex items-center gap-2 px-10 py-3 rounded-lg text-sm font-semibold text-white border-none transition-colors
              ${canGoNext()
                ? 'bg-blue-600 cursor-pointer hover:bg-blue-700'
                : 'bg-slate-400 cursor-not-allowed'
              }`}
          >
            Next Step <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex items-center gap-2 px-10 py-3 rounded-lg text-sm font-semibold text-white border-none bg-emerald-500 cursor-pointer hover:bg-emerald-600 transition-colors
              ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Submitting...' : 'Confirm Booking'}
            {!submitting && <CheckCircle className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* ═══ Footer ═══ */}
      <div className="flex items-center justify-between text-xs text-slate-400 py-2 border-t border-slate-100">
        <span>© 2024 Azure Transit Management Systems. All security checks enabled.</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Server Status: Online
          </span>
          <a href="#" className="text-blue-600 no-underline hover:underline">Privacy</a>
        </div>
      </div>
    </div>
  );
}
