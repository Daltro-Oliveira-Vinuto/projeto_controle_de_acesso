from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from accounts.permissions import IsAdminOrGestor

import csv
import io
from rest_framework import status
from rest_framework.views import APIView
from .models import Estudante, Digital
from .serializers import EstudanteSerializer, EstudanteListSerializer, DigitalSerializer


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

class DigitalViewSet(ModelViewSet):
    serializer_class   = DigitalSerializer
    permission_classes = [IsAuthenticated, IsAdminOrGestor]

    def get_queryset(self):
        estudante_id = self.kwargs.get('estudante_pk')
        if estudante_id:
            return Digital.objects.filter(estudante_id=estudante_id)
        return Digital.objects.all()

    def perform_create(self, serializer):
        estudante_id = self.kwargs.get('estudante_pk')
        estudante    = Estudante.objects.get(pk=estudante_id)
        if Digital.objects.filter(estudante=estudante).count() >= 3:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Este aluno já possui 3 digitais cadastradas.')
        serializer.save(estudante=estudante)

class ImportarEstudantesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrGestor]

    def post(self, request):
        arquivo = request.FILES.get('arquivo')
        if not arquivo:
            return Response({'erro': 'Nenhum arquivo enviado.'}, status=400)

        conteudo = arquivo.read().decode('utf-8-sig')  # utf-8-sig ignora o BOM do Excel
        reader   = csv.DictReader(io.StringIO(conteudo))
        sucessos, erros = [], []

        for i, linha in enumerate(reader, start=2):
            nome      = linha.get('nome', '').strip()
            matricula = linha.get('matricula', '').strip()
            curso     = linha.get('curso', '').strip()
            turma     = linha.get('turma', '').strip()

            if not nome or not matricula:
                erros.append({'linha': i, 'erro': 'Nome e matrícula são obrigatórios.'})
                continue

            try:
                obj, criado = Estudante.objects.get_or_create(
                    matricula=matricula,
                    defaults={'nome': nome, 'curso': curso, 'turma': turma}
                )
                if criado:
                    sucessos.append({'linha': i, 'matricula': matricula, 'nome': nome})
                else:
                    erros.append({'linha': i, 'erro': f'Matrícula {matricula} já existe.'})
            except Exception as e:
                erros.append({'linha': i, 'erro': str(e)})

        return Response({
            'total_enviado': len(sucessos) + len(erros),
            'importados':    len(sucessos),
            'erros_total':   len(erros),
            'sucessos':      sucessos,
            'erros':         erros,
        })