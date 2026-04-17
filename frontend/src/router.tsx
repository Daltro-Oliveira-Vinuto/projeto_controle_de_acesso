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
            { path: 'auth/callback', element: <AuthCallback /> }, // captura tokens do Google

            // Rotas protegidas — qualquer usuário autenticado
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <Home /> {/* troque pelo componente de dashboard real */}
                    </ProtectedRoute>
                ),
            },

            // Rota protegida — apenas admin
            {
                path: 'admin',
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <div>Painel Admin</div>
                    </ProtectedRoute>
                ),
            },

            // Rota protegida — admin e gestor
            {
                path: 'relatorios',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                        <div>Relatórios</div>
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

            { path: 'unauthorized', element: <div>Acesso não autorizado.</div> },
        ],
    },
]);

export default router;