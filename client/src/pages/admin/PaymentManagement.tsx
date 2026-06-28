import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import {
  DollarSign,
  Search,
  Eye,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download,
} from 'lucide-react';
import type { Payment } from '../../types';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';

interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalRevenue: number;
}

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await api.get('/payments');
      const raw = res.data.data;
      setPayments(Array.isArray(raw) ? raw : (raw?.payments || []));
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/payments/stats');
      setStats(res.data.data?.stats || null);
    } catch (err) {
      console.error('Failed to fetch payment stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments, fetchStats]);

  const handleRefund = async (id: string) => {
    if (!confirm('Are you sure you want to refund this payment?')) return;
    setRefunding(id);
    try {
      await api.patch(`/payments/${id}/refund`);
      toast.success('Payment refunded successfully');
      fetchPayments();
      fetchStats();
    } catch (err) {
      console.error('Failed to refund payment:', err);
    } finally {
      setRefunding(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const ref = p.transaction_reference || '';
    const parentName = p.parent ? `${p.parent.first_name} ${p.parent.last_name}` : '';
    const bookingRef = p.booking?.booking_reference || '';
    const matchesSearch =
      ref.toLowerCase().includes(search.toLowerCase()) ||
      parentName.toLowerCase().includes(search.toLowerCase()) ||
      bookingRef.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { icon: DollarSign, label: 'Total Payments', value: stats?.totalPayments ?? 0, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { icon: CheckCircle, label: 'Completed', value: stats?.completedPayments ?? 0, iconBg: 'bg-green-50', iconColor: 'text-green-500' },
    { icon: Clock, label: 'Pending', value: stats?.pendingPayments ?? 0, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { icon: TrendingUp, label: 'Total Revenue', value: `KES ${(stats?.totalRevenue ?? 0).toLocaleString()}`, iconBg: 'bg-violet-50', iconColor: 'text-violet-500' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payment Management</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage all payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, parent, or booking..."
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
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refund_requested">Refund Requested</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-[60px] px-6 text-center">
          <div className="w-[72px] h-[72px] rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <DollarSign className="w-9 h-9 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1.5">No payments found</h3>
          <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Reference', 'Parent', 'Booking', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map((h) => (
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
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                      {payment.parent ? `${payment.parent.first_name} ${payment.parent.last_name}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-mono text-slate-500 whitespace-nowrap">
                      {payment.booking?.booking_reference || '—'}
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
                              window.open(
                                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/payments/${payment.id}/receipt`,
                                '_blank'
                              );
                            }}
                            title="Download Receipt"
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50 transition"
                          >
                            <Download className="w-[15px] h-[15px] text-emerald-500" />
                          </button>
                        )}
                        {(payment.status === 'completed' || payment.status === 'refund_requested') && (
                          <button
                            onClick={() => handleRefund(payment.id)}
                            title={payment.status === 'refund_requested' ? 'Approve Refund' : 'Refund'}
                            disabled={refunding === payment.id}
                            className="w-8 h-8 rounded-lg border border-amber-200 bg-white flex items-center justify-center cursor-pointer hover:bg-amber-50 transition disabled:opacity-50"
                          >
                            <RotateCcw className={`w-[15px] h-[15px] text-amber-500 ${refunding === payment.id ? 'animate-spin' : ''}`} />
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
            {/* Reference + Status */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Transaction</div>
                <div className="text-[15px] font-bold text-slate-800 font-mono">{selectedPayment.transaction_reference || '—'}</div>
              </div>
              <StatusBadge status={selectedPayment.status} domain="payment" showDot withBorder />
            </div>

            {/* Parent Info */}
            {selectedPayment.parent && (
              <div className="p-4 bg-slate-50 rounded-[10px] border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-sm text-primary">
                    {selectedPayment.parent.first_name[0]}{selectedPayment.parent.last_name[0]}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-slate-800">
                      {selectedPayment.parent.first_name} {selectedPayment.parent.last_name}
                    </div>
                    <div className="text-[13px] text-slate-500">{selectedPayment.parent.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Details Grid */}
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
                <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Booking Ref</div>
                <div className="text-sm font-semibold text-slate-800 font-mono">{selectedPayment.booking?.booking_reference || '—'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-[11px] text-slate-400 font-semibold uppercase mb-1">Date</div>
                <div className="text-sm font-semibold text-slate-800">
                  {selectedPayment.paid_at
                    ? new Date(selectedPayment.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : new Date(selectedPayment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Receipt references */}
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

            {/* Refund button */}
            {(selectedPayment.status === 'completed' || selectedPayment.status === 'refund_requested') && (
              <button
                onClick={() => {
                  handleRefund(selectedPayment.id);
                  setSelectedPayment(null);
                }}
                className="w-full py-3 rounded-[10px] text-sm font-semibold cursor-pointer bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {selectedPayment.status === 'refund_requested' ? 'Approve Refund Request' : 'Process Refund'}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
