from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from api import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.api_root, name="api-root"),
    # Auth
    path("api/user/register/", views.CreateUserView.as_view(), name="register"),
    path("api/token/", views.EmailTokenObtainPairView.as_view(), name="access"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    # Profile & demo payment
    path("api/profile/", views.get_profile, name="profile"),
    path("api/fake-payment/", views.fake_payment, name="fake_payment"),
    path("api/use-check/", views.use_check, name="use_check"),
    # Scans & AI
    path("api/predict-scan/", views.predict_scan, name="predict-scan"),
    path("api/user/scans/", views.user_scans, name="user_scans"),
    path("api/user/scans/<int:pk>/analyze/", views.analyze_user_scan, name="analyze_scan"),
    path("api/user/scans/<int:pk>/report/", views.generate_pdf_view, name="scan_report"),
    # Appointments
    path("api/appointments/", views.book_appointment, name="book_appointment"),
    path("api/available-dates/", views.available_dates, name="available_dates"),
    path("api/available-times/", views.available_times, name="available_times"),
    # Contact & admin stats
    path("api/", include("api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
