export type StatusDomain = 'booking' | 'driver' | 'vehicle' | 'route' | 'payment' | 'user';

export const statusStyles: Record<
  StatusDomain,
  Record<string, { bg: string; text: string; border?: string; dot?: string; label?: string }>
> = {
  payment: {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400', label: 'Pending' },
    completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', label: 'Completed' },
    failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Failed' },
    refunded: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400', label: 'Refunded' },
  },
  booking: {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400', label: 'Pending' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Confirmed' },
    completed: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400', label: 'Completed' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Cancelled' },
  },
  driver: {
    available: { bg: 'bg-green-100', text: 'text-green-700', label: 'Available' },
    on_trip: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'On Trip' },
    off_duty: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Off Duty' },
  },
  vehicle: {
    active: { bg: 'bg-green-50', text: 'text-green-700', label: 'Active' },
    maintenance: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Maintenance' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive' },
  },
  route: {
    active: { bg: 'bg-green-50', text: 'text-green-700', label: 'Active' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive' },
  },
  user: {
    active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Active' },
    inactive: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Inactive' },
    parent: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Parent' },
    admin: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Admin' },
  },
};
