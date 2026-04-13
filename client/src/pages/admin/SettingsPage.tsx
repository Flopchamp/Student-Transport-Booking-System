import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  Calendar,
  CreditCard,
  Bell,
  Server,
} from 'lucide-react';
import api from '../../lib/api';

interface SettingItem {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  label: string;
  description: string;
}

type GroupedSettings = Record<string, SettingItem[]>;

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  general: { label: 'General', icon: <Globe className="w-5 h-5" />, color: 'text-blue-600 bg-blue-100' },
  booking: { label: 'Booking', icon: <Calendar className="w-5 h-5" />, color: 'text-amber-600 bg-amber-100' },
  payment: { label: 'Payment', icon: <CreditCard className="w-5 h-5" />, color: 'text-green-600 bg-green-100' },
  notification: { label: 'Notifications', icon: <Bell className="w-5 h-5" />, color: 'text-purple-600 bg-purple-100' },
  system: { label: 'System', icon: <Server className="w-5 h-5" />, color: 'text-gray-600 bg-gray-100' },
};

export default function SettingsPage() {
  const [grouped, setGrouped] = useState<GroupedSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      setGrouped(res.data.data);
      setDirty({});
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleChange = (key: string, value: string) => {
    setDirty((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const getValue = (setting: SettingItem) => {
    return dirty[setting.key] !== undefined ? dirty[setting.key] : setting.value;
  };

  const handleSave = async () => {
    if (Object.keys(dirty).length === 0) return;
    setSaving(true);
    try {
      await api.put('/settings', { settings: dirty });
      setSaved(true);
      // Refresh to get latest
      await fetchSettings();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (setting: SettingItem) => {
    const val = getValue(setting);

    if (setting.type === 'boolean') {
      return (
        <button
          type="button"
          onClick={() => handleChange(setting.key, val === 'true' ? 'false' : 'true')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            val === 'true' ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              val === 'true' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      );
    }

    if (setting.type === 'number') {
      return (
        <input
          type="number"
          value={val || ''}
          onChange={(e) => handleChange(setting.key, e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border bg-bg text-text-primary text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      );
    }

    return (
      <input
        type="text"
        value={val || ''}
        onChange={(e) => handleChange(setting.key, e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-border bg-bg text-text-primary text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  const categories = Object.keys(CATEGORY_META).filter((cat) => grouped[cat]?.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">System Settings</h1>
          <p className="text-sm text-text-secondary mt-1">Configure application-wide settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || Object.keys(dirty).length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Settings saved successfully.
        </div>
      )}

      {Object.keys(dirty).length > 0 && !saved && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          You have unsaved changes.
        </div>
      )}

      {/* Settings Groups */}
      {categories.map((cat) => {
        const meta = CATEGORY_META[cat];
        return (
          <div key={cat} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.color}`}>
                {meta.icon}
              </div>
              <h2 className="text-base font-semibold text-text-primary">{meta.label}</h2>
            </div>
            <div className="divide-y divide-border">
              {grouped[cat].map((setting) => (
                <div key={setting.key} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{setting.label}</p>
                    {setting.description && (
                      <p className="text-xs text-text-secondary mt-0.5">{setting.description}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {renderInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {categories.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Settings className="w-10 h-10 mx-auto mb-3 text-text-secondary opacity-40" />
          <p className="text-text-secondary">No settings found. They will be created on server startup.</p>
        </div>
      )}
    </div>
  );
}
