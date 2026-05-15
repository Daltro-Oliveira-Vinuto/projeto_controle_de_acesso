from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

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

        digital = Digital.objects.filter(
            codigo_hex=codigo
        ).select_related('estudante').first()

        if not digital:
            return Response({
                'status': 'nao_cadastrado'
            })

        estudante = digital.estudante

        Almoco.objects.create(
            estudante=estudante,
            operador=request.user,
            metodo='biometria'
        )

        return Response({
            'status': 'liberado',
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