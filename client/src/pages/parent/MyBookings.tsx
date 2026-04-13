import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import {
  Calendar,
  Search,
  Eye,
  XCircle,
  MapPin,
  Bus,
  ArrowRight,
  History,
} from 'lucide-react';
import type { Booking } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';

type BookingTab = 'active' | 'history';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<BookingTab>('active');

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
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const ref = b.booking_reference || '';
    const routeName = b.route?.name || '';
    const studentName = b.student ? `${b.student.first_name} ${b.student.last_name}` : '';
    const matchesSearch =
      ref.toLowerCase().includes(search.toLowerCase()) ||
      routeName.toLowerCase().includes(search.toLowerCase()) ||
      studentName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    // Tab filtering
    const isActive = ['pending', 'confirmed'].includes(b.status);
    const matchesTab = activeTab === 'active' ? isActive : !isActive;

    return matchesSearch && matchesStatus && matchesTab;
  });

  const activeCount = bookings.filter((b) => ['pending', 'confirmed'].includes(b.status)).length;
  const historyCount = bookings.filter((b) => ['completed', 'cancelled'].includes(b.status)).length;

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

      {/* ─── Tabs ─── */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('active'); setStatusFilter('all'); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Active
          {activeCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-bold">{activeCount}</span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('history'); setStatusFilter('all'); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-4 h-4" />
          History
          {historyCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-bold">{historyCount}</span>
          )}
        </button>
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
          {activeTab === 'active' ? (
            <>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </>
          ) : (
            <>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </>
          )}
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
                  {['Reference', 'Student', 'Route', 'Date', 'Status', 'Amount', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-100">
                      <td className="px-4 py-3.5 text-[13px] font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {booking.booking_reference}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                        {booking.student ? `${booking.student.first_name} ${booking.student.last_name}` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                        {booking.route?.name || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                        {new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={booking.status} domain="booking" showDot withBorder />
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 whitespace-nowrap">
                        KES {Number(booking.amount || 0).toLocaleString()}
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[13px] text-slate-400">
            <span>Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* ─── Booking Detail Modal ─── */}
      <Modal
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        maxWidth="max-w-[480px]"
      >
        {selectedBooking && (
              <div className="p-6 flex flex-col gap-5">
                {/* Reference + Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Reference</div>
                    <div className="text-[15px] font-bold text-slate-800 font-mono">{selectedBooking.booking_reference}</div>
                  </div>
                  <StatusBadge status={selectedBooking.status} domain="booking" showDot withBorder />
                </div>

                {/* Student Info */}
                {selectedBooking.student && (
                  <div className="p-4 bg-slate-50 rounded-[10px] border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-sm text-primary">
                        {selectedBooking.student.first_name[0]}{selectedBooking.student.last_name[0]}
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold text-slate-800">
                          {selectedBooking.student.first_name} {selectedBooking.student.last_name}
                        </div>
                        <div className="text-[13px] text-slate-500">
                          {selectedBooking.student.school_name || 'Student'}
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
                      <div className="text-sm font-medium text-slate-800">{selectedBooking.route?.start_location || '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold">Drop-off</div>
                      <div className="text-sm font-medium text-slate-800">{selectedBooking.route?.end_location || '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Pickup Time</div>
                    <div className="text-sm font-semibold text-slate-800">{selectedBooking.pickup_time || '—'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Date</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {new Date(selectedBooking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Amount</div>
                    <div className="text-sm font-semibold text-slate-800">
                      KES {Number(selectedBooking.amount || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Route</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {selectedBooking.route?.name || '—'}
                    </div>
                  </div>
                </div>

                {/* Fare */}
                <div className="flex items-center justify-between px-5 py-4 bg-blue-50 rounded-[10px] border border-blue-100">
                  <span className="text-sm font-semibold text-slate-800">Total Fare</span>
                  <span className="text-[22px] font-extrabold text-primary">
                    KES {Number(selectedBooking.amount || 0).toLocaleString()}
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
        )}
      </Modal>
    </div>
  );
}
