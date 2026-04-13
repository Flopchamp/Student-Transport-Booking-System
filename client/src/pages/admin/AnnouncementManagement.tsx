import { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
} from 'lucide-react';
import api from '../../lib/api';
import Modal from '../../components/ui/Modal';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  is_active: boolean;
  published_at: string;
  expires_at: string | null;
  author?: { first_name: string; last_name: string };
  createdAt: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'transport', label: 'Transport' },
  { value: 'payment', label: 'Payment' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'emergency', label: 'Emergency' },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-slate-100 text-slate-700',
  transport: 'bg-blue-100 text-blue-700',
  payment: 'bg-green-100 text-green-700',
  schedule: 'bg-purple-100 text-purple-700',
  emergency: 'bg-red-100 text-red-700',
};

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [formPriority, setFormPriority] = useState('normal');
  const [formExpires, setFormExpires] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detail
  const [selected, setSelected] = useState<Announcement | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '100' };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.get('/announcements', { params });
      setAnnouncements(res.data.data.announcements || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNewForm = () => {
    setEditTarget(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('general');
    setFormPriority('normal');
    setFormExpires('');
    setShowForm(true);
  };

  const openEditForm = (a: Announcement) => {
    setEditTarget(a);
    setFormTitle(a.title);
    setFormContent(a.content);
    setFormCategory(a.category);
    setFormPriority(a.priority);
    setFormExpires(a.expires_at ? a.expires_at.split('T')[0] : '');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: formTitle,
        content: formContent,
        category: formCategory,
        priority: formPriority,
        expires_at: formExpires || null,
      };
      if (editTarget) {
        await api.put(`/announcements/${editTarget.id}`, payload);
      } else {
        await api.post('/announcements', payload);
      }
      setShowForm(false);
      fetchData();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (a: Announcement) => {
    try {
      await api.put(`/announcements/${a.id}`, { is_active: !a.is_active });
      fetchData();
    } catch {
      // silent
    }
  };

  const handleDelete = async (a: Announcement) => {
    if (!confirm(`Delete announcement "${a.title}"?`)) return;
    try {
      await api.delete(`/announcements/${a.id}`);
      fetchData();
    } catch {
      // silent
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Announcements</h1>
          <p className="text-sm text-text-secondary mt-1">Broadcast messages to parents</p>
        </div>
        <button
          onClick={openNewForm}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 animate-spin text-text-secondary" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Megaphone className="w-10 h-10 mx-auto mb-3 text-text-secondary opacity-40" />
          <p className="text-text-secondary">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`bg-card border rounded-xl p-4 transition ${
                a.is_active ? 'border-border' : 'border-border opacity-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelected(a)}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[a.category] || CATEGORY_COLORS.general}`}>
                      {a.category}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.normal}`}>
                      {a.priority}
                    </span>
                    {!a.is_active && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-200 text-gray-600">Inactive</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">{a.title}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{a.content}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(a)}
                    className="p-1.5 rounded-lg hover:bg-bg text-text-secondary"
                    title={a.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {a.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditForm(a)}
                    className="p-1.5 rounded-lg hover:bg-bg text-text-secondary"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-text-secondary">
                <span>Published {formatDate(a.published_at)}</span>
                {a.author && <span>by {a.author.first_name} {a.author.last_name}</span>}
                {a.expires_at && <span>· Expires {formatDate(a.expires_at)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editTarget ? 'Edit Announcement' : 'New Announcement'}>
        <div className="space-y-4 p-1">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Title *</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Announcement title"
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
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Expires On (optional)</label>
            <input
              type="date"
              value={formExpires}
              onChange={(e) => setFormExpires(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Content *</label>
            <textarea
              rows={5}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Write the announcement content..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-border text-text-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formTitle.trim() || !formContent.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Saving...' : editTarget ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Announcement">
        {selected && (
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[selected.category]}`}>
                {selected.category}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[selected.priority]}`}>
                {selected.priority}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{selected.title}</h3>
            <p className="text-sm text-text-primary bg-bg p-3 rounded-lg whitespace-pre-wrap">{selected.content}</p>
            <div className="text-xs text-text-secondary">
              Published {formatDate(selected.published_at)}
              {selected.author && ` by ${selected.author.first_name} ${selected.author.last_name}`}
              {selected.expires_at && ` · Expires ${formatDate(selected.expires_at)}`}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
