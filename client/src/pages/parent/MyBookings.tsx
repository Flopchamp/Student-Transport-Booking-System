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

/* ─── Status colours ─── */
const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  pending:     { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b', label: 'Pending' },
  confirmed:   { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6', label: 'Confirmed' },
  in_progress: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: '#22c55e', label: 'In Progress' },
  completed:   { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#94a3b8', label: 'Completed' },
  cancelled:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', dot: '#ef4444', label: 'Cancelled' },
};

export default function MyBookings() {
  const navigate = useNavigate();
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

  /* ─── Styles ─── */
  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 44,
    padding: '0 14px 0 42px',
    fontSize: 14,
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    background: '#fff',
    outline: 'none',
    color: '#1e293b',
  };
  const selectStyle: React.CSSProperties = {
    height: 44,
    padding: '0 36px 0 14px',
    fontSize: 14,
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    background: '#fff',
    outline: 'none',
    color: '#1e293b',
    appearance: 'none' as React.CSSProperties['appearance'],
    backgroundImage:
      'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    cursor: 'pointer',
  };
  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: 11,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: 14,
    color: '#475569',
    whiteSpace: 'nowrap',
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
      {/* ═══ Header ═══ */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>My Bookings</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>View and manage your transport bookings</p>
      </div>

      {/* ═══ Search & Filter ═══ */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or location..."
            style={inputStyle}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ═══ Content ═══ */}
      {filteredBookings.length === 0 ? (
        /* ─── Empty State ─── */
        <div style={{ ...card, padding: '60px 24px', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16, background: '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Calendar style={{ width: 36, height: 36, color: '#cbd5e1' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>No bookings found</h3>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 24px' }}>
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Book your first transport to get started'}
          </p>
          {!(search || statusFilter !== 'all') && (
            <button
              onClick={() => navigate('/book-transport')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: '#137fec', color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              <Bus style={{ width: 18, height: 18 }} />
              Book Transport
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>
      ) : (
        /* ─── Bookings Table ─── */
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={thStyle}>Reference</th>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Route</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Fare</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const sc = statusConfig[booking.status] || statusConfig.pending;
                  return (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
                        {booking.booking_reference}
                      </td>
                      <td style={tdStyle}>
                        {booking.Student
                          ? `${booking.Student.first_name} ${booking.Student.last_name}`
                          : '—'}
                      </td>
                      <td style={tdStyle}>
                        {booking.Route?.name || booking.Route?.route_name || '—'}
                      </td>
                      <td style={{ ...tdStyle, textTransform: 'capitalize' }}>
                        {booking.booking_type.replace('_', ' ')}
                      </td>
                      <td style={tdStyle}>
                        {new Date(booking.start_date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 12px', borderRadius: 20,
                          fontSize: 12, fontWeight: 600,
                          background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%', background: sc.dot,
                          }} />
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#1e293b' }}>
                        ${booking.fare_amount ? Number(booking.fare_amount).toFixed(2) : '0.00'}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            title="View Details"
                            style={{
                              width: 32, height: 32, borderRadius: 8,
                              border: '1px solid #e2e8f0', background: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Eye style={{ width: 15, height: 15, color: '#64748b' }} />
                          </button>
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              title="Cancel Booking"
                              style={{
                                width: 32, height: 32, borderRadius: 8,
                                border: '1px solid #fecaca', background: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <XCircle style={{ width: 15, height: 15, color: '#ef4444' }} />
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
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#94a3b8',
          }}>
            <span>Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{
                width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <ChevronLeft style={{ width: 16, height: 16, color: '#94a3b8' }} />
              </button>
              <button style={{
                width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <ChevronRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Booking Detail Modal ═══ */}
      {selectedBooking && (() => {
        const sc = statusConfig[selectedBooking.status] || statusConfig.pending;
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            {/* Backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)' }}
              onClick={() => setSelectedBooking(null)}
            />

            {/* Modal Card */}
            <div style={{
              position: 'relative', background: '#fff', borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 480,
              maxHeight: '90vh', overflowY: 'auto',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px', borderBottom: '1px solid #e2e8f0',
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: 16, height: 16, color: '#64748b' }} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Reference + Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                      Reference
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>
                      {selectedBooking.booking_reference}
                    </div>
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600,
                    background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }} />
                    {sc.label}
                  </span>
                </div>

                {/* Student Info */}
                {selectedBooking.Student && (
                  <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: '#dbeafe',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14, color: '#137fec',
                      }}>
                        {selectedBooking.Student.first_name[0]}{selectedBooking.Student.last_name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
                          {selectedBooking.Student.first_name} {selectedBooking.Student.last_name}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>
                          {selectedBooking.Student.school_name || 'Student'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Route / Stops */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#475569' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin style={{ width: 14, height: 14, color: '#22c55e' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Pickup</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{selectedBooking.pickup_location}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#475569' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin style={{ width: 14, height: 14, color: '#ef4444' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Drop-off</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{selectedBooking.dropoff_location}</div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Type</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', textTransform: 'capitalize' }}>
                      {selectedBooking.booking_type.replace('_', ' ')}
                    </div>
                  </div>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Date</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                      {new Date(selectedBooking.start_date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Pickup Time</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                      <Clock style={{ width: 14, height: 14, color: '#64748b' }} />
                      {selectedBooking.pickup_time}
                    </div>
                  </div>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Route</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                      {selectedBooking.Route?.name || selectedBooking.Route?.route_name || '—'}
                    </div>
                  </div>
                </div>

                {/* Fare */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', background: '#eff6ff', borderRadius: 10, border: '1px solid #dbeafe',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Total Fare</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#137fec' }}>
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
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 10,
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      background: '#fff', color: '#ef4444', border: '1px solid #fecaca',
                    }}
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
