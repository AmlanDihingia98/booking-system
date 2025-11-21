// Database types matching Supabase schema

export type UserRole = 'patient' | 'staff' | 'admin';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  date_of_birth: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffAvailability {
  id: string;
  staff_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  staff_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  patient_notes: string | null;
  staff_notes: string | null;
  cancellation_reason: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface AppointmentWithDetails extends Appointment {
  patient: Profile;
  staff: Profile;
  service: Service;
  payment?: Payment;
}

export interface StaffAvailabilityWithProfile extends StaffAvailability {
  staff: Profile;
}

// DTOs (Data Transfer Objects) for API requests
export interface CreateAppointmentDTO {
  staff_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  patient_notes?: string;
}

export interface UpdateAppointmentDTO {
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  status?: AppointmentStatus;
  patient_notes?: string;
  staff_notes?: string;
  cancellation_reason?: string;
}

export interface CreateStaffAvailabilityDTO {
  staff_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
}

export interface UpdateStaffAvailabilityDTO {
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
}

export interface CreateServiceDTO {
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  currency?: string;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
  is_active?: boolean;
}

export interface UpdateProfileDTO {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  address?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
