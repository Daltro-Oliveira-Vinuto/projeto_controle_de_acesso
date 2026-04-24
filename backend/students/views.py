from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Estudante
from .serializers import EstudanteSerializer, EstudanteListSerializer
from accounts.permissions import IsAdminOrGestor


class EstudanteViewSet(ModelViewSet):
    queryset = Estudante.objects.all().order_by('nome')
    permission_classes = [IsAuthenticated, IsAdminOrGestor]

    def get_serializer_class(self):
        # Na listagem usa o serializer enxuto; no detalhe/criação usa o completo
        if self.action == 'list':
            return EstudanteListSerializer
        return EstudanteSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        busca  = self.request.query_params.get('busca')
        curso  = self.request.query_params.get('curso')
        turma  = self.request.query_params.get('turma')
        ativo  = self.request.query_params.get('ativo')

        if busca:
            queryset = queryset.filter(
                Q(nome__icontains=busca) | Q(matricula__icontains=busca)
            )
        if curso:
            queryset = queryset.filter(curso__icontains=curso)
        if turma:
            queryset = queryset.filter(turma__icontains=turma)
        if ativo is not None and ativo != '':
            queryset = queryset.filter(ativo=(ativo.lower() == 'true'))

        return queryset

    @action(detail=True, methods=['patch'], url_path='ativar')
    def ativar(self, request, pk=None):
        """Reativa um estudante que estava desativado"""
        estudante = self.get_object()
        estudante.ativo = True
        estudante.save()
        return Response({'status': 'reativado', 'id': estudante.id})

    @action(detail=False, methods=['get'], url_path='cursos')
    def listar_cursos(self, request):
        """Retorna lista de cursos únicos cadastrados"""
        cursos = (Estudante.objects
                  .values_list('curso', flat=True)
                  .exclude(curso='').distinct().order_by('curso'))
        return Response(list(cursos))

    @action(detail=False, methods=['get'], url_path='turmas')
    def listar_turmas(self, request):
        """Retorna lista de turmas únicas cadastradas"""
        turmas = (Estudante.objects
                  .values_list('turma', flat=True)
                  .exclude(turma='').distinct().order_by('turma'))
        return Response(list(turmas))