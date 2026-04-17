# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Autenticação tradicional
    path('register/', views.register, name='auth-register'),
    path('login/', views.login_view, name='auth-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('me/', views.me, name='auth-me'),

    # OAuth Google
    path('google/', views.google_login, name='google-login'),
    path('google/callback/', views.google_callback, name='google-callback'),
]