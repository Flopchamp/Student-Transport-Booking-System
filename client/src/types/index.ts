// ============================================
// User & Auth Types
// ============================================
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'parent' | 'admin';
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

// ============================================
// Student Types
// ============================================
export interface Student {
  id: string;
  parent_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade: string;
  school_name: string;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  special_needs?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Route Types
// ============================================
export interface Route {
  id: string;
  name: string;
  description?: string;
  start_location: string;
  start_lat?: number;
  start_lng?: number;
  end_location: string;
  end_lat?: number;
  end_lng?: number;
  stops: Array<string | { name?: string; address?: string; lat?: number; lng?: number; order?: number }>;
  distance_km?: number;
  estimated_duration_min?: number;
  price: number;
  pricing_type?: 'flat' | 'per_km' | 'zone';
  base_price?: number;
  price_per_km?: number;
  zone_prices?: Array<{ zone_name: string; price: number }>;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Vehicle Types
// ============================================
export interface Vehicle {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  insurance_expiry: string;
  last_inspection_date?: string;
  status: 'active' | 'maintenance' | 'inactive';
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  driver?: Driver;
}

// ============================================
// Driver Types
// ============================================
export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  vehicle_id?: string;
  route_id?: string;
  status: 'available' | 'on_trip' | 'off_duty';
  is_active: boolean;
  profile_photo?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
  route?: Route;
}

// ============================================
// Booking Types
// ============================================
export interface Booking {
  id: string;
  booking_reference: string;
  parent_id: string;
  student_id: string;
  route_id: string;
  vehicle_id?: string;
  driver_id?: string;
  start_date: string;
  end_date?: string;
  pickup_time: string;
  dropoff_time?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Sequelize returns lowercase association aliases
  student?: Student;
  route?: Route;
  parent?: User;
  vehicle?: Vehicle;
  driver?: Driver;
}

// ============================================
// Payment Types
// ============================================
export interface Payment {
  id: string;
  transaction_reference: string;
  booking_id: string;
  parent_id: string;
  amount: number;
  currency: string;
  payment_method: 'mpesa' | 'stripe';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  mpesa_receipt_number?: string;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  failure_reason?: string;
  createdAt: string;
  updatedAt: string;
  booking?: Booking;
  parent?: User;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: Record<string, T[]>;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// ============================================
// UI Types
// ============================================
export interface SidebarItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

export interface StatsCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

// ============================================
// Complaint Types
// ============================================
export interface Complaint {
  id: string;
  reference: string;
  parent_id: string;
  booking_id: string | null;
  category: 'safety' | 'delay' | 'driver' | 'vehicle' | 'billing' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  admin_response: string | null;
  resolved_at: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  booking?: {
    id: string;
    booking_reference: string;
    status: string;
    start_date: string;
  };
}
