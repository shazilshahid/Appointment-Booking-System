import os
import django
from datetime import date, time, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appointment_backend.settings')
django.setup()

from appointment_backend_app.models import Doctor, AppointmentSlot

def create_appointment_slots():
    print("Creating appointment slots for existing doctors...")

    doctors = Doctor.objects.all()
    if not doctors:
        print("No doctors found. Please create doctors first.")
        return

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

    slots_created = 0
    for i in range(7):  # Next 7 days
        slot_date = today + timedelta(days=i)
        for doctor in doctors:
            for start_time, end_time in time_slots:
                # Check if slot already exists
                if not AppointmentSlot.objects.filter(
                    doctor=doctor,
                    date=slot_date,
                    start_time=start_time
                ).exists():
                    AppointmentSlot.objects.create(
                        doctor=doctor,
                        date=slot_date,
                        start_time=start_time,
                        end_time=end_time,
                        is_available=True
                    )
                    slots_created += 1

    total_slots = AppointmentSlot.objects.count()
    print(f"Created {slots_created} new appointment slots")
    print(f"Total appointment slots: {total_slots} for {len(doctors)} doctors over 7 days")

if __name__ == '__main__':
    create_appointment_slots()