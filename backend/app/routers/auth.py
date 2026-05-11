from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.models import DoctorProfile, User, UserRole
from app.schemas import DoctorProfileCreate, Token, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    if user_data.role == UserRole.DOCTOR:
        raise HTTPException(
            status_code=400,
            detail="Doctor registration requires additional profile information. Use /api/auth/register-doctor instead.",
        )

    token = create_access_token(data={"sub": user.id})
    return Token(access_token=token)


@router.post("/register-doctor", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_doctor(
    user_data: UserCreate,
    profile_data: DoctorProfileCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=UserRole.DOCTOR,
    )
    db.add(user)
    await db.flush()

    profile = DoctorProfile(
        user_id=user.id,
        specialization=profile_data.specialization,
        qualification=profile_data.qualification,
        experience_years=profile_data.experience_years,
        consultation_fee=profile_data.consultation_fee,
        bio=profile_data.bio,
        avatar_url=profile_data.avatar_url,
    )
    db.add(profile)
    await db.commit()

    token = create_access_token(data={"sub": user.id})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": user.id})
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/me/doctor-profile")
async def get_my_doctor_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Not a doctor account")

    result = await db.execute(
        select(DoctorProfile)
        .where(DoctorProfile.user_id == current_user.id)
        .options(selectinload(DoctorProfile.user))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

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
        "user": {
            "id": profile.user.id,
            "email": profile.user.email,
            "full_name": profile.user.full_name,
            "phone": profile.user.phone,
            "role": profile.user.role,
            "is_active": profile.user.is_active,
        },
    }
