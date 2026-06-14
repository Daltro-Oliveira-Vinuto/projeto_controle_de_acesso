# backend/configuracoes/serializers.py

from rest_framework import serializers

from .models import Configuracao


class ConfiguracaoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Configuracao
        fields = '__all__'