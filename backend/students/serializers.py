from rest_framework import serializers
from .models import Estudante


class EstudanteSerializer(serializers.ModelSerializer):
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = Estudante
        fields = [
            'id',
            'nome',
            'matricula',
            'foto',
            'foto_url',
        ]

    def get_foto_url(self, obj):
        request = self.context.get('request')
        if obj.foto and request:
            return request.build_absolute_uri(obj.foto.url)
        return None