// ============================================
// User & Auth Types
// ============================================
export interface User {
  id: number;
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
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade: string;
  school_name: string;
  pickup_address: string;
  dropoff_address: string;
  special_needs?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  User?: User;
}

// ============================================
// Route Types
// ============================================
export interface Route {
  id: number;
  name: string;
  route_name?: string;
  route_number?: string;
  description?: string;
  start_location: string;
  end_location: string;
  stops: string[];
  distance_km: number;
  estimated_duration_min: number;
  estimated_duration_minutes?: number;
  price: number;
  fare_amount?: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  Vehicle?: Vehicle;
  Driver?: Driver;
}

// ============================================
// Vehicle Types
// ============================================
export interface Vehicle {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  license_plate: string;
  insurance_expiry: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  status: 'active' | 'maintenance' | 'retired';
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  Driver?: Driver;
  Route?: Route;
}

// ============================================
// Driver Types
// ============================================
export interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  experience_years: number;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'active' | 'on_leave' | 'inactive';
  rating: number;
  total_trips: number;
  vehicle_id?: number;
  route_id?: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  Vehicle?: Vehicle;
  Route?: Route;
}

// ============================================
// Booking Types
// ============================================
export interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  student_id: number;
  route_id: number;
  booking_type: 'one_way' | 'round_trip';
  start_date: string;
  end_date?: string;
  pickup_time: string;
  dropoff_time?: string;
  pickup_location: string;
  dropoff_location: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  fare_amount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  User?: User;
  Student?: Student;
  Route?: Route;
}

// ============================================
// Payment Types
// ============================================
export interface Payment {
  id: number;
  booking_id: number;
  user_id: number;
  amount: number;
  payment_method: 'credit_card' | 'mpesa' | 'bank_transfer';
  transaction_reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at?: string;
  createdAt: string;
  updatedAt: string;
  Booking?: Booking;
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
  data: T[];
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
