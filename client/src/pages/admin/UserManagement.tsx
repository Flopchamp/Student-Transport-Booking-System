import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  User as UserIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import api from '../../lib/api';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import type { User } from '../../types';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  parents: number;
  admins: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/users/stats');
      setStats(res.data.data);
    } catch {
      // silent
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/users', { params });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleToggleStatus = async (user: User) => {
    setToggling(user.id);
    try {
      await api.patch(`/users/${user.id}/toggle-status`);
      await Promise.all([fetchUsers(pagination.page), fetchStats()]);
    } catch {
      // silent
    } finally {
      setToggling(null);
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage all registered users
          </p>
        </div>
        <button
          onClick={() => { fetchUsers(pagination.page); fetchStats(); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-card text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="w-5 h-5 text-primary" />}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<UserCheck className="w-5 h-5 text-green-600" />}
          />
          <StatCard
            title="Parents"
            value={stats.parents}
            icon={<UserIcon className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            title="Admins"
            value={stats.admins}
            icon={<Shield className="w-5 h-5 text-purple-600" />}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Roles</option>
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg border-b border-border text-text-secondary">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                    <UserX className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <span className="font-medium text-text-primary">
                          {u.first_name} {u.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.role} domain="user" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={u.is_active ? 'active' : 'inactive'}
                        domain="user"
                      />
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailUser(u)}
                          className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={toggling === u.id}
                          className={`p-1.5 rounded-md ${
                            u.is_active
                              ? 'hover:bg-red-50 text-red-600'
                              : 'hover:bg-green-50 text-green-600'
                          } disabled:opacity-50`}
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {u.is_active ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-md hover:bg-bg disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-md hover:bg-bg disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailUser}
        onClose={() => setDetailUser(null)}
        title="User Details"
      >
        {detailUser && (
          <div className="space-y-4">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {detailUser.first_name[0]}{detailUser.last_name[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {detailUser.first_name} {detailUser.last_name}
                </h3>
                <p className="text-sm text-text-secondary">{detailUser.email}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 bg-bg rounded-lg p-4">
              <div>
                <p className="text-xs text-text-secondary mb-1">Phone</p>
                <p className="text-sm font-medium text-text-primary">
                  {detailUser.phone || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Role</p>
                <StatusBadge status={detailUser.role} domain="user" />
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Status</p>
                <StatusBadge
                  status={detailUser.is_active ? 'active' : 'inactive'}
                  domain="user"
                />
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Joined</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(detailUser.createdAt)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-text-secondary mb-1">User ID</p>
                <p className="text-xs font-mono text-text-secondary break-all">
                  {detailUser.id}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  handleToggleStatus(detailUser);
                  setDetailUser(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                  detailUser.is_active
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {detailUser.is_active ? 'Deactivate User' : 'Activate User'}
              </button>
              <button
                onClick={() => setDetailUser(null)}
                className="px-4 py-2 rounded-lg text-sm border border-border text-text-secondary hover:bg-bg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
