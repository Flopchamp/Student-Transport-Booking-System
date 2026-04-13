import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import {
  DollarSign,
  Search,
  Eye,
  Calendar,
  Download,
  RotateCcw,
} from 'lucide-react';
import type { Payment } from '../../types';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments');
        const raw = res.data.data;
        setPayments(Array.isArray(raw) ? raw : (raw?.payments || []));
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const ref = p.transaction_reference || '';
    const bookingRef = p.booking?.booking_reference || '';
    const routeName = p.booking?.route?.name || '';
    const matchesSearch =
      ref.toLowerCase().includes(search.toLowerCase()) ||
      bookingRef.toLowerCase().includes(search.toLowerCase()) ||
      routeName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary stats from the loaded data
  const totalPaid = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingAmount = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payment History</h1>
        <p className="text-sm text-slate-500 mt-1">View all your payment transactions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">KES {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-0.5">Total Paid</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">KES {pendingAmount.toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-0.5">Pending</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{payments.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Total Transactions</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or route..."
            className="w-full h-11 pl-10 pr-3.5 text-sm border border-slate-200 rounded-[10px] bg-white outline-none text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 px-3.5 pr-9 text-sm border border-slate-200 rounded-[10px] bg-white text-slate-800 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refund_requested">Refund Requested</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-[60px] px-6 text-center">
          <div className="w-[72px] h-[72px] rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <DollarSign className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1.5">No payments found</h3>
          <p className="text-sm text-slate-400">
            {search || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No payments yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Reference', 'Booking', 'Route', 'Amount', 'Method', 'Status', 'Date', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 text-[13px] font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {payment.transaction_reference || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-mono text-slate-500 whitespace-nowrap">
                      {payment.booking?.booking_reference || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                      {payment.booking?.route?.name || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 whitespace-nowrap">
                      KES {Number(payment.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        payment.payment_method === 'mpesa'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {payment.payment_method === 'mpesa' ? 'M-Pesa' : 'Card'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={payment.status} domain="payment" showDot withBorder />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          title="View Details"
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50 transition"
                        >
                          <Eye className="w-[15px] h-[15px] text-slate-500" />
                        </button>
                        {(payment.status === 'completed' || payment.status === 'refunded') && (
                          <button
                            onClick={() => {
                              const token = localStorage.getItem('token');
                              window.open(
                                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/payments/${payment.id}/receipt?token=${token}`,
                                '_blank'
                              );
                            }}
                            title="Download Receipt"
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50 transition"
                          >
                            <Download className="w-[15px] h-[15px] text-emerald-500" />
                          </button>
                        )}
                        {payment.status === 'completed' && (
                          <button
                            onClick={async () => {
                              if (!confirm('Are you sure you want to request a refund for this payment?')) return;
                              try {
                                await api.patch(`/payments/${payment.id}/request-refund`);
                                toast.success('Refund request submitted successfully');
                                setPayments((prev) =>
                                  prev.map((p) =>
                                    p.id === payment.id ? { ...p, status: 'refund_requested' } : p
                                  )
                                );
                              } catch (err: unknown) {
                                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to request refund';
                                toast.error(msg);
                              }
                            }}
                            title="Request Refund"
                            className="w-8 h-8 rounded-lg border border-amber-200 bg-white flex items-center justify-center cursor-pointer hover:bg-amber-50 transition"
                          >
                            <RotateCcw className="w-[15px] h-[15px] text-amber-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[13px] text-slate-400">
            <span>Showing {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Payment Details"
        maxWidth="max-w-[480px]"
      >
        {selectedPayment && (
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Transaction</div>
                <div className="text-[15px] font-bold text-slate-800 font-mono">{selectedPayment.transaction_reference || '—'}</div>
              </div>
              <StatusBadge status={selectedPayment.status} domain="payment" showDot withBorder />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Amount</div>
                <div className="text-sm font-semibold text-slate-800">KES {Number(selectedPayment.amount || 0).toLocaleString()}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Method</div>
                <div className="text-sm font-semibold text-slate-800">{selectedPayment.payment_method === 'mpesa' ? 'M-Pesa' : 'Card'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Booking</div>
                <div className="text-sm font-semibold text-slate-800 font-mono">{selectedPayment.booking?.booking_reference || '—'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Route</div>
                <div className="text-sm font-semibold text-slate-800">{selectedPayment.booking?.route?.name || '—'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Date</div>
                <div className="text-sm font-semibold text-slate-800">
                  {(selectedPayment.paid_at ? new Date(selectedPayment.paid_at) : new Date(selectedPayment.createdAt))
                    .toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            {selectedPayment.mpesa_receipt_number && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="text-[11px] text-green-600 font-semibold uppercase mb-1">M-Pesa Receipt</div>
                <div className="text-sm font-bold text-green-800 font-mono">{selectedPayment.mpesa_receipt_number}</div>
              </div>
            )}
            {selectedPayment.stripe_payment_intent_id && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-[11px] text-blue-600 font-semibold uppercase mb-1">Stripe Payment ID</div>
                <div className="text-sm font-bold text-blue-800 font-mono">{selectedPayment.stripe_payment_intent_id}</div>
              </div>
            )}
            {selectedPayment.failure_reason && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="text-[11px] text-red-600 font-semibold uppercase mb-1">Failure Reason</div>
                <div className="text-sm text-red-700">{selectedPayment.failure_reason}</div>
              </div>
            )}

            {/* Total Fare Banner */}
            <div className="flex items-center justify-between px-5 py-4 bg-blue-50 rounded-[10px] border border-blue-100">
              <span className="text-sm font-semibold text-slate-800">Amount</span>
              <span className="text-[22px] font-extrabold text-primary">
                KES {Number(selectedPayment.amount || 0).toLocaleString()}
              </span>
            </div>

            {/* Download Receipt */}
            {(selectedPayment.status === 'completed' || selectedPayment.status === 'refunded') && (
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  window.open(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/payments/${selectedPayment.id}/receipt?token=${token}`,
                    '_blank'
                  );
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            )}

            {/* Request Refund */}
            {selectedPayment.status === 'completed' && (
              <button
                onClick={async () => {
                  if (!confirm('Are you sure you want to request a refund?')) return;
                  try {
                    await api.patch(`/payments/${selectedPayment.id}/request-refund`);
                    toast.success('Refund request submitted successfully');
                    setPayments((prev) =>
                      prev.map((p) =>
                        p.id === selectedPayment.id ? { ...p, status: 'refund_requested' } : p
                      )
                    );
                    setSelectedPayment(null);
                  } catch (err: unknown) {
                    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to request refund';
                    toast.error(msg);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 rounded-lg text-sm font-medium transition"
              >
                <RotateCcw className="w-4 h-4" />
                Request Refund
              </button>
            )}

            {/* Refund Requested Info */}
            {selectedPayment.status === 'refund_requested' && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-center">
                <div className="text-sm font-semibold text-amber-700">Refund Requested</div>
                <div className="text-xs text-amber-600 mt-1">Your refund request is being reviewed by the admin.</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
