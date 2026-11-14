import os
import django
from datetime import date, time, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appointment_backend.settings')
django.setup()

from appointment_backend_app.models import User, Doctor, Patient, AppointmentSlot

def create_sample_data():
    print("Creating sample doctors and appointment slots...")

    # Create sample doctors
    doctors_data = [
        {
            'username': 'dr_smith_cardio',
            'email': 'smith@example.com',
            'first_name': 'John',
            'last_name': 'Smith',
            'specialization': 'Cardiology',
            'license_number': 'LIC001',
            'experience_years': 15,
            'bio': 'Experienced cardiologist with 15 years of practice.'
        },
        {
            'username': 'dr_jones_derma',
            'email': 'jones@example.com',
            'first_name': 'Sarah',
            'last_name': 'Jones',
            'specialization': 'Dermatology',
            'license_number': 'LIC002',
            'experience_years': 10,
            'bio': 'Dermatologist specializing in skin conditions.'
        },
        {
            'username': 'dr_brown_ortho',
            'email': 'brown@example.com',
            'first_name': 'Michael',
            'last_name': 'Brown',
            'specialization': 'Orthopedics',
            'license_number': 'LIC003',
            'experience_years': 12,
            'bio': 'Orthopedic surgeon with expertise in joint replacements.'
        }
    ]

    doctors = []
    for doctor_data in doctors_data:
        # Create user
        user = User.objects.create_user(
            username=doctor_data['username'],
            email=doctor_data['email'],
            password='password123',
            first_name=doctor_data['first_name'],
            last_name=doctor_data['last_name'],
            user_type='doctor'
        )

        # Create doctor profile
        doctor = Doctor.objects.create(
            user=user,
            specialization=doctor_data['specialization'],
            license_number=doctor_data['license_number'],
            experience_years=doctor_data['experience_years'],
            bio=doctor_data['bio']
        )
        doctors.append(doctor)
        print(f"Created doctor: {doctor}")

    # Create sample patients
    patients_data = [
        {
            'username': 'patient_alice',
            'email': 'alice@example.com',
            'first_name': 'Alice',
            'last_name': 'Johnson'
        },
        {
            'username': 'patient_bob',
            'email': 'bob@example.com',
            'first_name': 'Bob',
            'last_name': 'Wilson'
        }
    ]

    for patient_data in patients_data:
        user = User.objects.create_user(
            username=patient_data['username'],
            email=patient_data['email'],
            password='password123',
            first_name=patient_data['first_name'],
            last_name=patient_data['last_name'],
            user_type='patient'
        )

        patient = Patient.objects.create(user=user)
        print(f"Created patient: {patient}")

    # Create appointment slots for the next 7 days
    today = date.today()
    time_slots = [
        (time(9, 0), time(9, 30)),
        (time(9, 30), time(10, 0)),
        (time(10, 0), time(10, 30)),
        (time(10, 30), time(11, 0)),
        (time(14, 0), time(14, 30)),
        (time(14, 30), time(15, 0)),
        (time(15, 0), time(15, 30)),
        (time(15, 30), time(16, 0)),
    ]

    for i in range(7):  # Next 7 days
        slot_date = today + timedelta(days=i)
        for doctor in doctors:
            for start_time, end_time in time_slots:
                AppointmentSlot.objects.create(
                    doctor=doctor,
                    date=slot_date,
                    start_time=start_time,
                    end_time=end_time,
                    is_available=True
                )

    total_slots = AppointmentSlot.objects.count()
    print(f"Created {total_slots} appointment slots for {len(doctors)} doctors over 7 days")
    print("Sample data creation completed!")

if __name__ == '__main__':
    create_sample_data()