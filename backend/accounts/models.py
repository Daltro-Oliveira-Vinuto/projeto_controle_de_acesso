# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('operador', 'Operador'),
        ('empresa', 'Empresa'),
        ('fiscal', 'Fiscal'),
        ('gestor', 'Gestor'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    google_id = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)