# accounts/serializers.py
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Retorna dados do usuário (leitura). Nunca expõe a senha."""

    class Meta:
        model = User
        fields = ['id', 'email', 'nome', 'papel', 'is_active', 'date_joined']
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """
    Cria um novo usuário.
    Apenas a view de registro (restrita a admin) usa este serializer.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    email_indicado_admin = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'nome', 'papel', 'password', 'email_indicado_admin']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # hash automático — nunca salve senha em texto puro
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Dados necessários para login com email + senha."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)