// src/pages/DashboardGestao.tsx

import { useEffect, useState } from 'react';

import api from '../services/api';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from 'chart.js';

import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

interface Turma {
    curso: string;
    turma: string;
    total_alunos: number;
    compareceram: number;
    percentual_comparecimento: number;
}

interface DashboardGestaoData {
    turmas: Turma[];
}

export default function DashboardGestao() {

    const [dados, setDados] =
        useState<DashboardGestaoData | null>(null);

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {
        const res = await api.get('/dashboard/gestao');

        setDados(res.data);
    }

    if (!dados) {
        return <div style={{ padding: 24 }}>Carregando...</div>;
    }

    // gráfico barras

    const barData = {
        labels: dados.turmas.map(t => t.turma),

        datasets: [
            {
                label: 'Comparecimento %',

                data: dados.turmas.map(
                    t => t.percentual_comparecimento
                ),

                backgroundColor: 'rgba(168,85,247,0.7)',
            },
        ],
    };

    // gráfico linha tendência

    const lineData = {
        labels: dados.turmas.map(t => t.turma),

        datasets: [
            {
                label: 'Presentes',

                data: dados.turmas.map(
                    t => t.compareceram
                ),

                borderColor: '#22c55e',

                backgroundColor: 'rgba(34,197,94,0.25)',

                tension: 0.3,
            },
        ],
    };

    return (
        <div
            style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
            }}
        >
            <h1>🎓 Dashboard Gestão</h1>

            {/* gráficos */}

            <div
                style={{
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                }}
            >
                {/* barras */}

                <div
                    style={{
                        flex: 2,
                        minWidth: 320,
                        background: 'var(--code-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        padding: 20,
                    }}
                >
                    <h3
                        style={{
                            marginTop: 0,
                            marginBottom: 20,
                        }}
                    >
                        Comparecimento por turma
                    </h3>

                    <Bar data={barData} />
                </div>

                {/* linha */}

                <div
                    style={{
                        flex: 2,
                        minWidth: 320,
                        background: 'var(--code-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        padding: 20,
                    }}
                >
                    <h3
                        style={{
                            marginTop: 0,
                            marginBottom: 20,
                        }}
                    >
                        Tendência educacional
                    </h3>

                    <Line data={lineData} />
                </div>
            </div>

            {/* tabela comparativo */}

            <div
                style={{
                    background: 'var(--code-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 20,
                    overflowX: 'auto',
                }}
            >
                <h3
                    style={{
                        marginTop: 0,
                        marginBottom: 20,
                    }}
                >
                    Comparativo entre turmas
                </h3>

                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                    }}
                >
                    <thead>
                        <tr>
                            <th style={thStyle}>Curso</th>

                            <th style={thStyle}>Turma</th>

                            <th style={thStyle}>
                                Total alunos
                            </th>

                            <th style={thStyle}>
                                Compareceram
                            </th>

                            <th style={thStyle}>
                                Frequência
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {dados.turmas.map((item) => (
                            <tr
                                key={`${item.curso}-${item.turma}`}
                            >
                                <td style={tdStyle}>
                                    {item.curso}
                                </td>

                                <td style={tdStyle}>
                                    {item.turma}
                                </td>

                                <td style={tdStyle}>
                                    {item.total_alunos}
                                </td>

                                <td style={tdStyle}>
                                    {item.compareceram}
                                </td>

                                <td style={tdStyle}>
                                    {
                                        item.percentual_comparecimento
                                    }
                                    %
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: 12,
    borderBottom: '1px solid var(--border)',
};

const tdStyle: React.CSSProperties = {
    padding: 12,
    borderBottom: '1px solid var(--border)',
};