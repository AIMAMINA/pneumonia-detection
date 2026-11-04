from django.db import models
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

# Create your models here.
class ContactMessage(models.Model):
    SUBJECT_CHOICES = [
        ('symptoms', 'Symptoms Inquiry'),
        ('diagnosis', 'AI Diagnosis Results'),
        ('appointment', 'Appointment Booking'),
        ('report', 'Medical Report Request'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_replied = models.BooleanField(default=False)
    admin_reply = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.subject}"

    def save(self, *args, **kwargs):
        # Send email only when admin_reply is set and message wasn't replied before
        if self.admin_reply and not self.is_replied:
            self.send_reply_email()
            self.is_replied = True
        super().save(*args, **kwargs)

    def send_reply_email(self):
        subject = f"Re: {self.get_subject_display()}"
        message = f"""Dear {self.first_name},

Thank you for contacting us. Here's our response to your inquiry:

{self.admin_reply}

Best regards,
Your Healthcare Team

Original message:
{self.message}"""
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [self.email],
            fail_silently=False,
        )


# appointment form model to store doctor availability 
User = get_user_model()

class AvailableDate(models.Model):
    date = models.DateField(unique=True)
    available_times = models.ManyToManyField('AvailableTime', related_name='available_dates')
    
    def __str__(self):
        return self.date.strftime('%Y-%m-%d')

class AvailableTime(models.Model):
    time = models.TimeField(unique=True)
    
    def __str__(self):
        return self.time.strftime('%H:%M')


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    date = models.ForeignKey(AvailableDate, on_delete=models.CASCADE)
    time = models.ForeignKey(AvailableTime, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.full_name} - {self.date} {self.time}"
    
    class Meta:
        constraints = [
            # A slot can be booked again once the previous appointment is cancelled
            models.UniqueConstraint(
                fields=['date', 'time'],
                condition=~Q(status='cancelled'),
                name='unique_active_appointment_slot',
            ),
        ]


class UserScan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    scan_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    scan_file = models.FileField(upload_to='user_scans/')
    upload_date = models.DateTimeField(auto_now_add=True)
    is_ai_analyzed = models.BooleanField(default=False)
    ai_result = models.CharField(max_length=20, blank=True)
    ai_confidence = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s {self.scan_name}"
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    uses_left = models.PositiveIntegerField(default=0)
    purchases = models.PositiveIntegerField(default=0)  # Track total purchases

    def __str__(self):
        return f"{self.user.username}: {self.uses_left} uses left"