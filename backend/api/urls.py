from django.urls import path
from .views import hello_api

urlpatterns = [
    path('', hello_api),
]