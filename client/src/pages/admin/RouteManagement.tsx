import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Clock,
  DollarSign,
  Bus,
} from 'lucide-react';
import type { Route } from '../../types';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';

export default function RouteManagement() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_location: '',
    end_location: '',
    stops: '',
    distance_km: '',
    estimated_duration_min: '',
    price: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/routes');
      const raw = res.data.data;
      setRoutes(Array.isArray(raw) ? raw : (raw?.routes || []));
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (route?: Route) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        name: route.name || '',
        description: route.description || '',
        start_location: route.start_location || '',
        end_location: route.end_location || '',
        stops: Array.isArray(route.stops) ? route.stops.join(', ') : '',
        distance_km: route.distance_km?.toString() || '',
        estimated_duration_min: route.estimated_duration_min?.toString() || '',
        price: route.price?.toString() || '',
      });
    } else {
      setEditingRoute(null);
      setFormData({
        name: '',
        description: '',
        start_location: '',
        end_location: '',
        stops: '',
        distance_km: '',
        estimated_duration_min: '',
        price: '',
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      start_location: formData.start_location,
      end_location: formData.end_location,
      stops: formData.stops.split(',').map((s) => s.trim()).filter(Boolean),
      distance_km: formData.distance_km ? parseFloat(formData.distance_km) : undefined,
      estimated_duration_min: formData.estimated_duration_min ? parseInt(formData.estimated_duration_min) : undefined,
      price: parseFloat(formData.price),
    };

    try {
      if (editingRoute) {
        await api.put(`/routes/${editingRoute.id}`, payload);
      } else {
        await api.post('/routes', payload);
      }
      setShowModal(false);
      fetchRoutes();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await api.delete(`/routes/${id}`);
      if (selectedRoute?.id === id) setSelectedRoute(null);
      fetchRoutes();
    } catch (err) {
      console.error('Failed to delete route:', err);
    }
  };

  const filteredRoutes = routes.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.start_location || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.end_location || '').toLowerCase().includes(search.toLowerCase())
  );

  const routeColumns = [
    {
      key: 'route',
      header: 'Route',
      render: (route: Route) => <p className="text-sm font-medium text-text">{route.name}</p>,
    },
    {
      key: 'from_to',
      header: 'From → To',
      render: (route: Route) => (
        <span className="text-sm text-text-secondary">
          {route.start_location} → {route.end_location}
        </span>
      ),
    },
    {
      key: 'distance',
      header: 'Distance',
      render: (route: Route) => <span className="text-sm text-text-secondary">{route.distance_km} km</span>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (route: Route) => <span className="text-sm text-text-secondary">{route.estimated_duration_min} min</span>,
    },
    {
      key: 'fare',
      header: 'Fare',
      render: (route: Route) => <span className="text-sm font-medium text-text">${route.price?.toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (route: Route) => <StatusBadge status={route.is_active ? 'active' : 'inactive'} domain="route" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (route: Route) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenModal(route)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => handleDelete(route.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Route Management</h1>
          <p className="text-text-secondary mt-1">Manage transport routes</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Route
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routes..."
            className="w-full pl-11 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Route Table */}
        <div className={`${selectedRoute ? 'flex-1' : 'w-full'}`}>
          <DataTable
            columns={routeColumns}
            data={filteredRoutes}
            rowKey={(route) => route.id}
            emptyMessage="No routes found"
            emptyIcon={<MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />}
            onRowClick={(route) => setSelectedRoute(route)}
            rowClassName={(route) => `border-t border-border cursor-pointer transition-colors ${selectedRoute?.id === route.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
          />
        </div>

        {/* Route Detail Panel */}
        {selectedRoute && (
          <div className="w-80 card p-6 hidden lg:block animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text">Route Details</h3>
              <button onClick={() => setSelectedRoute(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-text">{selectedRoute.name}</h4>
                {selectedRoute.description && (
                  <p className="text-sm text-text-muted mt-1">{selectedRoute.description}</p>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-text-secondary">{selectedRoute.start_location}</span>
                </div>
                {selectedRoute.stops?.map((stop: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 pl-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    <span className="text-xs text-text-muted">{typeof stop === 'string' ? stop : (stop as { name?: string }).name || `Stop ${i + 1}`}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-text-secondary">{selectedRoute.end_location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-blue-700">{selectedRoute.estimated_duration_min} min</p>
                  <p className="text-xs text-blue-500">Duration</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <MapPin className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-green-700">{selectedRoute.distance_km} km</p>
                  <p className="text-xs text-green-500">Distance</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <Bus className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-purple-700">{selectedRoute.stops?.length || 0}</p>
                  <p className="text-xs text-purple-500">Stops</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <DollarSign className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-orange-700">${selectedRoute.price?.toLocaleString()}</p>
                  <p className="text-xs text-orange-500">Fare</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingRoute ? 'Edit Route' : 'Add New Route'}
        maxWidth="max-w-lg"
      >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Location</label>
                <input
                  type="text"
                  value={formData.start_location}
                  onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Location</label>
                <input
                  type="text"
                  value={formData.end_location}
                  onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stops (comma-separated)</label>
                <input
                  type="text"
                  value={formData.stops}
                  onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                  placeholder="Stop 1, Stop 2, Stop 3"
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance_km}
                    onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.estimated_duration_min}
                    onChange={(e) => setFormData({ ...formData, estimated_duration_min: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fare ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingRoute ? 'Update Route' : 'Add Route'}
                </button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
