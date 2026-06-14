# backend/configuracoes/views.py

from rest_framework.viewsets import ModelViewSet
from accounts.permissions import IsAdmin
from .models import Configuracao, LogConfiguracao
from .serializers import ConfiguracaoSerializer


class ConfiguracaoViewSet(ModelViewSet):

    queryset = Configuracao.objects.all()
    serializer_class = ConfiguracaoSerializer
    permission_classes = [IsAdmin]

    def perform_update(self, serializer):

        instancia = self.get_object()
        valor_antigo = instancia.valor

        nova = serializer.save()

        LogConfiguracao.objects.create(
            configuracao=nova,
            usuario=self.request.user,
            valor_anterior=valor_antigo,
            valor_novo=nova.valor
        )