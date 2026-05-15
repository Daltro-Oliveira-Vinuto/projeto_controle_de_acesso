from django.urls import path
from .views import VerificarDigitalView

urlpatterns = [
    path(
        'verificar-digital/',
        VerificarDigitalView.as_view()
    ),
]