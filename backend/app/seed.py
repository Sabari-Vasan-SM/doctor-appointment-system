"""Seed the database with sample doctors and schedules."""

import asyncio

from sqlalchemy import select

from app.auth import hash_password
from app.database import async_session, engine
from app.models import Base, DoctorProfile, DoctorSchedule, User, UserRole

DOCTORS = [
    {
        "email": "dr.sarah@example.com",
        "full_name": "Dr. Sarah Johnson",
        "phone": "+1-555-0101",
        "specialization": "Cardiology",
        "qualification": "MD, FACC",
        "experience_years": 15,
        "consultation_fee": 200,
        "bio": "Board-certified cardiologist with 15 years of experience in interventional cardiology and heart failure management.",
        "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah",
    },
    {
        "email": "dr.michael@example.com",
        "full_name": "Dr. Michael Chen",
        "phone": "+1-555-0102",
        "specialization": "Dermatology",
        "qualification": "MD, FAAD",
        "experience_years": 10,
        "consultation_fee": 150,
        "bio": "Specializing in medical and cosmetic dermatology, including skin cancer screening and treatment.",
        "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=Michael",
    },
    {
        "email": "dr.emily@example.com",
        "full_name": "Dr. Emily Williams",
        "phone": "+1-555-0103",
        "specialization": "Pediatrics",
        "qualification": "MD, FAAP",
        "experience_years": 12,
        "consultation_fee": 120,
        "bio": "Caring pediatrician dedicated to providing comprehensive healthcare for infants, children, and adolescents.",
        "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=Emily",
    },
    {
        "email": "dr.james@example.com",
        "full_name": "Dr. James Wilson",
        "phone": "+1-555-0104",
        "specialization": "Orthopedics",
        "qualification": "MD, FAAOS",
        "experience_years": 20,
        "consultation_fee": 250,
        "bio": "Expert orthopedic surgeon specializing in sports medicine, joint replacement, and minimally invasive surgery.",
        "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=James",
    },
    {
        "email": "dr.priya@example.com",
        "full_name": "Dr. Priya Patel",
        "phone": "+1-555-0105",
        "specialization": "Neurology",
        "qualification": "MD, PhD",
        "experience_years": 18,
        "consultation_fee": 300,
        "bio": "Neurologist with expertise in stroke, epilepsy, and neurodegenerative disorders. Published researcher.",
        "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=Priya",
    },
    {
        "email": "dr.david@example.com",
        "full_name": "Dr. David Brown",
        "phone": "+1-555-0106",
        "specialization": "General Medicine",
        "qualification": "MD, FACP",
        "experience_years": 8,
        "consultation_fee": 100,
        "bio": "Internal medicine physician providing comprehensive primary care and preventive medicine services.",
        "avatar_url": "https://api.dicebear.com/9.x/avataaars/svg?seed=David",
    },
]

SCHEDULE_TEMPLATE = [
    {"day_of_week": 0, "start_time": "09:00", "end_time": "17:00", "slot_duration_minutes": 30},
    {"day_of_week": 1, "start_time": "09:00", "end_time": "17:00", "slot_duration_minutes": 30},
    {"day_of_week": 2, "start_time": "09:00", "end_time": "17:00", "slot_duration_minutes": 30},
    {"day_of_week": 3, "start_time": "09:00", "end_time": "17:00", "slot_duration_minutes": 30},
    {"day_of_week": 4, "start_time": "09:00", "end_time": "15:00", "slot_duration_minutes": 30},
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        result = await db.execute(select(User).where(User.role == UserRole.DOCTOR))
        if result.scalars().first():
            print("Database already seeded.")
            return

        # Create a demo patient
        patient = User(
            email="patient@example.com",
            hashed_password=hash_password("password123"),
            full_name="John Doe",
            phone="+1-555-0200",
            role=UserRole.PATIENT,
        )
        db.add(patient)

        for doc_data in DOCTORS:
            user = User(
                email=doc_data["email"],
                hashed_password=hash_password("doctor123"),
                full_name=doc_data["full_name"],
                phone=doc_data["phone"],
                role=UserRole.DOCTOR,
            )
            db.add(user)
            await db.flush()

            profile = DoctorProfile(
                user_id=user.id,
                specialization=doc_data["specialization"],
                qualification=doc_data["qualification"],
                experience_years=doc_data["experience_years"],
                consultation_fee=doc_data["consultation_fee"],
                bio=doc_data["bio"],
                avatar_url=doc_data["avatar_url"],
            )
            db.add(profile)
            await db.flush()

            for sched in SCHEDULE_TEMPLATE:
                schedule = DoctorSchedule(doctor_id=profile.id, **sched)
                db.add(schedule)

        await db.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
