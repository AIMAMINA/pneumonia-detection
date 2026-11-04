from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from rest_framework import generics

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework_simplejwt.views import TokenObtainPairView

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .serializers import UserSerializer, AppointmentSerializer, AvailableDateSerializer, AvailableTimeSerializer, UserScanSerializer, ProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import AvailableDate, AvailableTime, Appointment, ContactMessage, UserScan, Profile
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.contrib import messages
from .forms import AppointmentForm
from rest_framework.decorators import permission_classes
from django.core.exceptions import ValidationError
from django.utils.dateparse import parse_date
import tensorflow as tf
import numpy as np
from tensorflow import keras
from PIL import Image
import os

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.template.loader import get_template
from django.http import HttpResponse
from xhtml2pdf import pisa
from django.templatetags.static import static
import datetime
# Create your views here.

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class EmailTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # If email is provided, find username
        if 'email' in request.data:
            try:
                user = User.objects.get(email=request.data['email'])
                request.data._mutable = True
                request.data['username'] = user.username
                request.data._mutable = False
            except User.DoesNotExist:
                pass
        return super().post(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    return Response({
        'api': 'Authentication API',
        'endpoints': {
            'register': reverse('register', request=request, format=format),
            'login': reverse('get_token', request=request, format=format),
            'token_refresh': reverse('refresh', request=request, format=format),
            'profile': reverse('get_profile', request=request, format=format),
            'payment': '/api/fake-payment/',
            'use_check': '/api/use-check/',
            'predict_scan': '/api/predict-scan/',
        },
    })
    
#contact us view 
@csrf_exempt
def submit_contact(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            if not all(field in data for field in ['first_name', 'last_name', 'email', 'phone', 'subject', 'message']):
                return JsonResponse({"error": "Missing fields"}, status=400)

            ContactMessage.objects.create(
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                phone=data["phone"],
                subject=data["subject"],
                message=data["message"]
            )
            return JsonResponse({"message": "Message received successfully!"})
        except Exception as e:
            print("Error:", str(e))
            return JsonResponse({"error": "Invalid data"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)


#book appointment view 

@api_view(['GET'])
@permission_classes([AllowAny])
def available_dates(request):
    dates = AvailableDate.objects.filter(date__gte=timezone.now().date())
    serializer = AvailableDateSerializer(dates, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def available_times(request):
    date_str = request.query_params.get('date')
    if not date_str:
        return Response({'error': 'Date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Parse the date string
        date_obj = parse_date(date_str)
        if date_obj is None:
            raise ValidationError("Invalid date format. Use YYYY-MM-DD.")
            
        # Get booked appointments for this date
        booked_times = Appointment.objects.filter(date__date=date_obj).values_list('time_id', flat=True)
        
        # Get all available times not in booked times
        times = AvailableTime.objects.exclude(id__in=booked_times)
        serializer = AvailableTimeSerializer(times, many=True)
        return Response(serializer.data)
        
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def book_appointment(request):
    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        appointment = serializer.save()
        
        # Send email notification
        send_mail(
            f'New Appointment Booking: {appointment.full_name}',
            f'''
            New appointment booked:
            
            Name: {appointment.full_name}
            Phone: {appointment.phone_number}
            Email: {appointment.email or "Not provided"}
            Date: {appointment.date}
            Time: {appointment.time}
            Notes: {appointment.notes or "None"}
            ''',
            settings.DEFAULT_FROM_EMAIL,
            [settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_scans(request):
    scans = UserScan.objects.filter(user=request.user).order_by('-upload_date')
    serializer = UserScanSerializer(scans, many=True)
    return Response(serializer.data)


# ---------------- Profile & Payments ----------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Return the current user's Profile (including uses_left).
    """
    profile, _ = Profile.objects.get_or_create(user=request.user)
    serializer = ProfileSerializer(profile)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fake_payment(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    
    # Add 3 uses per purchase (adjust as needed)
    profile.uses_left += 3
    profile.purchases += 1
    profile.save()
    
    return Response({
        'uses_added': 3,
        'total_uses': profile.uses_left,
        'message': 'Purchase successful'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def use_check(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    return Response({
        'allowed': profile.uses_left > 0,
        'uses_left': profile.uses_left,
        'message': 'Purchase more uses if needed' if profile.uses_left == 0 else ''
    })

# ---------------- AI Prediction ----------------

# Load model just once when the module is imported
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'cnn_pneumonia_model_binary3.h5')

# Add error handling for model loading
try:
    model = tf.keras.models.load_model(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_scan(request):
    """
    Process an X-ray scan and predict if pneumonia is present.
    """
    # Check if model loaded successfully
    if model is None:
        return Response(
            {'error': 'Model not loaded. Please contact support.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Ensure the user is authenticated
    profile, _ = Profile.objects.get_or_create(user=request.user)

    # Check uses_left
    if profile.uses_left < 1:
        return Response(
            {'error': 'No uses left. Please purchase more credits.'},
            status=status.HTTP_402_PAYMENT_REQUIRED  # More appropriate status
        )

    # Make sure a file was uploaded
    scan_file = request.FILES.get('scan')
    if not scan_file:
        return Response(
            {'error': 'No scan file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Process image for your model
        img = Image.open(scan_file).convert('L')            # grayscale
        img = img.resize((150, 150))                        # match training size
        arr = np.array(img) / 255.0                         # normalize
        arr = arr.reshape((1, 150, 150, 1))                 # add batch & channel dims

        # Run prediction
        pred = model.predict(arr)
        pred_class = int(pred[0][0] > 0.5)

        # Deduct one use - only after successful prediction
        profile.uses_left -= 1
        profile.save()

        # Return both the result and remaining uses
        return Response({
            'prediction': pred_class,
            'text': 'Pneumonia detected' if pred_class else 'Normal scan',
            'uses_left': profile.uses_left
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': f'Error processing image: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_pdf_view(request):
    result = request.GET.get('result', 'Normal')

    template = get_template("pdf_template.html")
    context = {
        "user": request.user,
        "result": result,
        "date": datetime.datetime.now().strftime("%B %d, %Y %H:%M"),
        "logo_url": request.build_absolute_uri(static('img/logo.png'))
    }

    html = template.render(context)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'inline; filename="ai_report.pdf"'

    pisa.CreatePDF(html, dest=response)
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_scan_free(request):
    """
    Prédiction AI sans déduction de crédits (pour la page Results).
    """
    if model is None:
        return Response(
            {'error': 'Model not loaded. Please contact support.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    scan_file = request.FILES.get('scan')
    if not scan_file:
        return Response(
            {'error': 'No scan file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        img = Image.open(scan_file).convert('L')
        img = img.resize((150, 150))
        arr = np.array(img) / 255.0
        arr = arr.reshape((1, 150, 150, 1))

        pred = model.predict(arr)
        pred_class = int(pred[0][0] > 0.5)

        return Response({
            'prediction': pred_class,
            'text': 'Pneumonia detected' if pred_class else 'Normal scan'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Error processing image: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from .models import Appointment, UserScan

def dashboard_stats(request):
    User = get_user_model()

    return JsonResponse({
        "appointments": {
            "total": Appointment.objects.count(),
            "confirmed": Appointment.objects.filter(status="confirmed").count(),
            "pending": Appointment.objects.filter(status="pending").count(),
                "cancelled": Appointment.objects.filter(status="cancelled").count(),

        },
        "scans": {
            "total": UserScan.objects.count(),
            "ai": UserScan.objects.filter(description__icontains="ai").count(),
            "manual": UserScan.objects.filter(description__icontains="manual").count(),
        },
        "users": {
            "total": User.objects.count(),
            "with_profiles": User.objects.filter(profile__isnull=False).count()
        }
    })

from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from .models import Appointment

@staff_member_required
def admin_dashboard(request):
    # Compter les statuts
    confirmed = Appointment.objects.filter(status='confirmed').count()
    cancelled = Appointment.objects.filter(status='cancelled').count()
    pending = Appointment.objects.filter(status='pending').count()

    return render(request, 'admin/dashboard.html', {
        'confirmed': confirmed,
        'cancelled': cancelled,
        'pending': pending,
    })

