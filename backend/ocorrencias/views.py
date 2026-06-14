# backend/ocorrencias/views.py

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

from .models import Ocorrencia
from .serializers import OcorrenciaSerializer


class OcorrenciaViewSet(ModelViewSet):

    queryset = Ocorrencia.objects.all().order_by('-data_hora')

    serializer_class = OcorrenciaSerializer

    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            operador=self.request.user
        )