// src/pages/DashboardFiscal.tsx

import { useEffect, useState } from 'react';
import api from '../services/api';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
);

interface Resumo {
    data: string;
    total: number;
    biometria: number;
    manual: number;
}

interface DashboardFiscalData {
    cards: {
        dia: number;
        semana: number;
        mes: number;
    };

    resumo_diario: Resumo[];
}

function Card({
    titulo,
    valor,
}: {
    titulo: string;
    valor: number;
}) {
    return (
        <div
            style={{
                flex: 1,
                padding: 20,
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--code-bg)',
            }}
        >
            <p
                style={{
                    margin: 0,
                    opacity: 0.7,
                    fontSize: 14,
                }}
            >
                {titulo}
            </p>

            <h2
                style={{
                    marginTop: 10,
                    fontSize: 36,
                }}
            >
                {valor}
            </h2>
        </div>
    );
}

export default function DashboardFiscal() {

    const [dados, setDados] = useState<DashboardFiscalData | null>(null);

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {
        const res = await api.get('/dashboard/fiscal');
        setDados(res.data);
    }

    if (!dados) {
        return <div style={{ padding: 24 }}>Carregando...</div>;
    }

    // gráfico linha evolução diária

    const lineData = {
        labels: dados.resumo_diario.map(i => i.data),

        datasets: [
            {
                label: 'Liberações',

                data: dados.resumo_diario.map(i => i.total),

                borderColor: '#3b82f6',

                backgroundColor: 'rgba(59,130,246,0.25)',

                tension: 0.3,
            },
        ],
    };

    // gráfico pizza biometria x manual

    const pieData = {
        labels: ['Biometria', 'Manual'],

        datasets: [
            {
                data: [
                    dados.resumo_diario.reduce(
                        (acc, item) => acc + item.biometria,
                        0
                    ),

                    dados.resumo_diario.reduce(
                        (acc, item) => acc + item.manual,
                        0
                    ),
                ],

                backgroundColor: [
                    '#22c55e',
                    '#eab308',
                ],
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
            <h1>📋 Dashboard Fiscal</h1>

            {/* cards */}

            <div
                style={{
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                }}
            >
                <Card titulo="Hoje" valor={dados.cards.dia} />

                <Card titulo="Semana" valor={dados.cards.semana} />

                <Card titulo="Mês" valor={dados.cards.mes} />
            </div>

            {/* gráficos */}

            <div
                style={{
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                }}
            >
                {/* linha */}

                <div
                    style={{
                        flex: 2,
                        minWidth: 300,
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
                        Evolução diária
                    </h3>

                    <Line data={lineData} />
                </div>

                {/* pizza */}

                <div
                    style={{
                        flex: 1,
                        minWidth: 280,
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
                        Biometria vs Manual
                    </h3>

                    <Pie data={pieData} />
                </div>
            </div>

            {/* tabela */}

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
                    Resumo diário
                </h3>

                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                    }}
                >
                    <thead>
                        <tr>
                            <th style={thStyle}>Data</th>
                            <th style={thStyle}>Total</th>
                            <th style={thStyle}>Biometria</th>
                            <th style={thStyle}>Manual</th>
                        </tr>
                    </thead>

                    <tbody>
                        {dados.resumo_diario.map((item) => (
                            <tr key={item.data}>
                                <td style={tdStyle}>{item.data}</td>

                                <td style={tdStyle}>{item.total}</td>

                                <td style={tdStyle}>
                                    {item.biometria}
                                </td>

                                <td style={tdStyle}>
                                    {item.manual}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button
                    style={{
                        marginTop: 24,
                        padding: '10px 18px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        background: 'var(--accent)',
                        color: '#fff',
                        fontWeight: 600,
                    }}
                >
                    Validar Período
                </button>
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