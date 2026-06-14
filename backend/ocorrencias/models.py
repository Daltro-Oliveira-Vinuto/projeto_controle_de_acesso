# backend/ocorrencias/models.py

from django.db import models

from students.models import Estudante
from accounts.models import User


class Ocorrencia(models.Model):

    TIPO_CHOICES = [
        ('problema_biometria', 'Problema Biometria'),
        ('comportamento', 'Comportamento'),
        ('observacao_geral', 'Observação Geral'),
    ]

    estudante = models.ForeignKey(
        Estudante,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    operador = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    tipo = models.CharField(
        max_length=30,
        choices=TIPO_CHOICES
    )

    descricao = models.TextField()

    data_hora = models.DateTimeField(
        auto_now_add=True
    )