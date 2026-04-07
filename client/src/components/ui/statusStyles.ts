export type StatusDomain = 'booking' | 'driver' | 'vehicle' | 'route';

export const statusStyles: Record<
  StatusDomain,
  Record<string, { bg: string; text: string; border?: string; dot?: string; label?: string }>
> = {
  booking: {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400', label: 'Pending' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Confirmed' },
    in_progress: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', label: 'In Progress' },
    completed: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400', label: 'Completed' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Cancelled' },
  },
  driver: {
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
    on_leave: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'On Leave' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
  },
  vehicle: {
    active: { bg: 'bg-green-50', text: 'text-green-700', label: 'Active' },
    maintenance: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Maintenance' },
    retired: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Retired' },
  },
  route: {
    active: { bg: 'bg-green-50', text: 'text-green-700', label: 'Active' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive' },
  },
};
