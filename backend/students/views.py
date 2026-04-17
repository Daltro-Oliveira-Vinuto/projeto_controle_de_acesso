from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Estudante
from .serializers import EstudanteSerializer
from accounts.permissions import IsAdminOrGestor


class EstudanteViewSet(ModelViewSet):
    queryset = Estudante.objects.all()
    serializer_class = EstudanteSerializer
    permission_classes = [IsAuthenticated, IsAdminOrGestor]

    def get_queryset(self):
        queryset = super().get_queryset()

        busca = self.request.query_params.get('busca')
        curso = self.request.query_params.get('curso')
        ativo = self.request.query_params.get('ativo')

        if busca:
            queryset = queryset.filter(
                Q(nome__icontains=busca) |
                Q(matricula__icontains=busca)
            )

        if curso:
            queryset = queryset.filter(curso=curso)

        if ativo is not None:
            if ativo.lower() == 'true':
                queryset = queryset.filter(ativo=True)
            elif ativo.lower() == 'false':
                queryset = queryset.filter(ativo=False)

        return queryset