# accounts/views.py
from django.conf import settings
from django.contrib.auth import authenticate
from django.shortcuts import redirect
from django.utils import timezone
import urllib.parse
import requests as http_requests

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .permissions import IsAdmin


# ─────────────────────────────────────────────────────────────────
# Utilitário: gera JWT com claims extras
# ─────────────────────────────────────────────────────────────────

def get_tokens_for_user(user):
    """Gera par de tokens JWT (access + refresh) com dados do usuário no payload."""
    refresh = RefreshToken.for_user(user)
    refresh['papel'] = user.papel
    refresh['email'] = user.email
    refresh['nome'] = user.nome
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ─────────────────────────────────────────────────────────────────
# Registro (apenas admin)
# ─────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def register(request):
    """
    Cadastra um novo usuário no sistema.
    Requer: estar autenticado como admin.

    Body JSON:
        email, nome, papel, password, email_indicado_admin (opcional, para fiscal)
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────
# Login tradicional (email + senha)
# ─────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login com email e senha.
    Usado por: operador, empresa, gestor.
    Fiscais e admin usam o login via Google.

    Body JSON:
        email, password

    Retorna:
        user (dados), access (JWT), refresh (JWT)
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    # authenticate() checa o hash da senha automaticamente
    user = authenticate(request, username=email, password=password)

    if user is None:
        return Response(
            {'detail': 'Email ou senha incorretos.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {'detail': 'Conta desativada. Entre em contato com o administrador.'},
            status=status.HTTP_403_FORBIDDEN
        )

    tokens = get_tokens_for_user(user)

    return Response({
        'user': UserSerializer(user).data,
        **tokens,
    })


# ─────────────────────────────────────────────────────────────────
# Dados do usuário logado
# ─────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    Retorna os dados do usuário atualmente autenticado.
    O frontend usa esta rota para verificar se o token ainda é válido
    e para carregar os dados do usuário após refresh da página.
    """
    return Response(UserSerializer(request.user).data)


# ─────────────────────────────────────────────────────────────────
# OAuth Google — Passo 1: redireciona para o Google
# ─────────────────────────────────────────────────────────────────
"""
@api_view(['GET'])
@permission_classes([AllowAny])
def google_login(request):
    #
    #Retorna a URL de autorização do Google.
    #O frontend abre esta URL no navegador.

    #Retorna:
    #    { "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }
    #
    params = urllib.parse.urlencode({
        'client_id': settings.GOOGLE_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'select_account',  # força o Google a mostrar a tela de seleção de conta
    })
    google_auth_url = f'https://accounts.google.com/o/oauth2/v2/auth?{params}'
    return Response({'url': google_auth_url})


"""

#outra possibilidade para api_view:

@api_view(['GET'])
@permission_classes([AllowAny])
def google_login(request):
    params = urllib.parse.urlencode({
        'client_id': settings.GOOGLE_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'openid email profile',
    })
    google_auth_url = f'https://accounts.google.com/o/oauth2/v2/auth?{params}'
    return redirect(google_auth_url)  # 🔥 muda aqui

# ─────────────────────────────────────────────────────────────────
# OAuth Google — Passo 2: recebe o code e finaliza o login
# ─────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def google_callback(request):
    """
    Recebe o 'code' enviado pelo Google após o usuário fazer login.
    Troca o code por um token de acesso, obtém os dados do usuário Google,
    verifica regras de domínio e papel, e redireciona para o frontend com JWT.

    O Google chama esta URL automaticamente — não é chamado pelo frontend diretamente.
    """
    code = request.query_params.get('code')
    if not code:
        return Response(
            {'detail': 'Código de autorização ausente.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 1. Troca o code por um access_token do Google
    token_response = http_requests.post(
        'https://oauth2.googleapis.com/token',
        data={
            'code': code,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code',
        }
    )
    token_data = token_response.json()

    if 'error' in token_data:
        return Response(
            {'detail': f'Erro ao autenticar com Google: {token_data["error"]}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    access_token = token_data.get('access_token')

    # 2. Busca os dados do usuário no Google
    user_info_response = http_requests.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    user_info = user_info_response.json()

    google_email = user_info.get('email')
    google_id = user_info.get('id')

    if not google_email:
        return Response(
            {'detail': 'Não foi possível obter o email do Google.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 3. Verifica se o domínio do email é permitido
    domain = google_email.split('@')[-1]
    if domain not in settings.GOOGLE_ALLOWED_DOMAINS:
        return Response(
            {'detail': f'Domínio @{domain} não autorizado. Use seu email institucional.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # 4. Busca o usuário cadastrado no sistema com esse email
    try:
        user = User.objects.get(email=google_email)
    except User.DoesNotExist:
        # Usuário não cadastrado pelo admin ainda
        return Response(
            {'detail': 'Acesso não encontrado. Solicite ao administrador que cadastre seu email.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if not user.is_active:
        return Response(
            {'detail': 'Conta desativada.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # 5. Verifica se o papel permite login via Google
    if user.papel not in ['fiscal', 'admin']:
        return Response(
            {'detail': 'Seu tipo de acesso não usa login com Google. Use email e senha.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # 6. Para fiscal: verifica se o email Google bate com o que o admin indicou
    if user.papel == 'fiscal' and user.email_indicado_admin:
        if user.email_indicado_admin != google_email:
            return Response(
                {'detail': 'O email Google não corresponde ao email autorizado pelo administrador.'},
                status=status.HTTP_403_FORBIDDEN
            )

    # 7. Atualiza o google_id (caso ainda não estivesse salvo) e último acesso
    update_fields = []
    if not user.google_id:
        user.google_id = google_id
        update_fields.append('google_id')
    if update_fields:
        user.save(update_fields=update_fields)

    # 8. Gera os tokens JWT e redireciona para o frontend
    tokens = get_tokens_for_user(user)
    frontend_url = (
        f'http://localhost:5173/auth/callback'
        f'?access={tokens["access"]}'
        f'&refresh={tokens["refresh"]}'
    )
    return redirect(frontend_url)