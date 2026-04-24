from rest_framework import serializers
from .models import Estudante


class EstudanteSerializer(serializers.ModelSerializer):
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = Estudante
        fields = [
            'id', 'nome', 'matricula', 'curso', 'turma',
            'foto', 'foto_url', 'ativo', 'created_at',
        ]
        read_only_fields = ['created_at', 'foto_url']

    def get_foto_url(self, obj):
        request = self.context.get('request')
        if obj.foto and request:
            return request.build_absolute_uri(obj.foto.url)
        return None


class EstudanteListSerializer(serializers.ModelSerializer):
    """Versão enxuta para listagens — não traz o campo binário da foto"""
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = Estudante
        fields = ['id', 'nome', 'matricula', 'curso', 'turma', 'foto_url', 'ativo']

    def get_foto_url(self, obj):
        request = self.context.get('request')
        if obj.foto and request:
            return request.build_absolute_uri(obj.foto.url)
        return None