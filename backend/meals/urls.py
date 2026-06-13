# backend/meals/urls.py

from django.urls import path

from .views import (
    VerificarDigitalView,
    LiberarManualView
)

urlpatterns = [
    path(
        'verificar-digital/',
        VerificarDigitalView.as_view()
    ),
    path(
        'liberar-manual/',
        LiberarManualView.as_view()
    ),

]