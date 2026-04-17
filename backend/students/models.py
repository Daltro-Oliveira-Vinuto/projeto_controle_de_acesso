from django.db import models

class Estudante(models.Model):
    nome = models.CharField(max_length=255)
    matricula = models.CharField(max_length=50, unique=True)
    curso = models.CharField(max_length=100, blank=True)
    turma = models.CharField(max_length=100, blank=True)

    foto = models.ImageField(upload_to='estudantes/', null=True, blank=True)

    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} ({self.matricula})"