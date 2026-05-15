from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from students.models import Digital
from .models import Almoco


class VerificarDigitalView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        codigo = request.data.get('codigo_hex')

        if not codigo:
            return Response({
                'erro': 'codigo_hex obrigatório'
            }, status=400)

        # procura digital
        digital = Digital.objects.filter(
            codigo_hex=codigo
        ).select_related('estudante').first()

        # DIGITAL NÃO CADASTRADA
        if not digital:

            return Response({
                'status': 'bloqueado',
                'motivo': 'Digital não cadastrada'
            })

        estudante = digital.estudante

        # ALUNO INATIVO
        if not estudante.ativo:

            return Response({
                'status': 'bloqueado',
                'motivo': 'Aluno inativo'
            })

        # DATA DE HOJE
        hoje = timezone.localdate()

        # VERIFICA SE JÁ ALMOÇOU
        ja_almocou = Almoco.objects.filter(
            estudante=estudante,
            data_hora__date=hoje
        ).exists()

        if ja_almocou:

            return Response({
                'status': 'bloqueado',
                'motivo': 'Já almoçou hoje'
            })

        # REGISTRA ALMOÇO
        Almoco.objects.create(
            estudante=estudante,
            operador=request.user,
            metodo='biometria'
        )

        return Response({

            'status': 'liberado',

            'mensagem': 'Voucher liberado',

            'estudante': {

                'id': estudante.id,
                'nome': estudante.nome,
                'matricula': estudante.matricula,
                'curso': estudante.curso,
                'turma': estudante.turma,

                'foto_url': (
                    request.build_absolute_uri(
                        estudante.foto.url
                    )
                    if estudante.foto else None
                )
            }
        })