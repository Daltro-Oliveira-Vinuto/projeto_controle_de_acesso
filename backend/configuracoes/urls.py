
# backend/configuracoes/urls.py

from rest_framework.routers import DefaultRouter

from .views import ConfiguracaoViewSet

router = DefaultRouter()

router.register(
    r'configuracoes',
    ConfiguracaoViewSet,
    basename='configuracao'
)

urlpatterns = router.urls
