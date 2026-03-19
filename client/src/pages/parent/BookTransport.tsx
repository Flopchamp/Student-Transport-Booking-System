import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  MapPin,
  Search,
  Clock,
  Bus,
  Users,
  DollarSign,
  Filter,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import type { Route, Student } from '../../types';

export default function BookTransport() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    student_id: '',
    booking_type: 'round_trip',
    start_date: '',
    pickup_time: '07:00',
    pickup_location: '',
    dropoff_location: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [routesRes, studentsRes] = await Promise.all([
        api.get('/transport/routes'),
        api.get('/students'),
      ]);
      setRoutes(routesRes.data.data || []);
      setStudents(studentsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoute = (route: Route) => {
    setSelectedRoute(route);
    setBookingForm({
      ...bookingForm,
      pickup_location: route.start_location,
      dropoff_location: route.end_location,
    });
    setError('');
    setSuccess('');
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;
    setSubmitting(true);
    setError('');

    try {
      await api.post('/bookings', {
        student_id: parseInt(bookingForm.student_id),
        route_id: selectedRoute.id,
        booking_type: bookingForm.booking_type,
        start_date: bookingForm.start_date,
        pickup_time: bookingForm.pickup_time,
        pickup_location: bookingForm.pickup_location,
        dropoff_location: bookingForm.dropoff_location,
        notes: bookingForm.notes || undefined,
      });
      setSuccess('Booking created successfully!');
      setTimeout(() => {
        setShowBookingModal(false);
        setSuccess('');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRoutes = routes.filter(
    (r) =>
      r.route_name.toLowerCase().includes(search.toLowerCase()) ||
      r.start_location.toLowerCase().includes(search.toLowerCase()) ||
      r.end_location.toLowerCase().includes(search.toLowerCase()) ||
      r.route_number.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Book School Transport</h1>
        <p className="text-text-secondary mt-1">Find and book a transport route for your child</p>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search routes by name, location..."
              className="w-full pl-11 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Route Cards */}
      {filteredRoutes.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-text mb-1">No routes found</h3>
          <p className="text-sm text-text-muted">
            {search ? 'Try a different search term' : 'No routes are available at the moment'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRoutes.map((route) => (
            <div key={route.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Route Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Bus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text">{route.route_name}</h3>
                      <p className="text-xs text-text-muted">Route #{route.route_number}</p>
                    </div>
                  </div>

                  {/* Route Path */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>{route.start_location}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>{route.end_location}</span>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {route.estimated_duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {route.distance_km} km
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {route.stops?.length || 0} stops
                    </span>
                  </div>
                </div>

                {/* Price & Book */}
                <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                  <div className="text-right">
                    <p className="text-xl font-bold text-text">KES {route.fare_amount?.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">per trip</p>
                  </div>
                  <button
                    onClick={() => handleBookRoute(route)}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              {/* Stops */}
              {route.stops && route.stops.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-text-muted mb-2">Stops:</p>
                  <div className="flex flex-wrap gap-2">
                    {route.stops.map((stop, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-text-secondary">
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowBookingModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-border flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-text">Book Transport</h2>
              <button onClick={() => setShowBookingModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <span className="text-gray-500 text-xl">×</span>
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text mb-2">Booking Confirmed!</h3>
                <p className="text-sm text-text-secondary">{success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
                {/* Route Summary */}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Bus className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-primary">{selectedRoute.route_name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <span>{selectedRoute.start_location}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>{selectedRoute.end_location}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <DollarSign className="w-3 h-3 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">KES {selectedRoute.fare_amount?.toLocaleString()}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Student */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                  <select
                    value={bookingForm.student_id}
                    onChange={(e) => setBookingForm({ ...bookingForm, student_id: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Choose a student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} - Grade {s.grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Booking Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booking Type</label>
                  <div className="flex gap-3">
                    {['one_way', 'round_trip'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, booking_type: type })}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                          bookingForm.booking_type === type
                            ? 'border-primary bg-blue-50 text-primary'
                            : 'border-border text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {type === 'one_way' ? 'One Way' : 'Round Trip'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={bookingForm.start_date}
                      onChange={(e) => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
                    <input
                      type="time"
                      value={bookingForm.pickup_time}
                      onChange={(e) => setBookingForm({ ...bookingForm, pickup_time: e.target.value })}
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                  <input
                    type="text"
                    value={bookingForm.pickup_location}
                    onChange={(e) => setBookingForm({ ...bookingForm, pickup_location: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Location</label>
                  <input
                    type="text"
                    value={bookingForm.dropoff_location}
                    onChange={(e) => setBookingForm({ ...bookingForm, dropoff_location: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Any special instructions..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
                  >
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
