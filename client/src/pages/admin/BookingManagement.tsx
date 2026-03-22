import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Calendar,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
} from 'lucide-react';
import type { Booking } from '../../types';

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      in_progress: 'bg-green-50 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status] || styles.pending;
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.booking_reference.toLowerCase().includes(search.toLowerCase()) ||
      b.pickup_location.toLowerCase().includes(search.toLowerCase()) ||
      b.dropoff_location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

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
        <h1 className="text-2xl font-bold text-text">Booking Management</h1>
        <p className="text-text-secondary mt-1">Manage all transport bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-text">{bookings.length}</p>
              <p className="text-xs text-text-muted">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-text">{pendingCount}</p>
              <p className="text-xs text-text-muted">Pending</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-text">{confirmedCount}</p>
              <p className="text-xs text-text-muted">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-text">{completedCount}</p>
              <p className="text-xs text-text-muted">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings..."
              className="w-full pl-11 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Reference</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Parent</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Student</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Route</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Fare</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No bookings found</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-border hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-text">{booking.booking_reference}</td>
                    <td className="px-6 py-4 text-sm text-text">
                      {booking.User ? `${booking.User.first_name} ${booking.User.last_name}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-text">
                      {booking.Student ? `${booking.Student.first_name} ${booking.Student.last_name}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {booking.Route?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(booking.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text">
                      ${booking.fare_amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedBooking(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Reference</span>
                <span className="text-sm font-mono font-medium">{selectedBooking.booking_reference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Status</span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(selectedBooking.status)}`}>
                  {selectedBooking.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Parent</span>
                <span className="text-sm text-text">
                  {selectedBooking.User ? `${selectedBooking.User.first_name} ${selectedBooking.User.last_name}` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Student</span>
                <span className="text-sm text-text">
                  {selectedBooking.Student ? `${selectedBooking.Student.first_name} ${selectedBooking.Student.last_name}` : '-'}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-text-secondary">{selectedBooking.pickup_location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-text-secondary">{selectedBooking.dropoff_location}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Date</span>
                <span className="text-sm text-text">{new Date(selectedBooking.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-medium text-text">Total Fare</span>
                <span className="text-lg font-bold text-primary">${selectedBooking.fare_amount?.toLocaleString()}</span>
              </div>

              {/* Actions */}
              {selectedBooking.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, 'confirmed');
                      setSelectedBooking(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, 'cancelled');
                      setSelectedBooking(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
