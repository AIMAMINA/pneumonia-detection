from django.urls import path
from .views import submit_contact
from .views import submit_contact, generate_pdf_view
from .views import dashboard_stats
from .views import admin_dashboard

urlpatterns = [
  path('submit/', submit_contact, name='submit_contact'),
  path('generate-report/', generate_pdf_view, name='generate_report'),  
  path('dashboard-stats/', dashboard_stats),
  path('admin/dashboard/', admin_dashboard, name='admin-dashboard'),

]