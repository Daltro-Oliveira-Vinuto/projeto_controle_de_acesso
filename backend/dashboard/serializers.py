from rest_framework import serializers


class ResumoDiarioSerializer(serializers.Serializer):
    data = serializers.DateField()
    total = serializers.IntegerField()
    biometria = serializers.IntegerField()
    manual = serializers.IntegerField()


class TurmaIndicadorSerializer(serializers.Serializer):
    turma = serializers.CharField()
    curso = serializers.CharField()
    total_alunos = serializers.IntegerField()
    compareceram = serializers.IntegerField()
    percentual_comparecimento = serializers.FloatField()