// src/pages/Home.tsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Se já está logado, mostra dashboard básico
    if (isAuthenticated && user) {
        return (
            <div style={{ padding: '32px 0' }}>
                <h2 style={{ fontSize: 26, marginBottom: 8 }}>
                    Olá, {user.nome || user.email}!
                </h2>
                <p style={{ color: 'var(--text)', marginBottom: 24 }}>
                    Você está logado como <strong>{user.papel}</strong>.
                </p>
                <button
                    onClick={() => navigate('/perfil')}
                    style={{
                        padding: '10px 20px',
                        background: 'var(--accent)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 15,
                        fontWeight: 500,
                    }}
                >
                    Ver Perfil
                </button>
            </div>
        );
    }

    // Usuário não logado — página pública simples
    return (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, marginBottom: 12 }}>
                Bem-vindo ao Sistema de Controle de Acesso
            </h2>
            <p style={{ color: 'var(--text)', fontSize: 16, marginBottom: 24 }}>
                Faça login para acessar o sistema.
            </p>
            <button
                onClick={() => navigate('/login')}
                style={{
                    padding: '11px 28px',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 15,
                    fontWeight: 600,
                }}
            >
                Fazer Login
            </button>
        </div>
    );
}