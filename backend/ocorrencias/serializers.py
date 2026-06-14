# backend/ocorrencias/serializers.py

from rest_framework import serializers
from .models import Ocorrencia


class OcorrenciaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ocorrencia
        fields = '__all__'
        read_only_fields = ['operador', 'data_hora']