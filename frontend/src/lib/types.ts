export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'patient' | 'doctor' | 'admin';
  is_active: boolean;
}

export interface DoctorProfile {
  id: number;
  user_id: number;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  bio: string | null;
  avatar_url: string | null;
  is_available: boolean;
  user: User;
}

export interface DoctorListItem {
  id: number;
  specialization: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  bio: string | null;
  avatar_url: string | null;
  is_available: boolean;
  doctor_name: string;
  email: string;
}

export interface Schedule {
  id: number;
  doctor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason: string | null;
  notes: string | null;
  created_at: string | null;
  patient_name: string | null;
  doctor_name: string | null;
  specialization: string | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DashboardStats {
  total_appointments: number;
  pending_appointments: number;
  confirmed_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
}
