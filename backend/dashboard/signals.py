"""
dashboard/signals.py — Sprint 8
Dispara o evento WebSocket 'nova-liberacao' sempre que um Almoco é criado.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from meals.models import Almoco

"""
@receiver(post_save, sender=Almoco)
def broadcast_nova_liberacao(sender, instance, created, **kwargs):
    if not created:
        return

    channel_layer = get_channel_layer()
    if channel_layer is None:
        return  # channels não configurado (ex.: testes sem Redis)

    payload = {
        'type':      'nova_liberacao',   # mapeia para DashboardConsumer.nova_liberacao
        'id':        instance.id,
        'estudante': instance.estudante.nome,
        'matricula': instance.estudante.matricula,
        'metodo':    instance.metodo,
        'data_hora': instance.data_hora.isoformat(),
        'operador':  instance.operador.nome if instance.operador else None,
    }

    async_to_sync(channel_layer.group_send)('dashboard_empresa', payload)
"""

@receiver(post_save, sender=Almoco)
def broadcast_nova_liberacao(sender, instance, created, **kwargs):

    if not created:
        return

    print("NOVO ALMOCO CRIADO")
    print("ENVIANDO EVENTO WEBSOCKET")

    channel_layer = get_channel_layer()

    if channel_layer is None:
        print("CHANNEL_LAYER NONE")
        return

    async_to_sync(channel_layer.group_send)(
        "dashboard_empresa",
        {
            "type": "nova_liberacao",
            "id": instance.id,
            "estudante": instance.estudante.nome,
            "matricula": instance.estudante.matricula,
            "metodo": instance.metodo,
            "data_hora": instance.data_hora.isoformat(),
            "operador": instance.operador.nome if instance.operador else None,
        }
    )

    print("EVENTO ENVIADO")