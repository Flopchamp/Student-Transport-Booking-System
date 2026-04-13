import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import {
  Users,
  MapPin,
  Calendar,
  Phone,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface DriverBooking {
  id: string;
  booking_reference: string;
  status: string;
  start_date: string;
  end_date?: string;
  pickup_time: string;
  student: { id: string; first_name: string; last_name: string; school_name: string; grade: string; pickup_address: string; special_needs: string | null };
  route: { id: string; name: string; start_location: string; end_location: string };
  parent: { id: string; first_name: string; last_name: string; phone: string; email: string };
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function DriverBookings() {
  const [bookings, setBookings] = useState<DriverBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/driver-portal/bookings', { params });
      const data = res.data.data;
      setBookings(data.bookings || []);
      setTotalPages(res.data.pagination?.totalPages || res.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Bookings assigned to you by admin</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800">No bookings found</h3>
          <p className="text-sm text-slate-400 mt-1">You have no assigned bookings with the selected filter.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        {b.student.first_name} {b.student.last_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[b.status] || 'bg-slate-100 text-slate-500'}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{b.booking_reference}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-700">{b.pickup_time}</div>
                    <div className="text-xs text-slate-400">{new Date(b.start_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.route.name}: {b.route.start_location} → {b.route.end_location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pickup: {b.student.pickup_address || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.student.school_name} • Grade {b.student.grade}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Parent: {b.parent.first_name} {b.parent.last_name}</span>
                    <a href={`tel:${b.parent.phone}`} className="text-blue-600 hover:underline ml-0.5">
                      {b.parent.phone}
                    </a>
                  </div>
                </div>

                {b.student.special_needs && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Special needs: {b.student.special_needs}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
