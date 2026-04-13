import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  MessageSquare,
  Send,
} from 'lucide-react';
import api from '../../lib/api';
import type { Complaint, Booking } from '../../types';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';

const CATEGORIES = [
  { value: 'safety', label: 'Safety Concern' },
  { value: 'delay', label: 'Delay / Late Arrival' },
  { value: 'driver', label: 'Driver Issue' },
  { value: 'vehicle', label: 'Vehicle Condition' },
  { value: 'billing', label: 'Billing / Payment' },
  { value: 'other', label: 'Other' },
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);

  // New complaint form
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('other');
  const [formPriority, setFormPriority] = useState('medium');
  const [formBookingId, setFormBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/complaints', { params });
      setComplaints(res.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const openNewForm = async () => {
    setShowNew(true);
    try {
      const res = await api.get('/bookings', { params: { limit: 100 } });
      const data = res.data.data;
      setBookings(Array.isArray(data) ? data : data?.bookings || []);
    } catch {
      // silent
    }
  };

  const handleSubmit = async () => {
    if (!formSubject.trim() || !formDescription.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/complaints', {
        subject: formSubject,
        description: formDescription,
        category: formCategory,
        priority: formPriority,
        booking_id: formBookingId || undefined,
      });
      setShowNew(false);
      setFormSubject('');
      setFormDescription('');
      setFormCategory('other');
      setFormPriority('medium');
      setFormBookingId('');
      fetchComplaints();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filteredComplaints = complaints;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Complaints</h1>
          <p className="text-sm text-text-secondary mt-1">Report and track issues</p>
        </div>
        <button
          onClick={openNewForm}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New Complaint
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by subject or reference..."
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
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 animate-spin text-text-secondary" />
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-text-secondary opacity-40" />
          <p className="text-text-secondary">No complaints found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition cursor-pointer"
              onClick={() => setSelected(c)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-text-secondary">{c.reference}</span>
                    <StatusBadge status={c.status} domain="complaint" />
                    <StatusBadge status={c.priority} domain="complaint" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary truncate">{c.subject}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{c.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-text-secondary">{formatDate(c.createdAt)}</p>
                  <span className="text-[11px] text-text-secondary capitalize">{c.category}</span>
                </div>
              </div>
              {c.admin_response && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700 border border-blue-100">
                  <strong>Admin Response:</strong> {c.admin_response}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Complaint Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Report an Issue">
        <div className="space-y-4 p-1">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Subject *</label>
            <input
              type="text"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Brief summary of the issue"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Priority</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          {bookings.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Related Booking (optional)</label>
              <select
                value={formBookingId}
                onChange={(e) => setFormBookingId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm"
              >
                <option value="">None</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>{b.booking_reference} — {b.student?.first_name} {b.student?.last_name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description *</label>
            <textarea
              rows={4}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowNew(false)}
              className="px-4 py-2 rounded-lg border border-border text-text-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formSubject.trim() || !formDescription.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </div>
      </Modal>

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
                <p className="text-[11px] text-text-secondary mb-1">Category</p>
                <p className="text-sm font-medium text-text-primary capitalize">{selected.category}</p>
              </div>
              <div className="p-3 bg-bg rounded-lg">
                <p className="text-[11px] text-text-secondary mb-1">Submitted</p>
                <p className="text-sm font-medium text-text-primary">{formatDate(selected.createdAt)}</p>
              </div>
              {selected.booking && (
                <div className="p-3 bg-bg rounded-lg col-span-2">
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
              <p className="text-xs text-text-secondary">
                Resolved on {formatDate(selected.resolved_at)}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
