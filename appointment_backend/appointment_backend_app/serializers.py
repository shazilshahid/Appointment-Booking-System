from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Doctor, Patient, DoctorSchedule, AppointmentSlot, Appointment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'phone_number', 'address')
        read_only_fields = ('id',)


class DoctorSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    specialization = serializers.CharField(required=True)
    license_number = serializers.CharField(required=True)
    experience_years = serializers.IntegerField(required=False, default=0)
    bio = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 
                  'phone_number', 'address', 'specialization', 'license_number', 'experience_years', 'bio')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Check if license number already exists
        license_number = attrs.get('license_number')
        if Doctor.objects.filter(license_number=license_number).exists():
            raise serializers.ValidationError("A doctor with this license number already exists")
        
        return attrs

    def create(self, validated_data):
        # Extract doctor-specific fields
        specialization = validated_data.pop('specialization')
        license_number = validated_data.pop('license_number')
        experience_years = validated_data.pop('experience_years', 0)
        bio = validated_data.pop('bio', '')
        validated_data.pop('password_confirm')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_type='doctor'
        )
        user.phone_number = validated_data.get('phone_number')
        user.address = validated_data.get('address')
        user.save()
        
        # Create doctor profile
        Doctor.objects.create(
            user=user,
            specialization=specialization,
            license_number=license_number,
            experience_years=experience_years,
            bio=bio
        )
        
        return user


class PatientSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone_number', 'address')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_type='patient'
        )
        user.phone_number = validated_data.get('phone_number')
        user.address = validated_data.get('address')
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Doctor
        fields = ('id', 'user', 'specialization', 'license_number', 'experience_years', 'bio')


class DoctorScheduleSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = DoctorSchedule
        fields = ('id', 'doctor', 'day_of_week', 'start_time', 'end_time', 'is_active')

    def validate(self, attrs):
        if attrs['start_time'] >= attrs['end_time']:
            raise serializers.ValidationError("Start time must be before end time")
        return attrs


class DoctorScheduleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorSchedule
        fields = ('day_of_week', 'start_time', 'end_time', 'is_active')

    def validate(self, attrs):
        if attrs['start_time'] >= attrs['end_time']:
            raise serializers.ValidationError("Start time must be before end time")
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        try:
            doctor = Doctor.objects.get(user=user)
        except Doctor.DoesNotExist:
            raise serializers.ValidationError("Doctor profile not found.")

        # Check if schedule already exists for this day
        existing_schedule = DoctorSchedule.objects.filter(
            doctor=doctor,
            day_of_week=validated_data['day_of_week']
        ).first()

        if existing_schedule:
            # Update existing schedule
            for attr, value in validated_data.items():
                setattr(existing_schedule, attr, value)
            existing_schedule.save()
            return existing_schedule
        else:
            # Create new schedule
            return DoctorSchedule.objects.create(doctor=doctor, **validated_data)


class AppointmentSlotSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = AppointmentSlot
        fields = ('id', 'doctor', 'date', 'start_time', 'end_time', 'is_available')


class DoctorWithSlotsSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    appointment_slots = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = ('id', 'user', 'specialization', 'license_number', 'experience_years', 'bio', 'appointment_slots')

    def get_appointment_slots(self, obj):
        # Get available slots for the next 7 days
        from datetime import date, timedelta
        today = date.today()
        end_date = today + timedelta(days=7)
        slots = obj.appointment_slots.filter(
            date__gte=today,
            date__lte=end_date,
            is_available=True
        ).order_by('date', 'start_time')
        return AppointmentSlotSerializer(slots, many=True).data


class AppointmentSerializer(serializers.ModelSerializer):
    patient = serializers.SerializerMethodField()
    doctor = DoctorSerializer(read_only=True)
    appointment_slot = AppointmentSlotSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = ('id', 'patient', 'doctor', 'appointment_slot', 'status', 'symptoms', 'notes', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_patient(self, obj):
        return {
            'id': obj.patient.id,
            'user': UserSerializer(obj.patient.user).data
        }


class BookAppointmentSerializer(serializers.Serializer):
    appointment_slot_id = serializers.IntegerField()
    symptoms = serializers.CharField(required=False, allow_blank=True)

    def validate_appointment_slot_id(self, value):
        try:
            slot = AppointmentSlot.objects.get(id=value)
            if not slot.is_available:
                raise serializers.ValidationError("This appointment slot is not available.")
            return value
        except AppointmentSlot.DoesNotExist:
            raise serializers.ValidationError("Appointment slot does not exist.")

    def create(self, validated_data):

        user = self.context['request'].user
        try:
            patient = Patient.objects.get(user=user)
        except Patient.DoesNotExist:
            raise serializers.ValidationError("Patient profile not found.")

        slot = AppointmentSlot.objects.get(id=validated_data['appointment_slot_id'])

        # Check if slot is still available
        if not slot.is_available:
            raise serializers.ValidationError("This appointment slot is no longer available.")

        # Create appointment
        appointment = Appointment.objects.create(
            patient=patient,
            doctor=slot.doctor,
            appointment_slot=slot,
            symptoms=validated_data.get('symptoms', '')
        )

        # Mark slot as unavailable
        slot.is_available = False
        slot.save()

        return appointment