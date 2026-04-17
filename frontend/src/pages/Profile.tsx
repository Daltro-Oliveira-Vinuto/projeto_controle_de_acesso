// src/pages/Profile.tsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PAPEL_LABELS: Record<string, string> = {
    operador: 'Operador de Cantina',
    empresa: 'Empresa Fornecedora',
    fiscal: 'Fiscal',
    gestor: 'Gestor Escolar',
    admin: 'Administrador',
};

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <div style={{ maxWidth: 480, margin: '40px auto' }}>
            <h1>Meu Perfil</h1>

            <div style={{ background: '#f5f5f5', padding: 24, borderRadius: 8 }}>
                <p><strong>Nome:</strong> {user.nome || '—'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Papel:</strong> {PAPEL_LABELS[user.papel] || user.papel}</p>
                <p><strong>Status:</strong> {user.is_active ? '✅ Ativo' : '❌ Inativo'}</p>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    marginTop: 24, padding: '10px 24px',
                    background: '#c0392b', color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer'
                }}
            >
                Sair da conta
            </button>
        </div>
    );
}