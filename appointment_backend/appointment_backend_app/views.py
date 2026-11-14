from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    DoctorSignupSerializer, PatientSignupSerializer, LoginSerializer, UserSerializer,
    DoctorWithSlotsSerializer, BookAppointmentSerializer, AppointmentSerializer,
    DoctorScheduleSerializer, DoctorScheduleCreateSerializer
)
from .models import Doctor, Patient, DoctorSchedule, Appointment, AppointmentSlot
from datetime import datetime, timedelta
import calendar

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def doctor_signup(request):
    serializer = DoctorSignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def patient_signup(request):
    serializer = PatientSignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_doctors_with_slots(request):
    """
    API to list all doctors with their available appointment slots for the next 7 days.
    Only accessible to authenticated patients.
    """
    if request.user.user_type != 'patient':
        return Response({'error': 'Only patients can view doctor slots.'}, status=status.HTTP_403_FORBIDDEN)

    doctors = Doctor.objects.all()
    serializer = DoctorWithSlotsSerializer(doctors, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    """
    API to book an appointment with a doctor.
    Only accessible to authenticated patients.
    """
    if request.user.user_type != 'patient':
        return Response({'error': 'Only patients can book appointments.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = BookAppointmentSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        appointment = serializer.save()
        return Response({
            'message': 'Appointment booked successfully.',
            'appointment': AppointmentSerializer(appointment).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_doctor_appointments(request):
    """
    API to list all appointments for a logged-in doctor.
    Only accessible to authenticated doctors.
    """
    if request.user.user_type != 'doctor':
        return Response({'error': 'Only doctors can view their appointments.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        doctor = Doctor.objects.get(user=request.user)
        appointments = Appointment.objects.filter(doctor=doctor).order_by('-appointment_slot__date', '-appointment_slot__start_time')
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_patient_appointments(request):
    """
    API to list all appointments for a logged-in patient.
    Only accessible to authenticated patients.
    """
    if request.user.user_type != 'patient':
        return Response({'error': 'Only patients can view their appointments.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        patient = Patient.objects.get(user=request.user)
        appointments = Appointment.objects.filter(patient=patient).order_by('-appointment_slot__date', '-appointment_slot__start_time')
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient profile not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_doctor_schedule(request):
    """
    API to get doctor's current schedule.
    Only accessible to authenticated doctors.
    """
    try:
        doctor = Doctor.objects.get(user=request.user)
        schedules = DoctorSchedule.objects.filter(doctor=doctor)
        serializer = DoctorScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_doctor_schedule(request):
    """
    API to set doctor's schedule for a specific day.
    Automatically generates appointment slots with 15-minute intervals.
    Only accessible to authenticated doctors.
    """
    if request.user.user_type != 'doctor':
        return Response({'error': 'Only doctors can set their schedule.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = DoctorScheduleCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        schedule = serializer.save()
        
        # Generate appointment slots for the next 30 days for this schedule
        try:
            doctor = Doctor.objects.get(user=request.user)
            day_name = schedule.day_of_week.lower()
            
            # Get the day of week number (0=Monday, 6=Sunday)
            day_mapping = {
                'monday': 0,
                'tuesday': 1,
                'wednesday': 2,
                'thursday': 3,
                'friday': 4,
                'saturday': 5,
                'sunday': 6,
            }
            target_day = day_mapping[day_name]
            
            # Find dates for the next 30 days that match this day of week
            today = datetime.now().date()
            slots_created = 0
            
            for i in range(30):
                check_date = today + timedelta(days=i)
                if check_date.weekday() == target_day:
                    # Generate 15-minute interval slots for this date
                    current_time = datetime.combine(check_date, schedule.start_time)
                    end_time_datetime = datetime.combine(check_date, schedule.end_time)
                    
                    while current_time < end_time_datetime:
                        slot_end_time = current_time + timedelta(minutes=15)
                        
                        # Only create slot if it doesn't exceed the schedule end time
                        if slot_end_time <= end_time_datetime:
                            AppointmentSlot.objects.get_or_create(
                                doctor=doctor,
                                date=check_date,
                                start_time=current_time.time(),
                                defaults={'end_time': slot_end_time.time(), 'is_available': True}
                            )
                            slots_created += 1
                        
                        current_time = slot_end_time
            
            return Response({
                'message': f'Schedule updated successfully. Generated {slots_created} appointment slots.',
                'schedule': DoctorScheduleSerializer(schedule).data,
                'slots_created': slots_created
            }, status=status.HTTP_201_CREATED)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Error generating appointment slots: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_doctor_schedule(request, schedule_id):
    """
    API to delete a doctor's schedule for a specific day.
    Only accessible to authenticated doctors.
    """
    if request.user.user_type != 'doctor':
        return Response({'error': 'Only doctors can delete their schedule.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        doctor = Doctor.objects.get(user=request.user)
        schedule = DoctorSchedule.objects.get(id=schedule_id, doctor=doctor)
        schedule.delete()
        return Response({'message': 'Schedule deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found.'}, status=status.HTTP_404_NOT_FOUND)
    except DoctorSchedule.DoesNotExist:
        return Response({'error': 'Schedule not found.'}, status=status.HTTP_404_NOT_FOUND)
