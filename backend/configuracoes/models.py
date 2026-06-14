# backend/configuracoes/models.py

from django.db import models

from accounts.models import User


class Configuracao(models.Model):

    chave = models.CharField(
        max_length=100,
        unique=True
    )

    valor = models.CharField(
        max_length=255
    )

    descricao = models.TextField(
        blank=True
    )

    def __str__(self):
        return self.chave


class LogConfiguracao(models.Model):

    configuracao = models.ForeignKey(
        Configuracao,
        on_delete=models.CASCADE
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    valor_anterior = models.CharField(
        max_length=255
    )

    valor_novo = models.CharField(
        max_length=255
    )

    data_hora = models.DateTimeField(
        auto_now_add=True
    )