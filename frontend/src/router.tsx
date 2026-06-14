// frontend/src/router.tsx

console.log("ROUTER CARREGANDO");

import { createBrowserRouter } from 'react-router-dom';
import Root from './pages/Root';
import Home from './pages/Home';
import About from './pages/About';
import ErrorPage from './pages/ErrorPage';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import Estudantes from './pages/Estudantes';
import Operador from './pages/Operador';
import DashboardEmpresa from './pages/DashboardEmpresa';
import DashboardFiscal from './pages/DashboardFiscal';
import DashboardGestao from './pages/DashboardGestao';
import Relatorios from './pages/Relatorios'; // Sprint 10

import Ocorrencias from './pages/Ocorrencias';
import Configuracoes from './pages/Configuracoes';
import ValidarPeriodo from './pages/ValidarPeriodo';
import PeriodosValidados from './pages/PeriodosValidados';


console.log("ROUTER CARREGADO");

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

            // ----------------------------------------------------------------
            // Relatórios (Sprint 10) — admin, gestor, fiscal e empresa
            // ----------------------------------------------------------------
            {
                path: 'relatorios',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'gestor', 'fiscal', 'empresa']}>
                        <Relatorios />
                    </ProtectedRoute>
                ),
            },

            // Students
            {
                path: 'estudantes',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                        <Estudantes />
                    </ProtectedRoute>
                ),
            },

            // Operador
            {
                path: 'operador',
                element: (
                    <ProtectedRoute allowedRoles={['operador']}>
                        <Operador />
                    </ProtectedRoute>
                ),
            },

            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute allowedRoles={['empresa', 'admin']}>
                        <DashboardEmpresa />
                    </ProtectedRoute>
                ),
            },

            {
                path: 'dashboard/fiscal',
                element: (
                    <ProtectedRoute allowedRoles={['fiscal', 'admin']}>
                        <DashboardFiscal />
                    </ProtectedRoute>
                ),
            },

            {
                path: 'dashboard/gestao',
                element: (
                    <ProtectedRoute allowedRoles={['gestor', 'admin']}>
                        <DashboardGestao />
                    </ProtectedRoute>
                ),
            },

            {
                path: 'ocorrencias',
                element: (
                    <ProtectedRoute
                        allowedRoles={[
                            'operador',
                            'admin'
                        ]}
                    >
                        <Ocorrencias />
                    </ProtectedRoute>
                ),
            },

            {
                path: 'fiscal/validar',
                element: (
                    <ProtectedRoute
                        allowedRoles={[
                            'fiscal',
                            'admin'
                        ]}
                    >
                        <ValidarPeriodo />
                    </ProtectedRoute>
                ),
            },

            {
                path: 'admin/periodos-validados',
                element: (
                    <ProtectedRoute
                        allowedRoles={['admin']}
                    >
                        <PeriodosValidados />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin/configuracoes',
                element: (
                    <ProtectedRoute
                        allowedRoles={['admin']}
                    >
                        <Configuracoes />
                    </ProtectedRoute>
                ),
            },




            { path: 'unauthorized', element: <div style={{ padding: 32 }}>Acesso não autorizado.</div> },

        ],
    },
]);

export default router;