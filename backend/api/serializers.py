from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers

from .models import Appointment, AvailableDate, AvailableTime, ContactMessage, Profile, UserScan

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        validate_password(attrs["password"], User(username=attrs.get("username"), email=attrs.get("email")))
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Profile.objects.get_or_create(user=user)
        return user


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["first_name", "last_name", "email", "phone", "subject", "message"]


class AvailableDateSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%Y-%m-%d")

    class Meta:
        model = AvailableDate
        fields = ["id", "date"]


class AvailableTimeSerializer(serializers.ModelSerializer):
    time = serializers.TimeField(format="%H:%M")

    class Meta:
        model = AvailableTime
        fields = ["id", "time"]


class AppointmentSerializer(serializers.ModelSerializer):
    date = serializers.PrimaryKeyRelatedField(queryset=AvailableDate.objects.all())
    time = serializers.PrimaryKeyRelatedField(queryset=AvailableTime.objects.all())

    class Meta:
        model = Appointment
        fields = ["id", "full_name", "phone_number", "email", "date", "time", "notes", "status"]
        read_only_fields = ["id", "status"]

    def validate(self, attrs):
        date, time = attrs["date"], attrs["time"]
        if date.date < timezone.localdate():
            raise serializers.ValidationError({"date": "This date is in the past."})
        if not date.available_times.filter(pk=time.pk).exists():
            raise serializers.ValidationError({"time": "This time is not offered on the selected date."})
        if Appointment.objects.filter(date=date, time=time).exclude(status="cancelled").exists():
            raise serializers.ValidationError({"time": "This time slot is already booked."})
        return attrs


class UserScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserScan
        fields = [
            "id", "scan_name", "description", "scan_file", "upload_date",
            "is_ai_analyzed", "ai_result", "ai_confidence",
        ]


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = ("username", "email", "uses_left", "purchases")
