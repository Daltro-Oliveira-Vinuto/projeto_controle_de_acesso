from django.contrib import admin
from .models import Estudante

@admin.register(Estudante)
class EstudanteAdmin(admin.ModelAdmin):
    list_display  = ['nome', 'matricula', 'curso', 'turma', 'ativo', 'created_at']
    list_filter   = ['ativo', 'curso', 'turma']
    search_fields = ['nome', 'matricula']
    list_editable = ['ativo']
    ordering      = ['nome']