from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/doctor/signup/', views.doctor_signup, name='doctor_signup'),
    path('auth/patient/signup/', views.patient_signup, name='patient_signup'),
    path('auth/login/', views.login, name='login'),

    # Appointment endpoints
    path('doctors/', views.list_doctors_with_slots, name='list_doctors_with_slots'),
    path('appointments/book/', views.book_appointment, name='book_appointment'),
    path('appointments/doctor/', views.list_doctor_appointments, name='list_doctor_appointments'),
    path('appointments/patient/', views.list_patient_appointments, name='list_patient_appointments'),

    # Schedule management endpoints
    path('schedules/', views.get_doctor_schedule, name='get_doctor_schedule'),
    path('schedules/set/', views.set_doctor_schedule, name='set_doctor_schedule'),
    path('schedules/<int:schedule_id>/', views.delete_doctor_schedule, name='delete_doctor_schedule'),
]