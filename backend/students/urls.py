from rest_framework.routers import DefaultRouter
from .views import EstudanteViewSet

router = DefaultRouter()
router.register(r'estudantes', EstudanteViewSet)

urlpatterns = router.urls