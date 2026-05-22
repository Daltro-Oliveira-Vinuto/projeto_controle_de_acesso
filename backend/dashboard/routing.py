# dashboard/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/dashboard/empresa/$', consumers.DashboardConsumer.as_asgi()),
]
