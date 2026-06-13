# backend/reports/urls.py

from django.urls import path

from .views import (
    RelatorioDiarioView,
    RelatorioMensalView,
    RelatorioEstudanteView,
    RelatorioOperadorView,
    RelatorioExcecoesView,
    RelatorioPagamentoView,
)

urlpatterns = [
    path('relatorios/diario',         RelatorioDiarioView.as_view(),    name='relatorio-diario'),
    path('relatorios/mensal',         RelatorioMensalView.as_view(),    name='relatorio-mensal'),
    path('relatorios/estudante/<int:pk>', RelatorioEstudanteView.as_view(), name='relatorio-estudante'),
    path('relatorios/operador',       RelatorioOperadorView.as_view(),  name='relatorio-operador'),
    path('relatorios/excecoes',       RelatorioExcecoesView.as_view(),  name='relatorio-excecoes'),
    path('relatorios/pagamento',      RelatorioPagamentoView.as_view(), name='relatorio-pagamento'),
]