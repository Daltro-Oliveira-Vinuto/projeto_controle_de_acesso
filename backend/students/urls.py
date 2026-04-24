from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers

from .views import EstudanteViewSet, DigitalViewSet, ImportarEstudantesView

# Router principal — cria /estudantes/ e /estudantes/:id/
router = DefaultRouter()
router.register(r'estudantes', EstudanteViewSet)

# Router aninhado — cria /estudantes/:estudante_pk/digitais/
estudante_router = nested_routers.NestedDefaultRouter(
    router, r'estudantes', lookup='estudante'
)
estudante_router.register(r'digitais', DigitalViewSet, basename='estudante-digitais')

urlpatterns = (
    router.urls
    + estudante_router.urls
    + [path('estudantes/importar/', ImportarEstudantesView.as_view(), name='importar-estudantes')]
)