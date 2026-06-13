# backend/dashboard/consumers.py

"""
dashboard/consumers.py — Sprint 8
Consumer WebSocket para atualizações em tempo real do dashboard.

Instala dependência: poetry add channels channels-redis
Adiciona em INSTALLED_APPS: 'channels'
Configura CHANNEL_LAYERS (ver instruções abaixo).
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer


class DashboardConsumer(AsyncWebsocketConsumer):
    """
    ws://host/ws/dashboard/empresa/

    Eventos enviados ao cliente:
    - nova-liberacao: { tipo, id, estudante, matricula, metodo, data_hora, operador }
    """
    GROUP_NAME = 'dashboard_empresa'

    async def connect(self):
        # Verifica autenticação (token JWT no header ou query string)
        user = self.scope.get('user')
        if user is None or not user.is_authenticated:
            await self.close(code=4001)
            return

        if user.papel not in {'empresa', 'admin', 'gestor', 'fiscal'}:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.GROUP_NAME, self.channel_name)

    # Não processa mensagens do cliente neste consumer
    async def receive(self, text_data=None, bytes_data=None):
        pass

    # Handler chamado via channel_layer.group_send(...)
    async def nova_liberacao(self, event):
        """Repassa o evento para o WebSocket do cliente."""
        await self.send(text_data=json.dumps({
            'tipo':      'nova-liberacao',
            'id':        event['id'],
            'estudante': event['estudante'],
            'matricula': event['matricula'],
            'metodo':    event['metodo'],
            'data_hora': event['data_hora'],
            'operador':  event.get('operador'),
        }))
