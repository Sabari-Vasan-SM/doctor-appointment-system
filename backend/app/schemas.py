from pydantic import BaseModel, EmailStr

from app.models import AppointmentStatus, UserRole


# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None
    role: UserRole = UserRole.PATIENT


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: str | None
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}


# --- Doctor ---
class DoctorProfileCreate(BaseModel):
    specialization: str
    qualification: str
    experience_years: int = 0
    consultation_fee: int = 500
    bio: str | None = None
    avatar_url: str | None = None


class DoctorProfileUpdate(BaseModel):
    specialization: str | None = None
    qualification: str | None = None
    experience_years: int | None = None
    consultation_fee: int | None = None
    bio: str | None = None
    avatar_url: str | None = None
    is_available: bool | None = None


class DoctorProfileResponse(BaseModel):
    id: int
    user_id: int
    specialization: str
    qualification: str
    experience_years: int
    consultation_fee: int
    bio: str | None
    avatar_url: str | None
    is_available: bool
    user: UserResponse

    model_config = {"from_attributes": True}


class DoctorListResponse(BaseModel):
    id: int
    specialization: str
    qualification: str
    experience_years: int
    consultation_fee: int
    bio: str | None
    avatar_url: str | None
    is_available: bool
    doctor_name: str
    email: str

    model_config = {"from_attributes": True}


# --- Schedule ---
class ScheduleCreate(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    slot_duration_minutes: int = 30


class ScheduleResponse(BaseModel):
    id: int
    doctor_id: int
    day_of_week: int
    start_time: str
    end_time: str
    slot_duration_minutes: int
    is_active: bool

    model_config = {"from_attributes": True}


# --- Appointment ---
class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: str
    appointment_time: str
    reason: str | None = None


class AppointmentUpdate(BaseModel):
    status: AppointmentStatus | None = None
    notes: str | None = None


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: str
    appointment_time: str
    status: AppointmentStatus
    reason: str | None
    notes: str | None
    created_at: str | None = None
    patient_name: str | None = None
    doctor_name: str | None = None
    specialization: str | None = None

    model_config = {"from_attributes": True}


class TimeSlot(BaseModel):
    time: str
    available: bool


class DashboardStats(BaseModel):
    total_appointments: int
    pending_appointments: int
    confirmed_appointments: int
    completed_appointments: int
    cancelled_appointments: int
