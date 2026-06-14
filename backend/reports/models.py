# backend/reports/models.py

from django.db import models
from accounts.models import User


class PeriodoValidado(models.Model):
    data_inicio = models.DateField()
    data_fim = models.DateField()

    total_refeicoes = models.IntegerField()

    valor_por_refeicao = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    valor_total = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    fiscal = models.ForeignKey(
        User,
        on_delete=models.PROTECT
    )

    fiscal_email = models.EmailField()

    protocolo = models.CharField(
        max_length=50,
        unique=True
    )

    data_validacao = models.DateTimeField(
        auto_now_add=True
    )

    observacao = models.TextField(
        blank=True,
        default=''
    )

    pode_ser_alterado = models.BooleanField(
        default=False
    )

    def __str__(self):
        return self.protocolo


class LogPeriodoValidado(models.Model):

    periodo = models.ForeignKey(
        PeriodoValidado,
        on_delete=models.CASCADE,
        related_name='logs'
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    data_hora = models.DateTimeField(
        auto_now_add=True
    )

    descricao = models.TextField()