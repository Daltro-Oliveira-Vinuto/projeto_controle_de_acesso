# dashboard/urls.py
from django.urls import path
from .views import DashboardHojeView, DashboardSemanaView, DashboardMensalView

urlpatterns = [
    path('dashboard/empresa/hoje',   DashboardHojeView.as_view()),
    path('dashboard/empresa/semana', DashboardSemanaView.as_view()),
    path('dashboard/empresa/mensal', DashboardMensalView.as_view()),
]
