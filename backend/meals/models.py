from django.db import models
from students.models import Estudante
from accounts.models import User


class Almoco(models.Model):
    METODO_CHOICES = [
        ('biometria', 'Biometria'),
        ('manual', 'Manual'),
    ]

    estudante = models.ForeignKey(
        Estudante,
        on_delete=models.CASCADE,
        related_name='almocos'
    )

    operador = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    metodo = models.CharField(
        max_length=20,
        choices=METODO_CHOICES
    )

    data_hora = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.estudante.nome} - {self.data_hora}"