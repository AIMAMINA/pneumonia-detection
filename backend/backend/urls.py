from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, api_root, EmailTokenObtainPairView, available_dates, available_times, user_scans, predict_scan
from rest_framework_simplejwt.views import TokenRefreshView
from api import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", api_root, name="api-root"),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", EmailTokenObtainPairView.as_view(), name="access"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path('api/appointments/', views.book_appointment, name='book_appointment'),
    path('api/available-dates/', available_dates, name='available_dates'),
    path('api/available-times/', available_times, name='available_times'),
    path('api/user/scans/', user_scans, name='user_scans'),
    path('api/predict-scan/', predict_scan, name='predict-scan'),
    path('api/fake-payment/', views.fake_payment),
    path('api/use-check/', views.use_check),
    path('api/profile/', views.get_profile),
    path('api/predict-scan-free/', views.predict_scan_free, name='predict_scan_free'),
    path("api/", include("api.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
