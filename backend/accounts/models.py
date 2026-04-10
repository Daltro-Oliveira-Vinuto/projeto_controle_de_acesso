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

    # campos obrigatórios do AbstractUser que já existem:
    # username, first_name, last_name, email, password, is_active, date_joined, last_login

    username = None
    email = models.EmailField(unique=True)


    nome = models.CharField(max_length=255, blank=True)  # nome de exibição
    papel = models.CharField(max_length=20, choices=ROLE_CHOICES, default='operador')
    google_id = models.CharField(max_length=255, null=True, blank=True)
    # senha é gerenciada pelo campo 'password' do AbstractUser (hash automático)
    # is_active já existe no AbstractUser
    # last_login (ultimo_acesso) já existe no AbstractUser

    # Para fiscal: o email que o admin indicou
    email_indicado_admin = models.EmailField(null=True, blank=True)


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return f'{self.email} ({self.papel})'
