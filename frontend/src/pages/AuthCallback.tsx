// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const access = searchParams.get('access');
        const refresh = searchParams.get('refresh');

        if (!access || !refresh) {
            navigate('/login');
            return;
        }

        // Salva tokens temporariamente para fazer a requisição /me/
        localStorage.setItem('token', access);
        localStorage.setItem('refresh', refresh);

        // Busca os dados do usuário
        api.get('/auth/me/')
            .then(res => {
                login(res.data, access, refresh);
                navigate('/dashboard');
            })
            .catch(() => {
                navigate('/login');
            });
    }, []);

    return <p>Autenticando com Google...</p>;
}