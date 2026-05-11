from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import get_current_user
from app.database import get_db
from app.models import DoctorProfile, DoctorSchedule, User, UserRole
from app.schemas import DoctorProfileUpdate, DoctorListResponse, ScheduleCreate, ScheduleResponse

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])


@router.get("/", response_model=list[DoctorListResponse])
async def list_doctors(
    specialization: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(DoctorProfile).options(selectinload(DoctorProfile.user)).where(DoctorProfile.is_available.is_(True))
    if specialization:
        query = query.where(DoctorProfile.specialization.ilike(f"%{specialization}%"))

    result = await db.execute(query)
    profiles = result.scalars().all()

    return [
        DoctorListResponse(
            id=p.id,
            specialization=p.specialization,
            qualification=p.qualification,
            experience_years=p.experience_years,
            consultation_fee=p.consultation_fee,
            bio=p.bio,
            avatar_url=p.avatar_url,
            is_available=p.is_available,
            doctor_name=p.user.full_name,
            email=p.user.email,
        )
        for p in profiles
    ]


@router.get("/specializations")
async def list_specializations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DoctorProfile.specialization).distinct())
    specializations = [row[0] for row in result.all()]
    return specializations


@router.get("/{doctor_id}")
async def get_doctor(doctor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DoctorProfile).where(DoctorProfile.id == doctor_id).options(selectinload(DoctorProfile.user))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "specialization": profile.specialization,
        "qualification": profile.qualification,
        "experience_years": profile.experience_years,
        "consultation_fee": profile.consultation_fee,
        "bio": profile.bio,
        "avatar_url": profile.avatar_url,
        "is_available": profile.is_available,
        "doctor_name": profile.user.full_name,
        "email": profile.user.email,
        "phone": profile.user.phone,
    }


@router.put("/profile", response_model=dict)
async def update_profile(
    data: DoctorProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Not a doctor account")

    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    return {"message": "Profile updated successfully"}


# --- Schedules ---
@router.get("/{doctor_id}/schedules", response_model=list[ScheduleResponse])
async def get_schedules(doctor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DoctorSchedule).where(DoctorSchedule.doctor_id == doctor_id, DoctorSchedule.is_active.is_(True))
    )
    return result.scalars().all()


@router.post("/schedules", response_model=ScheduleResponse)
async def create_schedule(
    data: ScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Not a doctor account")

    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    schedule = DoctorSchedule(
        doctor_id=profile.id,
        day_of_week=data.day_of_week,
        start_time=data.start_time,
        end_time=data.end_time,
        slot_duration_minutes=data.slot_duration_minutes,
    )
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)
    return schedule


@router.delete("/schedules/{schedule_id}")
async def delete_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Not a doctor account")

    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()

    result = await db.execute(
        select(DoctorSchedule).where(DoctorSchedule.id == schedule_id, DoctorSchedule.doctor_id == profile.id)
    )
    schedule = result.scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    await db.delete(schedule)
    await db.commit()
    return {"message": "Schedule deleted"}
