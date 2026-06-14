# backend/dashboard/views.py

"""
dashboard/views.py — Sprint 8
Rotas de estatísticas para o dashboard da empresa.
"""

from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncHour

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from meals.models import Almoco

from django.db.models import Q
from django.db.models.functions import TruncDate, TruncMonth

from students.models import Estudante

from accounts.permissions import (
    IsFiscalOrAdmin,
    IsAdminOrGestor
)

PAPEIS_DASHBOARD = {'empresa', 'admin', 'gestor', 'fiscal'}


# ── helpers ────────────────────────────────────────────────────────────────

def _check_papel(request):
    return request.user.papel in PAPEIS_DASHBOARD


def _biometria_vs_manual(qs):
    total = qs.count()
    bio   = qs.filter(metodo='biometria').count()
    man   = qs.filter(metodo='manual').count()
    if total == 0:
        return {
            'total': 0,
            'biometria': {'total': 0, 'percentual': 0},
            'manual':    {'total': 0, 'percentual': 0},
        }
    return {
        'total': total,
        'biometria': {'total': bio, 'percentual': round(bio / total * 100, 1)},
        'manual':    {'total': man, 'percentual': round(man / total * 100, 1)},
    }


def _ultimas_liberacoes(qs, n=10):
    return [
        {
            'id':        a.id,
            'estudante': a.estudante.nome,
            'matricula': a.estudante.matricula,
            'metodo':    a.metodo,
            'data_hora': a.data_hora.isoformat(),
            'operador':  a.operador.nome if a.operador else None,
        }
        for a in qs.select_related('estudante', 'operador').order_by('-data_hora')[:n]
    ]


# ── views ──────────────────────────────────────────────────────────────────

class DashboardHojeView(APIView):
    """GET /api/dashboard/empresa/hoje"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_papel(request):
            return Response({'erro': 'Acesso negado.'}, status=403)

        hoje  = timezone.localdate()
        ontem = hoje - timezone.timedelta(days=1)

        qs_hoje  = Almoco.objects.filter(data_hora__date=hoje)
        qs_ontem = Almoco.objects.filter(data_hora__date=ontem)

        por_hora_raw = (
            qs_hoje
            .annotate(hora=TruncHour('data_hora'))
            .values('hora')
            .annotate(total=Count('id'))
            .order_by('hora')
        )
        por_hora = {row['hora'].hour: row['total'] for row in por_hora_raw}
        distribuicao_hora = [{'hora': h, 'total': por_hora.get(h, 0)} for h in range(24)]

        total_hoje  = qs_hoje.count()
        total_ontem = qs_ontem.count()
        variacao_ontem = (
            round((total_hoje - total_ontem) / total_ontem * 100, 1) if total_ontem else None
        )

        semana_passada = hoje - timezone.timedelta(days=7)

        qs_semana_passada = Almoco.objects.filter(
            data_hora__date=semana_passada
        )

        total_semana_passada = qs_semana_passada.count()

        variacao_semana_passada = (
            round(
                (total_hoje - total_semana_passada)
                / total_semana_passada * 100,
                1
            )
            if total_semana_passada
            else None
        )

        return Response({
            'data':               hoje.isoformat(),
            'total_hoje':         total_hoje,
            'total_ontem':        total_ontem,
            'variacao_ontem_pct': variacao_ontem,
            'distribuicao_hora':  distribuicao_hora,
            'metodos':            _biometria_vs_manual(qs_hoje),
            'ultimas_liberacoes': _ultimas_liberacoes(qs_hoje),
        })


class DashboardSemanaView(APIView):
    """GET /api/dashboard/empresa/semana"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_papel(request):
            return Response({'erro': 'Acesso negado.'}, status=403)

        hoje    = timezone.localdate()
        dias    = [hoje - timezone.timedelta(days=i) for i in range(6, -1, -1)]
        DIAS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

        resultado = [
            {
                'data':       dia.isoformat(),
                'dia_semana': DIAS_PT[dia.weekday()],
                'total':      Almoco.objects.filter(data_hora__date=dia).count(),
            }
            for dia in dias
        ]
        return Response({'semana': resultado})


class DashboardMensalView(APIView):
    """GET /api/dashboard/empresa/mensal"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_papel(request):
            return Response({'erro': 'Acesso negado.'}, status=403)

        hoje   = timezone.localdate()
        qs_mes = Almoco.objects.filter(data_hora__year=hoje.year, data_hora__month=hoje.month)

        por_dia = [
            {'data': row['data_hora__date'].isoformat(), 'total': row['total']}
            for row in qs_mes.values('data_hora__date').annotate(total=Count('id')).order_by('data_hora__date')
        ]

        return Response({
            'ano':       hoje.year,
            'mes':       hoje.month,
            'total_mes': qs_mes.count(),
            'metodos':   _biometria_vs_manual(qs_mes),
            'por_dia':   por_dia,
        })


# ───────────────────────────────────────────────────────────────────────────
# Sprint 9 — Dashboard Fiscal
# ───────────────────────────────────────────────────────────────────────────

class DashboardFiscalView(APIView):
    """
    GET /api/dashboard/fiscal
    """

    permission_classes = [IsAuthenticated, IsFiscalOrAdmin]

    def get(self, request):

        hoje = timezone.localdate()

        inicio_semana = hoje - timezone.timedelta(days=hoje.weekday())
        inicio_mes = hoje.replace(day=1)

        qs = Almoco.objects.all()

        cards = {
            'dia': qs.filter(data_hora__date=hoje).count(),
            'semana': qs.filter(data_hora__date__gte=inicio_semana).count(),
            'mes': qs.filter(data_hora__date__gte=inicio_mes).count(),
        }

        evolucao = (
            qs
            .annotate(data=TruncDate('data_hora'))
            .values('data')
            .annotate(total=Count('id'))
            .order_by('data')
        )

        resumo = (
            qs
            .annotate(data=TruncDate('data_hora'))
            .values('data')
            .annotate(
                total=Count('id'),
                biometria=Count(
                    'id',
                    filter=Q(metodo='biometria')
                ),
                manual=Count(
                    'id',
                    filter=Q(metodo='manual')
                ),
            )
            .order_by('-data')
        )

        return Response({
            'cards': cards,
            'evolucao_diaria': list(evolucao),
            'resumo_diario': list(resumo),
        })


# ───────────────────────────────────────────────────────────────────────────
# Sprint 9 — Dashboard Gestão
# ───────────────────────────────────────────────────────────────────────────

class DashboardGestaoView(APIView):
    """
    GET /api/dashboard/gestao
    """

    permission_classes = [IsAuthenticated, IsAdminOrGestor]

    def get(self, request):

        turmas = []

        agrupado = (
            Estudante.objects
            .values('curso', 'turma')
            .annotate(total_alunos=Count('id'))
            .order_by('curso', 'turma')
        )

        for item in agrupado:

            alunos_ids = Estudante.objects.filter(
                curso=item['curso'],
                turma=item['turma']
            ).values_list('id', flat=True)

            compareceram = (
                Almoco.objects
                .filter(estudante_id__in=alunos_ids)
                .values('estudante')
                .distinct()
                .count()
            )

            percentual = 0

            if item['total_alunos'] > 0:
                percentual = round(
                    (compareceram / item['total_alunos']) * 100,
                    1
                )

            turmas.append({
                'curso': item['curso'],
                'turma': item['turma'],
                'total_alunos': item['total_alunos'],
                'compareceram': compareceram,
                'percentual_comparecimento': percentual,
            })

        tendencia = (
            Almoco.objects
            .annotate(mes=TruncMonth('data_hora'))
            .values('mes')
            .annotate(total=Count('id'))
            .order_by('mes')
        )

        return Response({
            'turmas': turmas,
            'tendencia_mensal': list(tendencia),
        })


    