# accounts/permissions.py
from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Apenas usuários com papel 'admin' têm acesso."""
    message = 'Acesso restrito a administradores.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.papel == 'admin'
        )


class IsOperador(BasePermission):
    message = 'Acesso restrito a operadores.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.papel == 'operador'
        )


class IsEmpresa(BasePermission):
    message = 'Acesso restrito a empresas.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.papel == 'empresa'
        )


class IsFiscal(BasePermission):
    message = 'Acesso restrito a fiscais.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.papel == 'fiscal'
        )


class IsGestor(BasePermission):
    message = 'Acesso restrito a gestores.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.papel == 'gestor'
        )


class IsAdminOrGestor(BasePermission):
    """Admin ou Gestor podem acessar."""
    message = 'Acesso restrito a administradores ou gestores.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.papel in ['admin', 'gestor']
        )