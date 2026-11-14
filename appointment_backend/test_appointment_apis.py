import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_patient_login():
    """Test patient login"""
    url = f'{BASE_URL}/auth/login/'
    data = {
        'username': 'patient1',
        'password': 'password123'
    }
    response = requests.post(url, json=data)
    print(f'Patient Login Status: {response.status_code}')
    if response.status_code == 200:
        print('Patient login successful!')
        return response.json()
    else:
        print(f'Error: {response.text}')
        return None

def test_doctor_login():
    """Test doctor login"""
    url = f'{BASE_URL}/auth/login/'
    data = {
        'username': 'doctor1',
        'password': 'password123'
    }
    response = requests.post(url, json=data)
    print(f'Doctor Login Status: {response.status_code}')
    if response.status_code == 200:
        print('Doctor login successful!')
        return response.json()
    else:
        print(f'Error: {response.text}')
        return None

def test_list_doctors_with_slots(token):
    """Test API 1: List doctors with appointment slots"""
    url = f'{BASE_URL}/doctors/'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.get(url, headers=headers)
    print(f'List Doctors with Slots Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Successfully retrieved {len(data)} doctors with their slots')
        # Show first doctor as example
        if data:
            doctor = data[0]
            slots_count = len(doctor.get('appointment_slots', []))
            print(f'Example: {doctor["user"]["first_name"]} {doctor["user"]["last_name"]} - {doctor["specialization"]} has {slots_count} available slots')
        return data
    else:
        print(f'Error: {response.text}')
        return None

def test_book_appointment(token, slot_id):
    """Test API 2: Book appointment"""
    url = f'{BASE_URL}/appointments/book/'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    data = {
        'appointment_slot_id': slot_id,
        'symptoms': 'Headache and fever'
    }
    response = requests.post(url, json=data, headers=headers)
    print(f'Book Appointment Status: {response.status_code}')
    if response.status_code == 201:
        print('Appointment booked successfully!')
        return response.json()
    else:
        print(f'Error: {response.text}')
        return None

def test_list_doctor_appointments(token):
    """Test API 3: List doctor's appointments"""
    url = f'{BASE_URL}/appointments/'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.get(url, headers=headers)
    print(f'List Doctor Appointments Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Doctor has {len(data)} appointments')
        return data
    else:
        print(f'Error: {response.text}')
        return None

def main():
    print("Testing Appointment Booking APIs...")
    print("=" * 50)

    # Test patient login
    print("\n1. Testing Patient Login...")
    patient_data = test_patient_login()
    if not patient_data:
        print("Patient login failed, cannot continue testing")
        return

    patient_token = patient_data['tokens']['access']

    # Test doctor login
    print("\n2. Testing Doctor Login...")
    doctor_data = test_doctor_login()
    if not doctor_data:
        print("Doctor login failed, cannot continue testing")
        return

    doctor_token = doctor_data['tokens']['access']

    # Test API 1: List doctors with slots
    print("\n3. Testing API 1: List Doctors with Appointment Slots...")
    doctors_data = test_list_doctors_with_slots(patient_token)
    if not doctors_data:
        print("Failed to get doctors list")
        return

    # Get first available slot ID for booking
    slot_id = None
    for doctor in doctors_data:
        slots = doctor.get('appointment_slots', [])
        if slots:
            slot_id = slots[0]['id']
            break

    if not slot_id:
        print("No available slots found for booking")
        return

    # Test API 2: Book appointment
    print(f"\n4. Testing API 2: Book Appointment (Slot ID: {slot_id})...")
    booking_data = test_book_appointment(patient_token, slot_id)
    if not booking_data:
        print("Failed to book appointment")
        return

    # Test API 3: List doctor's appointments
    print("\n5. Testing API 3: List Doctor's Appointments...")
    appointments_data = test_list_doctor_appointments(doctor_token)
    if appointments_data is not None:
        print("Successfully retrieved doctor's appointments")

    print("\n" + "=" * 50)
    print("All API tests completed!")

if __name__ == '__main__':
    main()