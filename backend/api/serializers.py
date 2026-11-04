from django.contrib.auth.models import User
from rest_framework import serializers
from .models import AvailableDate, AvailableTime, Appointment, UserScan, Profile


class UserSerializer(serializers.ModelSerializer):
  email = serializers.EmailField(required=True)

  class Meta:
    model = User
    fields = ["id", "username", "email", "password"]
    extra_kwargs = {"password": {"write_only": True},
                    "email":{"required":True}
                    }

  def create(self, validated_data):
   user = User.objects.create_user(
      username=validated_data['username'],
      email=validated_data['email'],
      password=validated_data['password']
   )
   return user

class AvailableDateSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format='%Y-%m-%d')
    class Meta:
        model = AvailableDate
        fields = ['id', 'date']

class AvailableTimeSerializer(serializers.ModelSerializer):
    time = serializers.TimeField(format='%H:%M')
    
    class Meta:
        model = AvailableTime
        fields = ['id', 'time']

class AppointmentSerializer(serializers.ModelSerializer):
    date = serializers.PrimaryKeyRelatedField(queryset=AvailableDate.objects.all())
    time = serializers.PrimaryKeyRelatedField(queryset=AvailableTime.objects.all())

    class Meta:
        model = Appointment
        fields = ['full_name', 'phone_number', 'email', 'date', 'time', 'notes']


class UserScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserScan
        fields = ['scan_name', 'description', 'scan_file', 'upload_date']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('uses_left',)