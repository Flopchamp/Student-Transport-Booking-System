import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Shield,
  Truck,
  Clock,
  Award,
  AlertCircle,
  User,
} from 'lucide-react';
import type { Driver } from '../../types';

export default function DriverProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const res = await api.get(`/drivers/${id}`);
        setDriver(res.data.data);
      } catch (err) {
        console.error('Failed to fetch driver:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-700' },
      on_leave: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
    };
    return styles[status] || styles.inactive;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-medium text-text mb-1">Driver not found</h2>
        <button onClick={() => navigate('/admin/drivers')} className="text-primary hover:underline text-sm">
          Back to Drivers
        </button>
      </div>
    );
  }

  const statusStyle = getStatusBadge(driver.status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/drivers')}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Drivers
      </button>

      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {driver.first_name[0]}{driver.last_name[0]}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-text">
                {driver.first_name} {driver.last_name}
              </h1>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                {driver.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Mail className="w-4 h-4 text-gray-400" />
                {driver.email}
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Phone className="w-4 h-4 text-gray-400" />
                {driver.phone}
              </div>
              {driver.address && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {driver.address}
                </div>
              )}
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar className="w-4 h-4 text-gray-400" />
                Joined {new Date(driver.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 sm:gap-6 flex-shrink-0">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-text">{driver.rating?.toFixed(1) || 'N/A'}</span>
              </div>
              <p className="text-xs text-text-muted">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text">{driver.total_trips}</p>
              <p className="text-xs text-text-muted">Total Trips</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text">{driver.experience_years}</p>
              <p className="text-xs text-text-muted">Years Exp.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* License Information */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            License Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-text-muted">License Number</span>
              <span className="text-sm font-mono font-medium text-text">{driver.license_number}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-text-muted">License Expiry</span>
              <span className="text-sm text-text">
                {driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-text-muted">Experience</span>
              <span className="text-sm text-text">{driver.experience_years} years</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-muted">Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                {driver.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-text-muted">Rating</span>
                <span className="text-sm font-medium text-text">{driver.rating?.toFixed(1) || '0.0'}/5.0</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${((driver.rating || 0) / 5) * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-700">{driver.total_trips}</p>
                <p className="text-xs text-blue-500">Total Trips</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <Award className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-700">98%</p>
                <p className="text-xs text-green-500">On-time Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Vehicle */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Assigned Vehicle
          </h3>
          {driver.Vehicle ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-text-muted">Vehicle</span>
                <span className="text-sm font-medium text-text">{driver.Vehicle.make} {driver.Vehicle.model}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-text-muted">Number</span>
                <span className="text-sm text-text">{driver.Vehicle.vehicle_number}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-text-muted">License Plate</span>
                <span className="text-sm font-mono text-text">{driver.Vehicle.license_plate}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-text-muted">Capacity</span>
                <span className="text-sm text-text">{driver.Vehicle.capacity} seats</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Truck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-text-muted">No vehicle assigned</p>
            </div>
          )}
        </div>

        {/* Assigned Route */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Assigned Route
          </h3>
          {driver.Route ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-text-muted">Route</span>
                <span className="text-sm font-medium text-text">{driver.Route.route_name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-text-muted">Number</span>
                <span className="text-sm text-text">#{driver.Route.route_number}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg mt-2">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {driver.Route.start_location}
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary mt-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  {driver.Route.end_location}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-text-muted">No route assigned</p>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="card p-6 md:col-span-2">
          <h3 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Emergency Contact
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-text-muted">Name</span>
              <span className="text-sm text-text">{driver.emergency_contact_name || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-text-muted">Phone</span>
              <span className="text-sm text-text">{driver.emergency_contact_phone || 'Not provided'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
