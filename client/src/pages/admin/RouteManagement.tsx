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

export default function RouteManagement() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    route_name: '',
    route_number: '',
    start_location: '',
    end_location: '',
    stops: '',
    distance_km: '',
    estimated_duration_minutes: '',
    fare_amount: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/transport/routes');
      setRoutes(res.data.data || []);
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
        route_name: route.route_name,
        route_number: route.route_number,
        start_location: route.start_location,
        end_location: route.end_location,
        stops: Array.isArray(route.stops) ? route.stops.join(', ') : '',
        distance_km: route.distance_km?.toString() || '',
        estimated_duration_minutes: route.estimated_duration_minutes?.toString() || '',
        fare_amount: route.fare_amount?.toString() || '',
      });
    } else {
      setEditingRoute(null);
      setFormData({
        route_name: '',
        route_number: '',
        start_location: '',
        end_location: '',
        stops: '',
        distance_km: '',
        estimated_duration_minutes: '',
        fare_amount: '',
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
      route_name: formData.route_name,
      route_number: formData.route_number,
      start_location: formData.start_location,
      end_location: formData.end_location,
      stops: formData.stops.split(',').map((s) => s.trim()).filter(Boolean),
      distance_km: parseFloat(formData.distance_km),
      estimated_duration_minutes: parseInt(formData.estimated_duration_minutes),
      fare_amount: parseFloat(formData.fare_amount),
    };

    try {
      if (editingRoute) {
        await api.put(`/transport/routes/${editingRoute.id}`, payload);
      } else {
        await api.post('/transport/routes', payload);
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await api.delete(`/transport/routes/${id}`);
      if (selectedRoute?.id === id) setSelectedRoute(null);
      fetchRoutes();
    } catch (err) {
      console.error('Failed to delete route:', err);
    }
  };

  const filteredRoutes = routes.filter(
    (r) =>
      r.route_name.toLowerCase().includes(search.toLowerCase()) ||
      r.route_number.toLowerCase().includes(search.toLowerCase()) ||
      r.start_location.toLowerCase().includes(search.toLowerCase()) ||
      r.end_location.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className={`${selectedRoute ? 'flex-1' : 'w-full'} card overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Route</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">From → To</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Distance</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Duration</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Fare</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-text-muted">No routes found</p>
                    </td>
                  </tr>
                ) : (
                  filteredRoutes.map((route) => (
                    <tr
                      key={route.id}
                      className={`border-t border-border cursor-pointer transition-colors ${
                        selectedRoute?.id === route.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedRoute(route)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-text">{route.route_name}</p>
                          <p className="text-xs text-text-muted">#{route.route_number}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {route.start_location} → {route.end_location}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{route.distance_km} km</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{route.estimated_duration_minutes} min</td>
                      <td className="px-6 py-4 text-sm font-medium text-text">KES {route.fare_amount?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${route.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {route.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                <h4 className="text-lg font-bold text-text">{selectedRoute.route_name}</h4>
                <p className="text-sm text-text-muted">#{selectedRoute.route_number}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-text-secondary">{selectedRoute.start_location}</span>
                </div>
                {selectedRoute.stops?.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2 pl-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    <span className="text-xs text-text-muted">{stop}</span>
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
                  <p className="text-sm font-bold text-blue-700">{selectedRoute.estimated_duration_minutes} min</p>
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
                  <p className="text-sm font-bold text-orange-700">KES {selectedRoute.fare_amount?.toLocaleString()}</p>
                  <p className="text-xs text-orange-500">Fare</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-border flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-text">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
                  <input
                    type="text"
                    value={formData.route_name}
                    onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route Number</label>
                  <input
                    type="text"
                    value={formData.route_number}
                    onChange={(e) => setFormData({ ...formData, route_number: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.estimated_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fare (KES)</label>
                  <input
                    type="number"
                    value={formData.fare_amount}
                    onChange={(e) => setFormData({ ...formData, fare_amount: e.target.value })}
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
          </div>
        </div>
      )}
    </div>
  );
}
