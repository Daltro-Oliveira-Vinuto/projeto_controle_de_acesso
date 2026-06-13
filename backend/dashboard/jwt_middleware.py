# backend/dashboard/jwt_middleware.py

"""
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


@database_sync_to_async

def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode()
        params = parse_qs(query_string)

        token = params.get('token')

        if token:
            try:
                access_token = AccessToken(token[0])
                user = await get_user(access_token['user_id'])
                scope['user'] = user
            except Exception:
                scope['user'] = None
        else:
            scope['user'] = None

        return await super().__call__(scope, receive, send)

"""

from urllib.parse import parse_qs

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async

from django.contrib.auth import get_user_model


@database_sync_to_async
def get_user(user_id):
    User = get_user_model()

    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):

        from rest_framework_simplejwt.tokens import AccessToken

        query_string = scope['query_string'].decode()

        params = parse_qs(query_string)

        token = params.get('token')

        if token:
            try:
                access_token = AccessToken(token[0])

                user = await get_user(access_token['user_id'])

                scope['user'] = user

            except Exception:
                scope['user'] = None
        else:
            scope['user'] = None

        return await super().__call__(scope, receive, send)