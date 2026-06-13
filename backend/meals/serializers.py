# backend/meals/serializers.py

from rest_framework import serializers
from .models import Almoco


class AlmocoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Almoco
        fields = '__all__'