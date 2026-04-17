// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import Root from './pages/Root';
import Home from './pages/Home';
import About from './pages/About';
import ErrorPage from './pages/ErrorPage';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <Home /> },
            { path: 'about', element: <About /> },
            { path: 'login', element: <Login /> },
            { path: 'auth/callback', element: <AuthCallback /> },

            // Protegidas — qualquer usuário autenticado
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'perfil',
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                ),
            },

            // Protegida — apenas admin
            {
                path: 'admin',
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <div>Painel Admin</div>
                    </ProtectedRoute>
                ),
            },

            // Relatórios — admin, gestor, fiscal e empresa podem acessar
            {
                path: 'relatorios',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'gestor', 'fiscal', 'empresa']}>
                        <div>Relatórios</div>
                    </ProtectedRoute>
                ),
            },

            { path: 'unauthorized', element: <div style={{ padding: 32 }}>Acesso não autorizado.</div> },
        ],
    },
]);

export default router;