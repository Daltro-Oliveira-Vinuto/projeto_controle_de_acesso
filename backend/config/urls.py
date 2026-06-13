# backend/config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),

    path('api/auth/', include('accounts.urls')),

    # Estudantes (Sprint 3)
    path('api/', include('students.urls')),

    path('api/', include('meals.urls')),

    # Dashboard em tempo real (Sprint 8 / 9)
    path('api/', include('dashboard.urls')),

    # Relatórios e Exportação (Sprint 10)
    path('api/', include('reports.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)