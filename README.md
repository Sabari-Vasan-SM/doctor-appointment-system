# MedBook - Doctor Appointment Booking System

A modern SaaS Doctor Appointment Booking System built with FastAPI and React.

![MedBook](https://img.shields.io/badge/MedBook-Doctor%20Appointments-blue)

## Features

- **Patient Portal**: Browse doctors, book appointments, track appointment history
- **Doctor Dashboard**: Manage appointments, update availability, view patient details
- **Real-time Slot Management**: Dynamic time slot generation based on doctor schedules
- **JWT Authentication**: Secure login/registration with role-based access control
- **Modern UI**: Responsive design with Tailwind CSS and Lucide icons
- **Demo Data**: Pre-seeded with sample doctors across 6 specializations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | FastAPI, SQLAlchemy (async), Pydantic v2 |
| Database | SQLite (async via aiosqlite) |
| Auth | JWT (python-jose), bcrypt |
| Icons | Lucide React |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e .
python -m app.seed          # Seed demo data
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@example.com | password123 |
| Doctor | dr.sarah@example.com | doctor123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new patient
- `POST /api/auth/register-doctor` - Register a new doctor
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Doctors
- `GET /api/doctors/` - List all available doctors
- `GET /api/doctors/specializations` - List specializations
- `GET /api/doctors/{id}` - Get doctor details
- `GET /api/doctors/{id}/schedules` - Get doctor schedules

### Appointments
- `POST /api/appointments/` - Book an appointment
- `GET /api/appointments/my` - Get my appointments
- `PUT /api/appointments/{id}` - Update appointment status
- `GET /api/appointments/slots/{doctor_id}/{date}` - Get available slots
- `GET /api/appointments/stats` - Get dashboard statistics

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Settings
│   │   ├── database.py      # Database connection
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── auth.py          # Authentication utilities
│   │   ├── seed.py          # Database seeder
│   │   └── routers/
│   │       ├── auth.py      # Auth endpoints
│   │       ├── doctors.py   # Doctor endpoints
│   │       └── appointments.py  # Appointment endpoints
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── lib/             # API client & types
│   │   └── pages/           # Page components
│   └── package.json
└── README.md
```

## License

MIT
