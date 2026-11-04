import datetime
import logging
import os

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db import IntegrityError
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.template.loader import get_template
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework_simplejwt.views import TokenObtainPairView

from . import ml
from .models import Appointment, AvailableDate, Profile, UserScan
from .serializers import (
    AppointmentSerializer,
    AvailableDateSerializer,
    AvailableTimeSerializer,
    ContactMessageSerializer,
    ProfileSerializer,
    UserScanSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()

USES_PER_PURCHASE = 3


def notify(subject, message, recipients):
    """Send an email without ever breaking the request if SMTP is misconfigured."""
    recipients = [r for r in recipients if r]
    if not recipients:
        return
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipients)
    except Exception:  # noqa: BLE001 - email is best effort
        logger.exception("Could not send email '%s'", subject)


# ---------------- Auth ----------------

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class EmailTokenObtainPairView(TokenObtainPairView):
    """Login with either a username or an email address."""

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        identifier = data.get("email") or data.get("username", "")
        if "@" in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
            if user:
                data["username"] = user.username
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request, format=None):
    return Response({
        "api": "ElHakim AI API",
        "endpoints": {
            "register": reverse("register", request=request, format=format),
            "login": reverse("access", request=request, format=format),
            "token_refresh": reverse("refresh", request=request, format=format),
            "profile": reverse("profile", request=request, format=format),
            "predict_scan": reverse("predict-scan", request=request, format=format),
            "user_scans": reverse("user_scans", request=request, format=format),
            "available_dates": reverse("available_dates", request=request, format=format),
            "appointments": reverse("book_appointment", request=request, format=format),
            "contact": reverse("submit_contact", request=request, format=format),
        },
    })


# ---------------- Contact ----------------

@api_view(["POST"])
@permission_classes([AllowAny])
def submit_contact(request):
    serializer = ContactMessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    message = serializer.save()
    notify(
        f"New contact message: {message.get_subject_display()}",
        f"From: {message.first_name} {message.last_name} <{message.email}>\n"
        f"Phone: {message.phone}\n\n{message.message}",
        [settings.ADMIN_EMAIL],
    )
    return Response({"message": "Message received successfully!"}, status=status.HTTP_201_CREATED)


# ---------------- Appointments ----------------

@api_view(["GET"])
@permission_classes([AllowAny])
def available_dates(request):
    dates = AvailableDate.objects.filter(date__gte=timezone.localdate()).order_by("date")
    return Response(AvailableDateSerializer(dates, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def available_times(request):
    date_obj = parse_date(request.query_params.get("date", "") or "")
    if date_obj is None:
        return Response(
            {"error": "A valid 'date' parameter (YYYY-MM-DD) is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    available_date = AvailableDate.objects.filter(date=date_obj).first()
    if available_date is None:
        return Response([])

    booked = Appointment.objects.filter(date=available_date).exclude(
        status="cancelled"
    ).values_list("time_id", flat=True)
    times = available_date.available_times.exclude(id__in=booked).order_by("time")
    return Response(AvailableTimeSerializer(times, many=True).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def book_appointment(request):
    serializer = AppointmentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        appointment = serializer.save()
    except IntegrityError:
        return Response(
            {"error": "This time slot has just been booked. Please choose another one."},
            status=status.HTTP_409_CONFLICT,
        )

    notify(
        f"New appointment booking: {appointment.full_name}",
        f"Name: {appointment.full_name}\n"
        f"Phone: {appointment.phone_number}\n"
        f"Email: {appointment.email or 'Not provided'}\n"
        f"Date: {appointment.date} at {appointment.time}\n"
        f"Notes: {appointment.notes or 'None'}",
        [settings.ADMIN_EMAIL],
    )
    return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


# ---------------- Profile & payments ----------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    return Response(ProfileSerializer(profile).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def fake_payment(request):
    """Demo payment: adds credits without charging anything."""
    profile, _ = Profile.objects.get_or_create(user=request.user)
    profile.uses_left += USES_PER_PURCHASE
    profile.purchases += 1
    profile.save()
    return Response({
        "uses_added": USES_PER_PURCHASE,
        "total_uses": profile.uses_left,
        "message": "Purchase successful",
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def use_check(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    return Response({
        "allowed": profile.uses_left > 0,
        "uses_left": profile.uses_left,
    })


# ---------------- Scans & AI ----------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_scans(request):
    scans = UserScan.objects.filter(user=request.user).order_by("-upload_date")
    return Response(UserScanSerializer(scans, many=True, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def predict_scan(request):
    """Analyse an uploaded X-ray (costs one credit) and save it to the user's scans."""
    profile, _ = Profile.objects.get_or_create(user=request.user)
    if profile.uses_left < 1:
        return Response(
            {"error": "No scans left. Please purchase more credits."},
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )

    scan_file = request.FILES.get("scan")
    if not scan_file:
        return Response({"error": "No scan file provided."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = ml.predict(scan_file)
    except ml.ModelUnavailable:
        return Response(
            {"error": "The AI model is not available right now."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except ml.InvalidImage:
        return Response(
            {"error": "Invalid file. Please upload a valid X-ray image."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    scan_file.seek(0)
    scan = UserScan.objects.create(
        user=request.user,
        scan_name=os.path.splitext(scan_file.name)[0][:100] or "Chest X-ray",
        description="Uploaded for AI analysis",
        scan_file=scan_file,
        is_ai_analyzed=True,
        ai_result=result["label"],
        ai_confidence=result["confidence"],
    )

    profile.uses_left -= 1
    profile.save()

    return Response({
        **result,
        "scan": UserScanSerializer(scan, context={"request": request}).data,
        "uses_left": profile.uses_left,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def analyze_user_scan(request, pk):
    """Analyse a scan already stored for the user (e.g. uploaded by a doctor). Free."""
    scan = get_object_or_404(UserScan, pk=pk, user=request.user)
    try:
        with scan.scan_file.open("rb") as f:
            result = ml.predict(f)
    except ml.ModelUnavailable:
        return Response(
            {"error": "The AI model is not available right now."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except (ml.InvalidImage, FileNotFoundError):
        return Response({"error": "This scan file cannot be read."}, status=status.HTTP_400_BAD_REQUEST)

    scan.is_ai_analyzed = True
    scan.ai_result = result["label"]
    scan.ai_confidence = result["confidence"]
    scan.save(update_fields=["is_ai_analyzed", "ai_result", "ai_confidence"])
    return Response({**result, "scan": UserScanSerializer(scan, context={"request": request}).data})


def _link_callback(uri, rel):
    """Let xhtml2pdf read static files from disk instead of over HTTP."""
    if uri.startswith(settings.STATIC_URL):
        path = os.path.join(settings.STATICFILES_DIRS[0], uri[len(settings.STATIC_URL):])
        if os.path.isfile(path):
            return path
    return uri


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_pdf_view(request, pk):
    from xhtml2pdf import pisa  # heavy import, only needed here

    scan = get_object_or_404(UserScan, pk=pk, user=request.user)
    if not scan.ai_result:
        return Response({"error": "This scan has not been analysed yet."}, status=status.HTTP_400_BAD_REQUEST)

    html = get_template("pdf_template.html").render({
        "user": request.user,
        "scan": scan,
        "result": scan.ai_result,
        "confidence": round((scan.ai_confidence or 0) * 100, 1),
        "date": datetime.datetime.now().strftime("%B %d, %Y %H:%M"),
        "logo_url": f"{settings.STATIC_URL}img/logo.png",
    })

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = f'inline; filename="elhakim_report_{scan.pk}.pdf"'
    pdf = pisa.CreatePDF(html, dest=response, link_callback=_link_callback)
    if pdf.err:
        return Response({"error": "Could not generate the report."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return response


# ---------------- Admin ----------------

@staff_member_required
def dashboard_stats(request):
    return JsonResponse({
        "appointments": {
            "total": Appointment.objects.count(),
            "confirmed": Appointment.objects.filter(status="confirmed").count(),
            "pending": Appointment.objects.filter(status="pending").count(),
            "cancelled": Appointment.objects.filter(status="cancelled").count(),
        },
        "scans": {
            "total": UserScan.objects.count(),
            "ai_analyzed": UserScan.objects.filter(is_ai_analyzed=True).count(),
        },
        "users": {"total": User.objects.count()},
    })
