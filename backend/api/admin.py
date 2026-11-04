from django.conf import settings
from django.contrib import admin
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import format_html

from .models import Appointment, AvailableDate, AvailableTime, ContactMessage, Profile, UserScan

# Register your models here.

#contact us 

class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'subject', 'created_at', 'is_replied')
    list_filter = ('subject', 'is_replied', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'message')
    readonly_fields = ('first_name', 'last_name', 'email', 'phone', 'subject', 'message', 'created_at')
    
    fieldsets = (
        (None, {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'subject', 'message', 'created_at')
        }),
        ('Reply', {
            'fields': ('admin_reply',),
            'description': "Enter your reply here. It will be automatically sent to the client when you save."
        }),
    )

admin.site.register(ContactMessage, ContactMessageAdmin)

#Appointments

class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone_number', 'date', 'time', 'status')
    list_filter = ('status', 'date', 'full_name')
    search_fields = ('full_name', 'phone_number', 'email')
    
    fieldsets = (
        ('Client Information', {
            'fields': ('full_name', 'phone_number', 'email', 'notes')
        }),
        ('Appointment Details', {
            'fields': ('date', 'time', 'status')
        }),
    )

    def send_confirmation_email(self, appointment):
        """Send appropriate email based on status"""
        if not appointment.email:
            return  # Skip if no email address provided
        
        context = {
            'appointment': appointment,
            'clinic_name': 'ElHakim AI',
            'contact_phone': '(123) 456-7890'   # Add your contact number
        }

        # For testing - verify this prints in console
        print(f"Attempting to send {appointment.status} email to {appointment.email}")

        if appointment.status == 'confirmed':
            try:
                message = render_to_string('emails/appointment_confirmation.txt', context)
                html_message = render_to_string('emails/appointment_confirmation.html', context)
                
                send_mail(
                    subject=f'Appointment Confirmation - {appointment.date}',
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,  # Must be set in settings.py
                    recipient_list=[appointment.email],
                    html_message=html_message,
                    fail_silently=False,
                )
                print("Confirmation email sent successfully")
            except Exception as e:
                print(f"Failed to send confirmation email: {str(e)}")

        elif appointment.status == 'cancelled':
            try:
                message = render_to_string('emails/appointment_cancelled.txt', context)
                html_message = render_to_string('emails/appointment_cancelled.html', context)
                
                send_mail(
                    subject=f'Appointment Cancelled - {appointment.date}',
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[appointment.email],
                    html_message=html_message,
                    fail_silently=False,
                )
                print("Cancellation email sent successfully")
            except Exception as e:
                print(f"Failed to send cancellation email: {str(e)}")

    def save_model(self, request, obj, form, change):
        """Save model and send appropriate email"""
        super().save_model(request, obj, form, change)  # Save first to ensure status is committed
        
        # Send email only after successful save
        if obj.status in ['confirmed', 'cancelled']:
            self.send_confirmation_email(obj)


# scans 

class UserScanAdmin(admin.ModelAdmin):
    list_display = ('user', 'scan_name', 'upload_date', 'ai_result', 'view_scan_link')
    list_filter = ('upload_date', 'ai_result', 'user')
    search_fields = ('user__username', 'scan_name', 'description')
    
    fieldsets = (
        (None, {
            'fields': ('user', 'scan_name', 'description', 'scan_file')
        }),
    )

    def view_scan_link(self, obj):
        if obj.scan_file:
            return format_html('<a href="{}" target="_blank">View Scan</a>', obj.scan_file.url)
        return "-"
    view_scan_link.short_description = "Scan Link"

    def send_scan_notification(self, scan):
        """Send email notification to user about new scan"""
        if not scan.user.email:
            return  # Skip if user has no email
        
        frontend_url = settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else 'http://localhost:5173'

        context = {
            'user': scan.user,
            'scan': scan,
            'site_name': 'ElHakim AI',
            'login_url': f"{frontend_url}/login"  # Add your login URL
        }

        print(f"Attempting to send scan notification to {scan.user.email}")
        
        try:
            message = render_to_string('emails/scan_uploaded.txt', context)
            html_message = render_to_string('emails/scan_uploaded.html', context)
            
            send_mail(
                subject=f'New Scan Available: {scan.scan_name}',
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[scan.user.email],
                html_message=html_message,
                fail_silently=False,
            )
            print("Scan notification email sent successfully")
        except Exception as e:
            print(f"Failed to send scan notification email: {str(e)}")

    def save_model(self, request, obj, form, change):
        """Save model and send notification email"""
        super().save_model(request, obj, form, change)
        
        # Send email only if this is a new scan or the file was changed
        if not change or 'scan_file' in form.changed_data:
            self.send_scan_notification(obj)

admin.site.register(Appointment, AppointmentAdmin)
admin.site.register(AvailableDate)
admin.site.register(AvailableTime)
admin.site.register(UserScan, UserScanAdmin)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'uses_left', 'purchases')
    search_fields = ('user__username', 'user__email')
