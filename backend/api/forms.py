from django import forms
from .models import ContactMessage
from .models import AvailableDate, AvailableTime, Appointment
from django.utils import timezone

class ContactMessageForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ['first_name', 'last_name', 'email', 'phone', 'subject', 'message']


#appointment

class AppointmentForm(forms.ModelForm):
    date = forms.ModelChoiceField(
        queryset=AvailableDate.objects.filter(date__gte=timezone.now().date()),
        widget=forms.Select(attrs={'class': 'form-control'}),
        empty_label="Select a date"
    )
    
    time = forms.ModelChoiceField(
        queryset=AvailableTime.objects.all(),
        widget=forms.Select(attrs={'class': 'form-control'}),
        empty_label="Select a time"
    )
    
    class Meta:
        model = Appointment
        fields = ['full_name', 'phone_number', 'email','notes', 'date', 'time']
        widgets = {
            'full_name': forms.TextInput(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
