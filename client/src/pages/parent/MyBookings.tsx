import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  Calendar,
  Search,
  Eye,
  XCircle,
  X,
  MapPin,
  Clock,
  Bus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Booking } from '../../types';

/* ─── Status colours (Tailwind classes) ─── */
const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  pending:     { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-400',  label: 'Pending' },
  confirmed:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500',   label: 'Confirmed' },
  in_progress: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500',  label: 'In Progress' },
  completed:   { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200',  dot: 'bg-slate-400',  label: 'Completed' },
  cancelled:   { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-500',    label: 'Cancelled' },
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      const raw = res.data.data;
      setBookings(Array.isArray(raw) ? raw : (raw?.bookings || []));
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/status`, { status: 'cancelled' });
      fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const ref = b.booking_reference || '';
    const pickup = b.pickup_location || '';
    const dropoff = b.dropoff_location || '';
    const matchesSearch =
      ref.toLowerCase().includes(search.toLowerCase()) ||
      pickup.toLowerCase().includes(search.toLowerCase()) ||
      dropoff.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage your transport bookings</p>
      </div>

      {/* ─── Search & Filter ─── */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or location..."
            className="w-full h-11 pl-10 pr-3.5 text-sm border border-slate-200 rounded-[10px] bg-white outline-none text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 px-3.5 pr-9 text-sm border border-slate-200 rounded-[10px] bg-white text-slate-800 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ─── Content ─── */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-[60px] px-6 text-center">
          <div className="w-[72px] h-[72px] rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <Calendar className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1.5">No bookings found</h3>
          <p className="text-sm text-slate-400 mb-6">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Book your first transport to get started'}
          </p>
          {!(search || statusFilter !== 'all') && (
            <button
              onClick={() => navigate('/book-transport')}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-[10px] text-sm font-semibold bg-primary text-white border-none cursor-pointer hover:bg-blue-600 transition"
            >
              <Bus className="w-[18px] h-[18px]" />
              Book Transport
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Reference', 'Student', 'Route', 'Type', 'Date', 'Status', 'Fare', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const sc = statusConfig[booking.status] || statusConfig.pending;
                  return (
                    <tr key={booking.id} className="border-b border-slate-100">
                      <td className="px-4 py-3.5 text-[13px] font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {booking.booking_reference}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                        {booking.Student ? `${booking.Student.first_name} ${booking.Student.last_name}` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                        {booking.Route?.name || booking.Route?.route_name || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap capitalize">
                        {booking.booking_type.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                        {new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 whitespace-nowrap">
                        ${booking.fare_amount ? Number(booking.fare_amount).toFixed(2) : '0.00'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            title="View Details"
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50 transition"
                          >
                            <Eye className="w-[15px] h-[15px] text-slate-500" />
                          </button>
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              title="Cancel Booking"
                              className="w-8 h-8 rounded-lg border border-red-200 bg-white flex items-center justify-center cursor-pointer hover:bg-red-50 transition"
                            >
                              <XCircle className="w-[15px] h-[15px] text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[13px] text-slate-400">
            <span>Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-md border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50">
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-8 h-8 rounded-md border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Booking Detail Modal ─── */}
      {selectedBooking && (() => {
        const sc = statusConfig[selectedBooking.status] || statusConfig.pending;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/45" onClick={() => setSelectedBooking(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-5">
                {/* Reference + Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Reference</div>
                    <div className="text-[15px] font-bold text-slate-800 font-mono">{selectedBooking.booking_reference}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </div>

                {/* Student Info */}
                {selectedBooking.Student && (
                  <div className="p-4 bg-slate-50 rounded-[10px] border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-sm text-primary">
                        {selectedBooking.Student.first_name[0]}{selectedBooking.Student.last_name[0]}
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold text-slate-800">
                          {selectedBooking.Student.first_name} {selectedBooking.Student.last_name}
                        </div>
                        <div className="text-[13px] text-slate-500">
                          {selectedBooking.Student.school_name || 'Student'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Route / Stops */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-green-500" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold">Pickup</div>
                      <div className="text-sm font-medium text-slate-800">{selectedBooking.pickup_location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold">Drop-off</div>
                      <div className="text-sm font-medium text-slate-800">{selectedBooking.dropoff_location}</div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Type</div>
                    <div className="text-sm font-semibold text-slate-800 capitalize">{selectedBooking.booking_type.replace('_', ' ')}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Date</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {new Date(selectedBooking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Pickup Time</div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {selectedBooking.pickup_time}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Route</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {selectedBooking.Route?.name || selectedBooking.Route?.route_name || '—'}
                    </div>
                  </div>
                </div>

                {/* Fare */}
                <div className="flex items-center justify-between px-5 py-4 bg-blue-50 rounded-[10px] border border-blue-100">
                  <span className="text-sm font-semibold text-slate-800">Total Fare</span>
                  <span className="text-[22px] font-extrabold text-primary">
                    ${selectedBooking.fare_amount ? Number(selectedBooking.fare_amount).toFixed(2) : '0.00'}
                  </span>
                </div>

                {/* Actions */}
                {['pending', 'confirmed'].includes(selectedBooking.status) && (
                  <button
                    onClick={() => {
                      handleCancel(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                    className="w-full py-3 rounded-[10px] text-sm font-semibold cursor-pointer bg-white text-red-500 border border-red-200 hover:bg-red-50 transition"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
