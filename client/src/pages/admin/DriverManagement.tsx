import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Eye,
  Truck,
  MapPin,
} from 'lucide-react';
import type { Driver, Vehicle, Route } from '../../types';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';

export default function DriverManagement() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    status: 'available',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Vehicle assignment state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState<Driver | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  // Route assignment state
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showRouteAssignModal, setShowRouteAssignModal] = useState(false);
  const [assigningDriverForRoute, setAssigningDriverForRoute] = useState<Driver | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [assigningRoute, setAssigningRoute] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      const raw = res.data.data;
      setDrivers(Array.isArray(raw) ? raw : (raw?.drivers || []));
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        first_name: driver.first_name,
        last_name: driver.last_name,
        email: driver.email,
        phone: driver.phone,
        license_number: driver.license_number,
        license_expiry: driver.license_expiry?.split('T')[0] || '',
        status: driver.status,
      });
    } else {
      setEditingDriver(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        license_number: '',
        license_expiry: '',
        status: 'available',
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = formData;

    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, payload);
      } else {
        await api.post('/drivers', payload);
      }
      toast.success(editingDriver ? 'Driver updated' : 'Driver added');
      setShowModal(false);
      fetchDrivers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      toast.success('Driver removed');
      fetchDrivers();
    } catch (err) {
      console.error('Failed to delete driver:', err);
    }
  };

  // ---- Vehicle assignment ----
  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      const raw = res.data.data;
      setVehicles(Array.isArray(raw) ? raw : (raw?.vehicles || []));
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  const handleOpenAssignModal = (driver: Driver) => {
    setAssigningDriver(driver);
    setSelectedVehicleId(driver.vehicle_id || '');
    setError('');
    fetchVehicles();
    setShowAssignModal(true);
  };

  const handleAssignVehicle = async () => {
    if (!assigningDriver) return;
    setAssigning(true);
    setError('');
    try {
      await api.patch(`/drivers/${assigningDriver.id}/assign-vehicle`, {
        vehicle_id: selectedVehicleId || null,
      });
      toast.success(selectedVehicleId ? 'Vehicle assigned successfully' : 'Vehicle unassigned');
      setShowAssignModal(false);
      fetchDrivers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to assign vehicle');
    } finally {
      setAssigning(false);
    }
  };

  // Get vehicle IDs already assigned to other drivers (to show as unavailable)
  const assignedVehicleIds = new Set(
    drivers
      .filter((d) => d.vehicle_id && d.id !== assigningDriver?.id)
      .map((d) => d.vehicle_id!)
  );

  // ---- Route assignment ----
  const fetchRoutes = async () => {
    try {
      const res = await api.get('/routes');
      const raw = res.data.data;
      setRoutes(Array.isArray(raw) ? raw : (raw?.routes || []));
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    }
  };

  const handleOpenRouteAssignModal = (driver: Driver) => {
    setAssigningDriverForRoute(driver);
    setSelectedRouteId(driver.route_id || '');
    setError('');
    fetchRoutes();
    setShowRouteAssignModal(true);
  };

  const handleAssignRoute = async () => {
    if (!assigningDriverForRoute) return;
    setAssigningRoute(true);
    setError('');
    try {
      await api.patch(`/drivers/${assigningDriverForRoute.id}/assign-route`, {
        route_id: selectedRouteId || null,
      });
      toast.success(selectedRouteId ? 'Route assigned successfully' : 'Route unassigned');
      setShowRouteAssignModal(false);
      fetchDrivers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to assign route');
    } finally {
      setAssigningRoute(false);
    }
  };

  const filteredDrivers = drivers.filter(
    (d) =>
      (d.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.phone || '').includes(search)
  );

  const activeCount = drivers.filter((d) => d.status === 'available').length;
  const onLeaveCount = drivers.filter((d) => d.status === 'off_duty').length;

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
          <h1 className="text-2xl font-bold text-text">Driver Management</h1>
          <p className="text-text-secondary mt-1">Manage your transport drivers</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={UserCheck} label="Total Drivers" value={drivers.length} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard icon={UserCheck} label="Active" value={activeCount} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard icon={UserCheck} label="Off Duty" value={onLeaveCount} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drivers..."
            className="w-full pl-11 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Driver Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Driver</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">License</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Vehicle</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Route</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No drivers found</p>
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="border-t border-border hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {driver.first_name[0]}{driver.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{driver.first_name} {driver.last_name}</p>
                          <p className="text-xs text-text-muted">{driver.license_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{driver.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-muted text-xs mt-0.5">
                          <Phone className="w-3 h-3" />
                          {driver.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary font-mono">{driver.license_number}</td>
                    <td className="px-6 py-4">
                      {driver.vehicle_id && driver.vehicle ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Truck className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-text-secondary">
                            {driver.vehicle.plate_number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {driver.route_id && driver.route ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-text-secondary font-medium">{driver.route.name}</span>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            {driver.route.start_location} → {driver.route.end_location}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={driver.status} domain="driver" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/admin/drivers/${driver.id}`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleOpenAssignModal(driver)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Assign Vehicle"
                        >
                          <Truck className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleOpenRouteAssignModal(driver)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Assign Route"
                        >
                          <MapPin className="w-4 h-4 text-emerald-500" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(driver)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
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

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
        maxWidth="max-w-lg"
      >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                  <input
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="off_duty">Off Duty</option>
                </select>
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
                  {submitting ? 'Saving...' : editingDriver ? 'Update Driver' : 'Add Driver'}
                </button>
              </div>
            </form>
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assign Vehicle — ${assigningDriver?.first_name ?? ''} ${assigningDriver?.last_name ?? ''}`}
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">— No vehicle (unassign) —</option>
              {vehicles.map((v) => {
                const taken = assignedVehicleIds.has(v.id);
                return (
                  <option key={v.id} value={v.id} disabled={taken}>
                    {v.plate_number} — {v.make} {v.model} ({v.capacity} seats)
                    {taken ? ' [assigned]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedVehicleId && (() => {
            const v = vehicles.find((v) => v.id === selectedVehicleId);
            if (!v) return null;
            return (
              <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-blue-800">
                  <Truck className="w-4 h-4 inline mr-1" />
                  {v.make} {v.model} ({v.year})
                </p>
                <p className="text-blue-600">Plate: {v.plate_number}</p>
                <p className="text-blue-600">Capacity: {v.capacity} seats</p>
              </div>
            );
          })()}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssignVehicle}
              disabled={assigning}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
            >
              {assigning ? 'Saving...' : selectedVehicleId ? 'Assign Vehicle' : 'Unassign Vehicle'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Route Modal */}
      <Modal
        open={showRouteAssignModal}
        onClose={() => setShowRouteAssignModal(false)}
        title={`Assign Route — ${assigningDriverForRoute?.first_name ?? ''} ${assigningDriverForRoute?.last_name ?? ''}`}
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Route</label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">— No route (unassign) —</option>
              {routes.filter((r) => r.is_active).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.start_location} → {r.end_location} (KES {r.price})
                </option>
              ))}
            </select>
          </div>

          {selectedRouteId && (() => {
            const r = routes.find((r) => r.id === selectedRouteId);
            if (!r) return null;
            return (
              <div className="bg-emerald-50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-emerald-800">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {r.name}
                </p>
                <p className="text-emerald-600">{r.start_location} → {r.end_location}</p>
                {r.distance_km && <p className="text-emerald-600">Distance: {r.distance_km} km</p>}
                {r.estimated_duration_min && <p className="text-emerald-600">Duration: {r.estimated_duration_min} min</p>}
                <p className="text-emerald-600">Price: KES {r.price}</p>
              </div>
            );
          })()}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowRouteAssignModal(false)}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssignRoute}
              disabled={assigningRoute}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
            >
              {assigningRoute ? 'Saving...' : selectedRouteId ? 'Assign Route' : 'Unassign Route'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
