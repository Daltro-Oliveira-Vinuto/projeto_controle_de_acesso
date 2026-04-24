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

class Digital(models.Model):
    DEDO_CHOICES = [
        ('polegar_d',   'Polegar Direito'),
        ('indicador_d', 'Indicador Direito'),
        ('polegar_e',   'Polegar Esquerdo'),
        ('indicador_e', 'Indicador Esquerdo'),
        ('outro',       'Outro'),
    ]
    estudante  = models.ForeignKey(
        Estudante,
        on_delete=models.CASCADE,
        related_name='digitais'
    )
    codigo_hex = models.CharField(max_length=500, unique=True)
    dedo       = models.CharField(max_length=20, choices=DEDO_CHOICES, default='polegar_d')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Digital {self.dedo} — {self.estudante.nome}"