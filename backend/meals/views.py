from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from students.models import Digital, Estudante
from .models import Almoco


class VerificarDigitalView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        codigo = request.data.get('codigo_hex')

        if not codigo:
            return Response({
                'erro': 'codigo_hex obrigatório'
            }, status=400)

        digital = Digital.objects.filter(
            codigo_hex=codigo
        ).select_related('estudante').first()

        if not digital:
            return Response({
                'status': 'nao_cadastrado'
            })

        estudante = digital.estudante

        if not estudante.ativo:
            return Response({
                'status': 'bloqueado',
                'motivo': 'Aluno inativo'
            })

        hoje = timezone.localdate()

        ja_almocou = Almoco.objects.filter(
            estudante=estudante,
            data_hora__date=hoje
        ).exists()

        if ja_almocou:
            return Response({
                'status': 'bloqueado',
                'motivo': 'Já almoçou hoje'
            })

        Almoco.objects.create(
            estudante=estudante,
            operador=request.user,
            metodo='biometria'
        )

        return Response({
            'status': 'liberado',
            'mensagem': 'LIBERADO',
            'estudante': {
                'id': estudante.id,
                'nome': estudante.nome,
                'matricula': estudante.matricula,
                'curso': estudante.curso,
                'turma': estudante.turma,
                'foto_url': (
                    request.build_absolute_uri(estudante.foto.url)
                    if estudante.foto else None
                )
            }
        })


class LiberarManualView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        estudante_id = request.data.get('estudante_id')
        observacao = request.data.get('observacao', '').strip()

        if not estudante_id:
            return Response({
                'erro': 'estudante_id obrigatório'
            }, status=400)

        if not observacao:
            return Response({
                'erro': 'Motivo obrigatório'
            }, status=400)

        try:
            estudante = Estudante.objects.get(
                id=estudante_id
            )
        except Estudante.DoesNotExist:
            return Response({
                'erro': 'Aluno não encontrado'
            }, status=404)

        if not estudante.ativo:
            return Response({
                'status': 'bloqueado',
                'motivo': 'Aluno inativo'
            })

        hoje = timezone.localdate()

        ja_almocou = Almoco.objects.filter(
            estudante=estudante,
            data_hora__date=hoje
        ).exists()

        if ja_almocou:
            return Response({
                'status': 'bloqueado',
                'motivo': 'Já almoçou hoje'
            })

        Almoco.objects.create(
            estudante=estudante,
            operador=request.user,
            metodo='manual',
            observacao=observacao
        )

        return Response({
            'status': 'liberado',
            'mensagem': 'Liberação manual realizada'
        })