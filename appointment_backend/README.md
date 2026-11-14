# Appointment Booking System - Backend APIs

This Django REST API provides authentication endpoints for doctors and patients in an appointment booking system.

## Setup

1. Install dependencies:
```bash
pip install djangorestframework djangorestframework-simplejwt
```

2. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

3. Start the server:
```bash
python manage.py runserver
```

## API Endpoints

### Authentication Endpoints

#### 1. Doctor Signup
**POST** `/api/auth/doctor/signup/`

Creates a new doctor account.

**Request Body:**
```json
{
    "username": "doctor_username",
    "email": "doctor@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "address": "123 Medical St, City, State"
}
```

#### 2. Patient Signup
**POST** `/api/auth/patient/signup/`

Creates a new patient account.

**Request Body:**
```json
{
    "username": "patient_username",
    "email": "patient@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "Jane",
    "last_name": "Smith",
    "phone_number": "+0987654321",
    "address": "456 Health Ave, City, State"
}
```

#### 3. Login
**POST** `/api/auth/login/`

Authenticates a user (doctor or patient).

**Request Body:**
```json
{
    "username": "username",
    "password": "password123"
}
```

### Appointment Endpoints

#### 4. List Doctors with Appointment Slots
**GET** `/api/doctors/`

Lists all doctors with their available appointment slots for the next 7 days. **Requires patient authentication.**

**Headers:**
```
Authorization: Bearer <patient_access_token>
```

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "user": {
            "id": 1,
            "username": "doctor1",
            "email": "doctor@example.com",
            "first_name": "John",
            "last_name": "Smith",
            "user_type": "doctor",
            "phone_number": "+1234567890",
            "address": "123 Medical St"
        },
        "specialization": "Cardiology",
        "license_number": "LIC001",
        "experience_years": 15,
        "bio": "Experienced cardiologist",
        "appointment_slots": [
            {
                "id": 1,
                "doctor": 1,
                "date": "2026-01-18",
                "start_time": "09:00:00",
                "end_time": "09:30:00",
                "is_available": true
            }
        ]
    }
]
```

#### 5. Book Appointment
**POST** `/api/appointments/book/`

Books an appointment with a doctor. **Requires patient authentication.**

**Headers:**
```
Authorization: Bearer <patient_access_token>
```

**Request Body:**
```json
{
    "appointment_slot_id": 1,
    "symptoms": "Headache and fever"
}
```

**Response (201 Created):**
```json
{
    "message": "Appointment booked successfully.",
    "appointment": {
        "id": 1,
        "patient": {
            "id": 1,
            "user": {
                "id": 2,
                "username": "patient1",
                "email": "patient@example.com",
                "first_name": "Jane",
                "last_name": "Smith",
                "user_type": "patient"
            }
        },
        "doctor": {
            "id": 1,
            "user": {
                "id": 1,
                "username": "doctor1",
                "email": "doctor@example.com",
                "first_name": "John",
                "last_name": "Smith",
                "user_type": "doctor"
            },
            "specialization": "Cardiology",
            "license_number": "LIC001",
            "experience_years": 15,
            "bio": "Experienced cardiologist"
        },
        "appointment_slot": {
            "id": 1,
            "doctor": 1,
            "date": "2026-01-18",
            "start_time": "09:00:00",
            "end_time": "09:30:00",
            "is_available": false
        },
        "status": "scheduled",
        "symptoms": "Headache and fever",
        "notes": "",
        "created_at": "2026-01-18T10:30:00Z",
        "updated_at": "2026-01-18T10:30:00Z"
    }
}
```

#### 6. List Doctor's Appointments
**GET** `/api/appointments/`

Lists all appointments for the logged-in doctor. **Requires doctor authentication.**

**Headers:**
```
Authorization: Bearer <doctor_access_token>
```

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "patient": {
            "id": 1,
            "user": {
                "id": 2,
                "username": "patient1",
                "email": "patient@example.com",
                "first_name": "Jane",
                "last_name": "Smith",
                "user_type": "patient"
            }
        },
        "doctor": {
            "id": 1,
            "user": {
                "id": 1,
                "username": "doctor1",
                "email": "doctor@example.com",
                "first_name": "John",
                "last_name": "Smith",
                "user_type": "doctor"
            },
            "specialization": "Cardiology",
            "license_number": "LIC001",
            "experience_years": 15,
            "bio": "Experienced cardiologist"
        },
        "appointment_slot": {
            "id": 1,
            "doctor": 1,
            "date": "2026-01-18",
            "start_time": "09:00:00",
            "end_time": "09:30:00",
            "is_available": false
        },
        "status": "scheduled",
        "symptoms": "Headache and fever",
        "notes": "",
        "created_at": "2026-01-18T10:30:00Z",
        "updated_at": "2026-01-18T10:30:00Z"
    }
]
```

## Authentication

All appointment endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Testing

Run the comprehensive test script:

```bash
python test_appointment_apis.py
```

This will test all three appointment APIs in sequence and verify:
- ✅ Patient login
- ✅ Doctor login  
- ✅ List doctors with appointment slots (API 1)
- ✅ Book appointment (API 2)
- ✅ List doctor's appointments (API 3)

## Current Status

✅ **All APIs Implemented and Tested:**
1. **List Doctors with Slots** - Patients can view all doctors and their available appointment slots
2. **Book Appointment** - Patients can book appointments with doctors
3. **List Doctor Appointments** - Doctors can view their scheduled appointments

✅ **Features:**
- JWT authentication for all endpoints
- Role-based access control (patients vs doctors)
- Automatic slot availability management
- Comprehensive error handling
- Sample data with 6 doctors and 168+ appointment slots

## Sample Data

The system includes:
- **6 Doctors**: Cardiology, Dermatology, Orthopedics, and General Medicine specialists
- **168+ Appointment Slots**: 8 time slots per day for 7 days for each doctor
- **Patient Users**: Ready for testing appointment booking
- **Doctor Users**: Ready for viewing appointments