import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  MessageSquare,
  Eye,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import api from '../../lib/api';
import type { Complaint } from '../../types';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({ open: 0, in_progress: 0, resolved: 0, closed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState<Complaint | null>(null);

  // Response form
  const [showRespond, setShowRespond] = useState(false);
  const [respondTarget, setRespondTarget] = useState<Complaint | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const [complaintsRes, statsRes] = await Promise.all([
        api.get('/complaints', { params }),
        api.get('/complaints/stats'),
      ]);
      setComplaints(complaintsRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openRespond = (c: Complaint) => {
    setRespondTarget(c);
    setAdminResponse(c.admin_response || '');
    setNewStatus(c.status);
    setShowRespond(true);
  };

  const handleRespond = async () => {
    if (!respondTarget) return;
    setSubmitting(true);
    try {
      await api.patch(`/complaints/${respondTarget.id}/respond`, {
        admin_response: adminResponse,
        status: newStatus,
      });
      setShowRespond(false);
      setRespondTarget(null);
      fetchData();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Complaint Management</h1>
        <p className="text-sm text-text-secondary mt-1">Review and respond to parent complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} icon={MessageSquare} iconBg="bg-gray-100" iconColor="text-gray-600" />
        <StatCard label="Open" value={stats.open} icon={AlertTriangle} iconBg="bg-amber-100" iconColor="text-amber-600" />
        <StatCard label="In Progress" value={stats.in_progress} icon={Clock} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard label="Closed" value={stats.closed} icon={XCircle} iconBg="bg-red-100" iconColor="text-red-600" />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by reference, subject, or parent name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm"
        >
          <option value="">All Categories</option>
          <option value="safety">Safety</option>
          <option value="delay">Delay</option>
          <option value="driver">Driver</option>
          <option value="vehicle">Vehicle</option>
          <option value="billing">Billing</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 animate-spin text-text-secondary" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-text-secondary opacity-40" />
          <p className="text-text-secondary">No complaints found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg">
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Ref</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Subject</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Parent</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Priority</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Date</th>
                  <th className="text-right px-4 py-3 text-text-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg/50">
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{c.reference}</td>
                    <td className="px-4 py-3 text-text-primary font-medium max-w-50 truncate">{c.subject}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {c.parent ? `${c.parent.first_name} ${c.parent.last_name}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary capitalize">{c.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.priority} domain="complaint" /></td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} domain="complaint" /></td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelected(c)}
                          className="p-1.5 rounded-lg hover:bg-bg text-text-secondary"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openRespond(c)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                          title="Respond"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Complaint Details">
        {selected && (
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-text-secondary">{selected.reference}</span>
              <StatusBadge status={selected.status} domain="complaint" />
              <StatusBadge status={selected.priority} domain="complaint" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{selected.subject}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-bg rounded-lg">
                <p className="text-[11px] text-text-secondary mb-1">Parent</p>
                <p className="text-sm font-medium text-text-primary">
                  {selected.parent ? `${selected.parent.first_name} ${selected.parent.last_name}` : '—'}
                </p>
              </div>
              <div className="p-3 bg-bg rounded-lg">
                <p className="text-[11px] text-text-secondary mb-1">Category</p>
                <p className="text-sm font-medium text-text-primary capitalize">{selected.category}</p>
              </div>
              <div className="p-3 bg-bg rounded-lg">
                <p className="text-[11px] text-text-secondary mb-1">Submitted</p>
                <p className="text-sm font-medium text-text-primary">{formatDate(selected.createdAt)}</p>
              </div>
              {selected.booking && (
                <div className="p-3 bg-bg rounded-lg">
                  <p className="text-[11px] text-text-secondary mb-1">Related Booking</p>
                  <p className="text-sm font-medium text-text-primary font-mono">{selected.booking.booking_reference}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1">Description</p>
              <p className="text-sm text-text-primary bg-bg p-3 rounded-lg whitespace-pre-wrap">{selected.description}</p>
            </div>
            {selected.admin_response && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[11px] font-semibold text-blue-600 mb-1">Admin Response</p>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{selected.admin_response}</p>
              </div>
            )}
            {selected.resolved_at && (
              <p className="text-xs text-text-secondary">Resolved on {formatDate(selected.resolved_at)}</p>
            )}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => { setSelected(null); openRespond(selected); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
                Respond
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Respond Modal */}
      <Modal open={showRespond} onClose={() => setShowRespond(false)} title="Respond to Complaint">
        {respondTarget && (
          <div className="space-y-4 p-1">
            <div className="p-3 bg-bg rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-text-secondary">{respondTarget.reference}</span>
                <StatusBadge status={respondTarget.priority} domain="complaint" />
              </div>
              <p className="text-sm font-semibold text-text-primary">{respondTarget.subject}</p>
              <p className="text-xs text-text-secondary mt-1 line-clamp-3">{respondTarget.description}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Update Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Response *</label>
              <textarea
                rows={4}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="Write your response to the parent..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRespond(false)}
                className="px-4 py-2 rounded-lg border border-border text-text-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRespond}
                disabled={submitting || !adminResponse.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
