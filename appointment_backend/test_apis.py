import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_doctor_signup():
    url = f'{BASE_URL}/auth/doctor/signup/'
    data = {
        'username': 'doctor1',
        'email': 'doctor1@example.com',
        'password': 'password123',
        'password_confirm': 'password123',
        'first_name': 'John',
        'last_name': 'Doe',
        'phone_number': '+1234567890',
        'address': '123 Medical St, City, State'
    }
    response = requests.post(url, json=data)
    print(f'Doctor Signup Status: {response.status_code}')
    if response.status_code == 201:
        print('Doctor signup successful!')
        return response.json()
    else:
        print(f'Error: {response.text}')
        return None

def test_patient_signup():
    url = f'{BASE_URL}/auth/patient/signup/'
    data = {
        'username': 'patient1',
        'email': 'patient1@example.com',
        'password': 'password123',
        'password_confirm': 'password123',
        'first_name': 'Jane',
        'last_name': 'Smith',
        'phone_number': '+0987654321',
        'address': '456 Health Ave, City, State'
    }
    response = requests.post(url, json=data)
    print(f'Patient Signup Status: {response.status_code}')
    if response.status_code == 201:
        print('Patient signup successful!')
        return response.json()
    else:
        print(f'Error: {response.text}')
        return None

def test_login():
    url = f'{BASE_URL}/auth/login/'
    data = {
        'username': 'doctor1',
        'password': 'password123'
    }
    response = requests.post(url, json=data)
    print(f'Login Status: {response.status_code}')
    if response.status_code == 200:
        print('Login successful!')
        return response.json()
    else:
        print(f'Error: {response.text}')
        return None

if __name__ == '__main__':
    print('Testing Appointment System APIs...')
    print('=' * 40)

    # Test doctor signup
    doctor_data = test_doctor_signup()
    print()

    # Test patient signup
    patient_data = test_patient_signup()
    print()

    # Test login
    login_data = test_login()
    print()

    print('API testing completed!')