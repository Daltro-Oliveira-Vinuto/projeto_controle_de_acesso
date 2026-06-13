# backend/reports/views.py

"""
Sprint 10 — Relatórios e Exportação
Rotas:
  GET /relatorios/diario?data=YYYY-MM-DD          (PDF / CSV)
  GET /relatorios/mensal?ano=YYYY&mes=MM           (PDF / CSV)
  GET /relatorios/estudante/<id>                   (PDF / CSV)
  GET /relatorios/operador?inicio=YYYY-MM-DD&fim=  (PDF / CSV)
  GET /relatorios/excecoes?inicio=&fim=            (PDF / CSV)
  GET /relatorios/pagamento?inicio=&fim=           (PDF / CSV)

Formato padrão: JSON/PDF.  Acrescente ?formato=csv para CSV.
Requer permissão: admin | gestor | fiscal | empresa
"""

import csv
import io
from datetime import date, datetime, timedelta

from django.http import HttpResponse
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from accounts.permissions import IsAdminOrGestor  # reutiliza permissão existente
from meals.models import Almoco
from students.models import Estudante
from accounts.models import User

# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _parse_date(s: str) -> date:
    return datetime.strptime(s, "%Y-%m-%d").date()


def _fmt_dt(dt) -> str:
    if dt is None:
        return "-"
    if timezone.is_aware(dt):
        dt = timezone.localtime(dt)
    return dt.strftime("%d/%m/%Y %H:%M")


def _fmt_d(d) -> str:
    if d is None:
        return "-"
    return d.strftime("%d/%m/%Y")


# ---------------------------------------------------------------------------
# PDF builder
# ---------------------------------------------------------------------------

class PDFBuilder:
    """Gera PDF a partir de título, cabeçalho e linhas de dados."""

    HEADER_COLOR = colors.HexColor("#6d28d9")   # roxo — mantém identidade visual
    ROW_ODD     = colors.HexColor("#f5f3ff")
    ROW_EVEN    = colors.white

    def build(self, titulo: str, subtitulo: str, headers: list, rows: list) -> bytes:
        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf,
            pagesize=landscape(A4),
            leftMargin=1.5 * cm,
            rightMargin=1.5 * cm,
            topMargin=1.5 * cm,
            bottomMargin=1.5 * cm,
            title=titulo,
        )
        styles = getSampleStyleSheet()
        story = []

        # Título
        story.append(Paragraph(f"<b>{titulo}</b>", styles["Title"]))
        story.append(Paragraph(subtitulo, styles["Normal"]))
        story.append(Spacer(1, 0.5 * cm))

        # Tabela
        data = [headers] + [list(r) for r in rows]
        col_count = len(headers)
        col_width = (landscape(A4)[0] - 3 * cm) / col_count

        tbl = Table(data, colWidths=[col_width] * col_count, repeatRows=1)

        style_cmds = [
            ("BACKGROUND",   (0, 0), (-1, 0),  self.HEADER_COLOR),
            ("TEXTCOLOR",    (0, 0), (-1, 0),  colors.white),
            ("FONTNAME",     (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("FONTSIZE",     (0, 0), (-1, 0),  9),
            ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
            ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
            ("FONTSIZE",     (0, 1), (-1, -1),  8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [self.ROW_ODD, self.ROW_EVEN]),
            ("GRID",         (0, 0), (-1, -1), 0.25, colors.grey),
            ("TOPPADDING",   (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 4),
        ]
        tbl.setStyle(TableStyle(style_cmds))
        story.append(tbl)

        if not rows:
            story.append(Spacer(1, 0.3 * cm))
            story.append(Paragraph("<i>Nenhum registro encontrado.</i>", styles["Normal"]))

        doc.build(story)
        return buf.getvalue()


_pdf = PDFBuilder()


def _csv_response(filename: str, headers: list, rows: list) -> HttpResponse:
    resp = HttpResponse(content_type="text/csv; charset=utf-8-sig")
    resp["Content-Disposition"] = f'attachment; filename="{filename}"'
    w = csv.writer(resp)
    w.writerow(headers)
    for r in rows:
        w.writerow(r)
    return resp


def _pdf_response(filename: str, titulo: str, subtitulo: str,
                  headers: list, rows: list) -> HttpResponse:
    pdf_bytes = _pdf.build(titulo, subtitulo, headers, rows)
    resp = HttpResponse(pdf_bytes, content_type="application/pdf")
    resp["Content-Disposition"] = f'attachment; filename="{filename}"'
    return resp


def _dispatch(request, filename_base: str, titulo: str, subtitulo: str,
              headers: list, rows: list) -> HttpResponse:
    fmt = request.GET.get("formato", "pdf").lower()
    if fmt == "csv":
        return _csv_response(f"{filename_base}.csv", headers, rows)
    return _pdf_response(f"{filename_base}.pdf", titulo, subtitulo, headers, rows)


# ---------------------------------------------------------------------------
# Permissão compartilhada
# ---------------------------------------------------------------------------

class RelatorioPermission(IsAuthenticated):
    ALLOWED = {"admin", "gestor", "fiscal", "empresa"}

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return getattr(request.user, "papel", "") in self.ALLOWED


# ---------------------------------------------------------------------------
# 1. Relatório Diário
# ---------------------------------------------------------------------------

class RelatorioDiarioView(APIView):
    """GET /relatorios/diario?data=YYYY-MM-DD[&formato=csv]"""
    permission_classes = [RelatorioPermission]

    def get(self, request):
        data_str = request.GET.get("data") or date.today().isoformat()
        try:
            dia = _parse_date(data_str)
        except ValueError:
            from rest_framework.response import Response
            return Response({"erro": "Parâmetro 'data' inválido. Use YYYY-MM-DD."}, status=400)

        qs = (
            Almoco.objects
            .filter(data_hora__date=dia)
            .select_related("estudante", "operador")
            .order_by("data_hora")
        )

        headers = ["Horário", "Matrícula", "Estudante", "Curso", "Turma",
                   "Método", "Operador", "Observação"]
        rows = []
        for a in qs:
            rows.append([
                _fmt_dt(a.data_hora),
                a.estudante.matricula,
                a.estudante.nome,
                a.estudante.curso or "-",
                a.estudante.turma or "-",
                a.get_metodo_display(),
                a.operador.nome if a.operador else "Sistema",
                a.observacao or "-",
            ])

        return _dispatch(
            request,
            filename_base=f"relatorio_diario_{dia.isoformat()}",
            titulo=f"Relatório Diário — {_fmt_d(dia)}",
            subtitulo=f"Total de refeições: {len(rows)}",
            headers=headers,
            rows=rows,
        )


# ---------------------------------------------------------------------------
# 2. Relatório Mensal
# ---------------------------------------------------------------------------

class RelatorioMensalView(APIView):
    """GET /relatorios/mensal?ano=YYYY&mes=MM[&formato=csv]"""
    permission_classes = [RelatorioPermission]

    def get(self, request):
        from rest_framework.response import Response
        hoje = date.today()
        try:
            ano = int(request.GET.get("ano", hoje.year))
            mes = int(request.GET.get("mes", hoje.month))
        except ValueError:
            return Response({"erro": "Parâmetros 'ano' e 'mes' devem ser inteiros."}, status=400)

        qs = (
            Almoco.objects
            .filter(data_hora__year=ano, data_hora__month=mes)
            .select_related("estudante", "operador")
            .order_by("data_hora")
        )

        headers = ["Data", "Horário", "Matrícula", "Estudante",
                   "Curso", "Turma", "Método", "Operador"]
        rows = []
        for a in qs:
            dt = timezone.localtime(a.data_hora) if timezone.is_aware(a.data_hora) else a.data_hora
            rows.append([
                dt.strftime("%d/%m/%Y"),
                dt.strftime("%H:%M"),
                a.estudante.matricula,
                a.estudante.nome,
                a.estudante.curso or "-",
                a.estudante.turma or "-",
                a.get_metodo_display(),
                a.operador.nome if a.operador else "Sistema",
            ])

        MESES = ["", "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                 "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

        return _dispatch(
            request,
            filename_base=f"relatorio_mensal_{ano}_{mes:02d}",
            titulo=f"Relatório Mensal — {MESES[mes]} de {ano}",
            subtitulo=f"Total de refeições: {len(rows)}",
            headers=headers,
            rows=rows,
        )


# ---------------------------------------------------------------------------
# 3. Relatório por Estudante
# ---------------------------------------------------------------------------

class RelatorioEstudanteView(APIView):
    """GET /relatorios/estudante/<id>[?formato=csv]"""
    permission_classes = [RelatorioPermission]

    def get(self, request, pk):
        from rest_framework.response import Response
        try:
            estudante = Estudante.objects.get(pk=pk)
        except Estudante.DoesNotExist:
            return Response({"erro": "Estudante não encontrado."}, status=404)

        qs = (
            Almoco.objects
            .filter(estudante=estudante)
            .select_related("operador")
            .order_by("data_hora")
        )

        headers = ["Data", "Horário", "Método", "Operador", "Observação"]
        rows = []
        for a in qs:
            rows.append([
                _fmt_dt(a.data_hora).split()[0] if a.data_hora else "-",
                _fmt_dt(a.data_hora).split()[1] if a.data_hora else "-",
                a.get_metodo_display(),
                a.operador.nome if a.operador else "Sistema",
                a.observacao or "-",
            ])

        return _dispatch(
            request,
            filename_base=f"relatorio_estudante_{estudante.matricula}",
            titulo=f"Relatório do Estudante — {estudante.nome}",
            subtitulo=f"Matrícula: {estudante.matricula} | Curso: {estudante.curso} | Turma: {estudante.turma} | Total: {len(rows)} refeições",
            headers=headers,
            rows=rows,
        )


# ---------------------------------------------------------------------------
# 4. Relatório por Operador
# ---------------------------------------------------------------------------

class RelatorioOperadorView(APIView):
    """GET /relatorios/operador?inicio=YYYY-MM-DD&fim=YYYY-MM-DD[&formato=csv]"""
    permission_classes = [RelatorioPermission]

    def get(self, request):
        from rest_framework.response import Response
        hoje = date.today()
        inicio_str = request.GET.get("inicio") or (hoje - timedelta(days=30)).isoformat()
        fim_str    = request.GET.get("fim")    or hoje.isoformat()
        try:
            inicio = _parse_date(inicio_str)
            fim    = _parse_date(fim_str)
        except ValueError:
            return Response({"erro": "Datas inválidas. Use YYYY-MM-DD."}, status=400)

        qs = (
            Almoco.objects
            .filter(data_hora__date__gte=inicio, data_hora__date__lte=fim)
            .select_related("estudante", "operador")
            .order_by("operador__nome", "data_hora")
        )

        headers = ["Operador", "Data", "Matrícula", "Estudante",
                   "Curso", "Turma", "Método"]
        rows = []
        for a in qs:
            rows.append([
                a.operador.nome if a.operador else "Sistema",
                _fmt_dt(a.data_hora),
                a.estudante.matricula,
                a.estudante.nome,
                a.estudante.curso or "-",
                a.estudante.turma or "-",
                a.get_metodo_display(),
            ])

        return _dispatch(
            request,
            filename_base=f"relatorio_operador_{inicio_str}_{fim_str}",
            titulo="Relatório por Operador",
            subtitulo=f"Período: {_fmt_d(inicio)} a {_fmt_d(fim)} | Total de liberações: {len(rows)}",
            headers=headers,
            rows=rows,
        )


# ---------------------------------------------------------------------------
# 5. Relatório de Exceções (liberações manuais)
# ---------------------------------------------------------------------------

class RelatorioExcecoesView(APIView):
    """GET /relatorios/excecoes?inicio=YYYY-MM-DD&fim=YYYY-MM-DD[&formato=csv]"""
    permission_classes = [RelatorioPermission]

    def get(self, request):
        from rest_framework.response import Response
        hoje = date.today()
        inicio_str = request.GET.get("inicio") or (hoje - timedelta(days=30)).isoformat()
        fim_str    = request.GET.get("fim")    or hoje.isoformat()
        try:
            inicio = _parse_date(inicio_str)
            fim    = _parse_date(fim_str)
        except ValueError:
            return Response({"erro": "Datas inválidas. Use YYYY-MM-DD."}, status=400)

        qs = (
            Almoco.objects
            .filter(
                metodo="manual",
                data_hora__date__gte=inicio,
                data_hora__date__lte=fim,
            )
            .select_related("estudante", "operador")
            .order_by("data_hora")
        )

        headers = ["Data/Hora", "Matrícula", "Estudante", "Curso",
                   "Turma", "Operador", "Motivo (Observação)"]
        rows = []
        for a in qs:
            rows.append([
                _fmt_dt(a.data_hora),
                a.estudante.matricula,
                a.estudante.nome,
                a.estudante.curso or "-",
                a.estudante.turma or "-",
                a.operador.nome if a.operador else "Sistema",
                a.observacao or "(sem motivo registrado)",
            ])

        return _dispatch(
            request,
            filename_base=f"relatorio_excecoes_{inicio_str}_{fim_str}",
            titulo="Relatório de Exceções — Liberações Manuais",
            subtitulo=f"Período: {_fmt_d(inicio)} a {_fmt_d(fim)} | Total de exceções: {len(rows)}",
            headers=headers,
            rows=rows,
        )


# ---------------------------------------------------------------------------
# 6. Relatório de Pagamento (base para faturamento)
# ---------------------------------------------------------------------------

class RelatorioPagamentoView(APIView):
    """GET /relatorios/pagamento?inicio=YYYY-MM-DD&fim=YYYY-MM-DD[&formato=csv]"""
    permission_classes = [RelatorioPermission]

    def get(self, request):
        from rest_framework.response import Response
        hoje = date.today()
        inicio_str = request.GET.get("inicio") or (hoje - timedelta(days=30)).isoformat()
        fim_str    = request.GET.get("fim")    or hoje.isoformat()
        try:
            inicio = _parse_date(inicio_str)
            fim    = _parse_date(fim_str)
        except ValueError:
            return Response({"erro": "Datas inválidas. Use YYYY-MM-DD."}, status=400)

        from django.db.models import Count

        # Agrega por estudante: quantidade de refeições no período
        qs = (
            Almoco.objects
            .filter(data_hora__date__gte=inicio, data_hora__date__lte=fim)
            .values(
                "estudante__matricula",
                "estudante__nome",
                "estudante__curso",
                "estudante__turma",
            )
            .annotate(total_refeicoes=Count("id"))
            .order_by("estudante__nome")
        )

        headers = ["Matrícula", "Estudante", "Curso", "Turma",
                   "Total Refeições", "Refeições Biometria",
                   "Refeições Manual"]

        rows = []
        grand_total = 0
        for item in qs:
            matricula = item["estudante__matricula"]
            estudante_nome = item["estudante__nome"]
            curso = item["estudante__curso"] or "-"
            turma = item["estudante__turma"] or "-"
            total = item["total_refeicoes"]
            grand_total += total

            # contar por método
            bio = Almoco.objects.filter(
                estudante__matricula=matricula,
                data_hora__date__gte=inicio,
                data_hora__date__lte=fim,
                metodo="biometria",
            ).count()
            manual = total - bio

            rows.append([matricula, estudante_nome, curso, turma,
                         total, bio, manual])

        # Linha de total
        if rows:
            rows.append(["", "TOTAL GERAL", "", "",
                         grand_total, "", ""])

        return _dispatch(
            request,
            filename_base=f"relatorio_pagamento_{inicio_str}_{fim_str}",
            titulo="Relatório de Pagamento — Base para Faturamento",
            subtitulo=f"Período: {_fmt_d(inicio)} a {_fmt_d(fim)} | Total de refeições: {grand_total}",
            headers=headers,
            rows=rows,
        )