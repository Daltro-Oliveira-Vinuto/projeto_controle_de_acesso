from django.urls import path

from .views import (
    DashboardHojeView,
    DashboardSemanaView,
    DashboardMensalView,

    DashboardFiscalView,
    DashboardGestaoView,
)

urlpatterns = [
    # Sprint 8
    path('dashboard/empresa/hoje', DashboardHojeView.as_view()),
    path('dashboard/empresa/semana', DashboardSemanaView.as_view()),
    path('dashboard/empresa/mensal', DashboardMensalView.as_view()),

    # Sprint 9
    path('dashboard/fiscal', DashboardFiscalView.as_view()),
    path('dashboard/gestao', DashboardGestaoView.as_view()),
]