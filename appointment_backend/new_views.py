
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_doctor_schedule(request):
    """
    API to get doctor's current schedule.
    Only accessible to authenticated doctors.
    """
    if request.user.user_type != 'doctor':
        return Response({'error': 'Only doctors can view their schedule.'}, status=status.HTTP_403_FORBIDDEN)

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
    Only accessible to authenticated doctors.
    """
    if request.user.user_type != 'doctor':
        return Response({'error': 'Only doctors can set their schedule.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = DoctorScheduleCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        schedule = serializer.save()
        return Response({
            'message': 'Schedule updated successfully.',
            'schedule': DoctorScheduleSerializer(schedule).data
        }, status=status.HTTP_201_CREATED)
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