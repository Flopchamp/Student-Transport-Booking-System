import { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  Search,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import api from '../../lib/api';
import Modal from '../../components/ui/Modal';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  published_at: string;
  expires_at: string | null;
  author?: { first_name: string; last_name: string };
}

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

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState<Announcement | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Announcements</h1>
        <p className="text-sm text-text-secondary mt-1">Important updates and notices</p>
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
          <option value="general">General</option>
          <option value="transport">Transport</option>
          <option value="payment">Payment</option>
          <option value="schedule">Schedule</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      {/* Urgent banner */}
      {announcements.some((a) => a.priority === 'urgent') && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Urgent Notices</p>
            {announcements.filter((a) => a.priority === 'urgent').map((a) => (
              <p key={a.id} className="text-sm text-red-600 mt-1 cursor-pointer hover:underline" onClick={() => setSelected(a)}>
                {a.title}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 animate-spin text-text-secondary" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Megaphone className="w-10 h-10 mx-auto mb-3 text-text-secondary opacity-40" />
          <p className="text-text-secondary">No announcements at this time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition cursor-pointer"
              onClick={() => setSelected(a)}
            >
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[a.category] || CATEGORY_COLORS.general}`}>
                  {a.category}
                </span>
                {(a.priority === 'high' || a.priority === 'urgent') && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[a.priority]}`}>
                    {a.priority}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{a.title}</h3>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">{a.content}</p>
              <p className="text-[11px] text-text-secondary mt-2">{formatDate(a.published_at)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Announcement">
        {selected && (
          <div className="space-y-4 p-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[selected.category]}`}>
                {selected.category}
              </span>
              {(selected.priority === 'high' || selected.priority === 'urgent') && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[selected.priority]}`}>
                  {selected.priority}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{selected.title}</h3>
            <p className="text-sm text-text-primary bg-bg p-3 rounded-lg whitespace-pre-wrap">{selected.content}</p>
            <p className="text-xs text-text-secondary">
              Published {formatDate(selected.published_at)}
              {selected.author && ` by ${selected.author.first_name} ${selected.author.last_name}`}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
