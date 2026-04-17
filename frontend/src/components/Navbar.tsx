// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Define quais rotas cada papel pode ver
const MENU_BY_ROLE: Record<string, { label: string; path: string }[]> = {
    operador: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Perfil', path: '/perfil' },
    ],
    empresa: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Relatórios', path: '/relatorios' },
        { label: 'Perfil', path: '/perfil' },
    ],
    fiscal: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Relatórios', path: '/relatorios' },
        { label: 'Perfil', path: '/perfil' },
    ],
    gestor: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Relatórios', path: '/relatorios' },
        { label: 'Perfil', path: '/perfil' },
    ],
    admin: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Painel Admin', path: '/admin' },
        { label: 'Relatórios', path: '/relatorios' },
        { label: 'Perfil', path: '/perfil' },
    ],
};

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated || !user) return null;

    const menuItems = MENU_BY_ROLE[user.papel] || [];

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <nav style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '12px 24px', background: '#1a1a2e', color: '#fff'
        }}>
            <span style={{ fontWeight: 'bold', marginRight: 16 }}>
                🏫 Controle de Acesso
            </span>

            {menuItems.map(item => (
                <Link
                    key={item.path}
                    to={item.path}
                    style={{ color: '#fff', textDecoration: 'none' }}
                >
                    {item.label}
                </Link>
            ))}

            <span style={{ marginLeft: 'auto', fontSize: 14, opacity: 0.8 }}>
                {user.nome || user.email} ({user.papel})
            </span>

            <button
                onClick={handleLogout}
                style={{
                    marginLeft: 8, padding: '4px 12px',
                    background: 'transparent', border: '1px solid #fff',
                    color: '#fff', cursor: 'pointer', borderRadius: 4
                }}
            >
                Sair
            </button>
        </nav>
    );
}