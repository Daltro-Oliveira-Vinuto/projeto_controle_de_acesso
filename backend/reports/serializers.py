# backend/reports/serializers.py

from rest_framework import serializers

from .models import PeriodoValidado


class PeriodoValidadoSerializer(serializers.ModelSerializer):

    class Meta:
        model = PeriodoValidado
        fields = '__all__'

