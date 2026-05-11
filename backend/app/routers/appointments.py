from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import get_current_user
from app.database import get_db
from app.models import Appointment, AppointmentStatus, DoctorProfile, DoctorSchedule, User, UserRole
from app.schemas import AppointmentCreate, AppointmentResponse, AppointmentUpdate, DashboardStats, TimeSlot

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


def _build_response(appt: Appointment) -> dict:
    return {
        "id": appt.id,
        "patient_id": appt.patient_id,
        "doctor_id": appt.doctor_id,
        "appointment_date": appt.appointment_date,
        "appointment_time": appt.appointment_time,
        "status": appt.status,
        "reason": appt.reason,
        "notes": appt.notes,
        "created_at": appt.created_at.isoformat() if appt.created_at else None,
        "patient_name": appt.patient.full_name if appt.patient else None,
        "doctor_name": appt.doctor.user.full_name if appt.doctor and appt.doctor.user else None,
        "specialization": appt.doctor.specialization if appt.doctor else None,
    }


@router.post("/", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Only patients can book appointments")

    result = await db.execute(
        select(DoctorProfile).where(DoctorProfile.id == data.doctor_id).options(selectinload(DoctorProfile.user))
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    existing = await db.execute(
        select(Appointment).where(
            Appointment.doctor_id == data.doctor_id,
            Appointment.appointment_date == data.appointment_date,
            Appointment.appointment_time == data.appointment_time,
            Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This time slot is already booked")

    appt = Appointment(
        patient_id=current_user.id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        appointment_time=data.appointment_time,
        reason=data.reason,
    )
    db.add(appt)
    await db.commit()
    await db.refresh(appt)

    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == appt.id)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor).selectinload(DoctorProfile.user))
    )
    appt = result.scalar_one()
    return _build_response(appt)


@router.get("/my", response_model=list[AppointmentResponse])
async def get_my_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role == UserRole.PATIENT:
        query = select(Appointment).where(Appointment.patient_id == current_user.id)
    elif current_user.role == UserRole.DOCTOR:
        result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        profile = result.scalar_one_or_none()
        if not profile:
            return []
        query = select(Appointment).where(Appointment.doctor_id == profile.id)
    else:
        query = select(Appointment)

    query = query.options(
        selectinload(Appointment.patient),
        selectinload(Appointment.doctor).selectinload(DoctorProfile.user),
    ).order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())

    result = await db.execute(query)
    appointments = result.scalars().all()
    return [_build_response(a) for a in appointments]


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    data: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == appointment_id)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor).selectinload(DoctorProfile.user))
    )
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == UserRole.PATIENT and appt.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if current_user.role == UserRole.DOCTOR:
        doc_result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        profile = doc_result.scalar_one_or_none()
        if not profile or appt.doctor_id != profile.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    if data.status is not None:
        appt.status = data.status
    if data.notes is not None:
        appt.notes = data.notes

    await db.commit()
    await db.refresh(appt)

    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == appt.id)
        .options(selectinload(Appointment.patient), selectinload(Appointment.doctor).selectinload(DoctorProfile.user))
    )
    appt = result.scalar_one()
    return _build_response(appt)


@router.get("/slots/{doctor_id}/{date}", response_model=list[TimeSlot])
async def get_available_slots(
    doctor_id: int,
    date: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        appt_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    day_of_week = appt_date.weekday()

    result = await db.execute(
        select(DoctorSchedule).where(
            DoctorSchedule.doctor_id == doctor_id,
            DoctorSchedule.day_of_week == day_of_week,
            DoctorSchedule.is_active.is_(True),
        )
    )
    schedules = result.scalars().all()

    if not schedules:
        return []

    booked_result = await db.execute(
        select(Appointment.appointment_time).where(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == date,
            Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        )
    )
    booked_times = {row[0] for row in booked_result.all()}

    slots = []
    for schedule in schedules:
        start_h, start_m = map(int, schedule.start_time.split(":"))
        end_h, end_m = map(int, schedule.end_time.split(":"))
        current_minutes = start_h * 60 + start_m
        end_minutes = end_h * 60 + end_m

        while current_minutes < end_minutes:
            time_str = f"{current_minutes // 60:02d}:{current_minutes % 60:02d}"
            slots.append(TimeSlot(time=time_str, available=time_str not in booked_times))
            current_minutes += schedule.slot_duration_minutes

    return slots


@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role == UserRole.PATIENT:
        base_query = select(Appointment).where(Appointment.patient_id == current_user.id)
    elif current_user.role == UserRole.DOCTOR:
        result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        profile = result.scalar_one_or_none()
        if not profile:
            return DashboardStats(
                total_appointments=0,
                pending_appointments=0,
                confirmed_appointments=0,
                completed_appointments=0,
                cancelled_appointments=0,
            )
        base_query = select(Appointment).where(Appointment.doctor_id == profile.id)
    else:
        base_query = select(Appointment)

    result = await db.execute(base_query)
    appointments = result.scalars().all()

    return DashboardStats(
        total_appointments=len(appointments),
        pending_appointments=sum(1 for a in appointments if a.status == AppointmentStatus.PENDING),
        confirmed_appointments=sum(1 for a in appointments if a.status == AppointmentStatus.CONFIRMED),
        completed_appointments=sum(1 for a in appointments if a.status == AppointmentStatus.COMPLETED),
        cancelled_appointments=sum(1 for a in appointments if a.status == AppointmentStatus.CANCELLED),
    )
