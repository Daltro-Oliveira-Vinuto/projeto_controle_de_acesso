// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login/', { email, password });
            login(res.data.user, res.data.access, res.data.refresh);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Erro ao fazer login.');
        } finally {
            setLoading(false);
        }
    }

    function handleGoogleLogin() {
        // Redireciona o browser diretamente — não usar axios/fetch aqui pois OAuth
        // exige redirecionamento real do browser (não XMLHttpRequest)
        window.location.href = 'http://localhost:8000/api/auth/google/';
    }

    return (
        <div style={{
            maxWidth: 400,
            margin: '80px auto',
            padding: 24,
            textAlign: 'left',
        }}>
            <h2 style={{
                fontSize: 28,
                fontWeight: 600,
                marginBottom: 24,
                color: 'var(--text-h)',
            }}>
                Entrar no Sistema
            </h2>

            {error && (
                <p style={{
                    color: '#dc2626',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 6,
                    padding: '10px 14px',
                    marginBottom: 16,
                    fontSize: 14,
                }}>
                    {error}
                </p>
            )}

            {/* Formulário para operador, empresa, gestor */}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: 'var(--text-h)' }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            fontSize: 15,
                            boxSizing: 'border-box',
                            background: 'var(--bg)',
                            color: 'var(--text-h)',
                        }}
                    />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: 'var(--text-h)' }}>
                        Senha
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            fontSize: 15,
                            boxSizing: 'border-box',
                            background: 'var(--bg)',
                            color: 'var(--text-h)',
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '11px 0',
                        background: 'var(--accent)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            <hr style={{ margin: '24px 0', borderColor: 'var(--border)' }} />

            {/* Botão Google — para fiscal e admin */}
            <p style={{ textAlign: 'center', color: 'var(--text)', marginBottom: 12, fontSize: 14 }}>
                Fiscal ou Administrador? Entre com sua conta institucional:
            </p>
            <button
                onClick={handleGoogleLogin}
                style={{
                    width: '100%',
                    padding: '11px 0',
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 15,
                    fontWeight: 500,
                    color: '#333',
                }}
            >
                <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.3C29.4 35.2 26.8 36 24 36c-5.3 0-9.6-2.9-11.3-7.1L6 34c3.3 6.4 9.9 10 18 10z" />
                    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-1 2.8-2.9 5.1-5.5 6.6l6.2 5.3C39.9 36.4 44 30.7 44 24c0-1.3-.1-2.7-.4-4z" />
                </svg>
                Entrar com Google
            </button>
        </div>
    );
}