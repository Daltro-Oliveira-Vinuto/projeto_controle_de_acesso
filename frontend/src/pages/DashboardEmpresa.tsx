// src/pages/DashboardEmpresa.tsx — Sprint 8
import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

// ── tipos ──────────────────────────────────────────────────────────────────

interface Liberacao {
    id: number;
    estudante: string;
    matricula: string;
    metodo: 'biometria' | 'manual';
    data_hora: string;
    operador: string | null;
}

interface Metodos {
    total: number;
    biometria: { total: number; percentual: number };
    manual: { total: number; percentual: number };
}

interface HojeData {
    data: string;
    total_hoje: number;
    total_ontem: number;
    variacao_ontem_pct: number | null;
    distribuicao_hora: { hora: number; total: number }[];
    metodos: Metodos;
    ultimas_liberacoes: Liberacao[];
}

interface SemanaItem {
    data: string;
    dia_semana: string;
    total: number;
}

// ── utilitário ─────────────────────────────────────────────────────────────

function formatHora(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function variacaoLabel(pct: number | null) {
    if (pct === null) return '—';
    const arrow = pct >= 0 ? '▲' : '▼';
    return `${arrow} ${Math.abs(pct)}%`;
}

function variacaoColor(pct: number | null) {
    if (pct === null) return 'var(--text)';
    return pct >= 0 ? '#22c55e' : '#ef4444';
}

// ── componente ─────────────────────────────────────────────────────────────

export default function DashboardEmpresa() {
    const [hoje, setHoje] = useState<HojeData | null>(null);
    const [semana, setSemana] = useState<SemanaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [wsStatus, setWsStatus] = useState<'conectando' | 'conectado' | 'desconectado'>('conectando');
    const wsRef = useRef<WebSocket | null>(null);

    // ── busca dados REST ──────────────────────────────────────────────────

    const fetchHoje = useCallback(async () => {
        const res = await api.get<HojeData>('dashboard/empresa/hoje');
        setHoje(res.data);
    }, []);

    const fetchSemana = useCallback(async () => {
        const res = await api.get<{ semana: SemanaItem[] }>('dashboard/empresa/semana');
        setSemana(res.data.semana);
    }, []);

    useEffect(() => {
        Promise.all([fetchHoje(), fetchSemana()]).finally(() => setLoading(false));
    }, [fetchHoje, fetchSemana]);

    // ── WebSocket ─────────────────────────────────────────────────────────

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setWsStatus('desconectado');
            return;
        }

        const protocol =
            window.location.protocol === 'https:' ? 'wss' : 'ws';

        const ws = new WebSocket(
            `${protocol}://localhost:8000/ws/dashboard/empresa/?token=${token}`
        );

        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WS OPEN');
            setWsStatus('conectado');
        };

        ws.onmessage = (event) => {
            console.log('WS MESSAGE:', event.data);

            try {
                const msg = JSON.parse(event.data);

                if (msg.tipo === 'nova-liberacao') {
                    fetchHoje();
                }
            } catch (err) {
                console.error(err);
            }
        };

        ws.onerror = (err) => {
            console.error('WS ERROR', err);
        };

        ws.onclose = (event) => {
            console.log(
                'WS CLOSE',
                event.code,
                event.reason,
                event.wasClean
            );

            setWsStatus('desconectado');
        };

        return () => {
            ws.close();
        };
    }, [fetchHoje]);

    // ── dados para gráficos ───────────────────────────────────────────────

    const barHoraData = hoje
        ? {
            labels: hoje.distribuicao_hora.map((h) => `${h.hora}h`),
            datasets: [
                {
                    label: 'Liberações',
                    data: hoje.distribuicao_hora.map((h) => h.total),
                    backgroundColor: 'rgba(170, 59, 255, 0.7)',
                    borderColor: 'rgba(170, 59, 255, 1)',
                    borderWidth: 1,
                },
            ],
        }
        : null;

    const barSemanaData = semana.length
        ? {
            labels: semana.map((d) => d.dia_semana),
            datasets: [
                {
                    label: 'Liberações',
                    data: semana.map((d) => d.total),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                },
            ],
        }
        : null;

    const pieData = hoje
        ? {
            labels: ['Biometria', 'Manual'],
            datasets: [
                {
                    data: [hoje.metodos.biometria.total, hoje.metodos.manual.total],
                    backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)'],
                    borderColor: ['#16a34a', '#ca8a04'],
                    borderWidth: 2,
                },
            ],
        }
        : null;

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    } as const;

    // ── render ─────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={styles.loading}>
                <span>Carregando dashboard…</span>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>📊 Dashboard em Tempo Real</h1>
                <span style={{
                    ...styles.wsIndicator,
                    background: wsStatus === 'conectado' ? '#22c55e22' : '#ef444422',
                    color: wsStatus === 'conectado' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${wsStatus === 'conectado' ? '#22c55e' : '#ef4444'}`,
                }}>
                    {wsStatus === 'conectado' ? '● Ao vivo' : wsStatus === 'conectando' ? '◌ Conectando' : '○ Desconectado'}
                </span>
            </div>

            {/* Cards superiores */}
            <div style={styles.cardsRow}>
                {/* Total do dia */}
                <div style={{ ...styles.card, ...styles.cardBig }}>
                    <p style={styles.cardLabel}>Total hoje</p>
                    <p style={styles.cardValueBig}>{hoje?.total_hoje ?? 0}</p>
                    <p style={{ ...styles.cardSub, color: variacaoColor(hoje?.variacao_ontem_pct ?? null) }}>
                        {variacaoLabel(hoje?.variacao_ontem_pct ?? null)} vs ontem ({hoje?.total_ontem ?? 0})
                    </p>
                </div>

                {/* Biometria */}
                <div style={styles.card}>
                    <p style={styles.cardLabel}>🔬 Biometria</p>
                    <p style={styles.cardValue}>{hoje?.metodos.biometria.total ?? 0}</p>
                    <p style={styles.cardSub}>{hoje?.metodos.biometria.percentual ?? 0}% do total</p>
                </div>

                {/* Manual */}
                <div style={styles.card}>
                    <p style={styles.cardLabel}>✋ Manual</p>
                    <p style={styles.cardValue}>{hoje?.metodos.manual.total ?? 0}</p>
                    <p style={styles.cardSub}>{hoje?.metodos.manual.percentual ?? 0}% do total</p>
                </div>
            </div>

            {/* Gráficos linha 1 */}
            <div style={styles.chartsRow}>
                <div style={{ ...styles.chartCard, flex: 3 }}>
                    <h3 style={styles.chartTitle}>Distribuição por hora — hoje</h3>
                    {barHoraData && <Bar data={barHoraData} options={chartOptions} />}
                </div>

                <div style={{ ...styles.chartCard, flex: 1 }}>
                    <h3 style={styles.chartTitle}>Biometria vs Manual</h3>
                    {pieData && <Pie data={pieData} />}
                </div>
            </div>

            {/* Gráficos linha 2 */}
            <div style={styles.chartsRow}>
                <div style={{ ...styles.chartCard, flex: 1 }}>
                    <h3 style={styles.chartTitle}>Últimos 7 dias</h3>
                    {barSemanaData && <Bar data={barSemanaData} options={chartOptions} />}
                </div>
            </div>

            {/* Tabela últimas liberações */}
            <div style={styles.tableCard}>
                <h3 style={styles.chartTitle}>Últimas 10 liberações</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {['#', 'Estudante', 'Matrícula', 'Método', 'Horário', 'Operador'].map((col) => (
                                <th key={col} style={styles.th}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(hoje?.ultimas_liberacoes ?? []).map((lib, i) => (
                            <tr
                                key={lib.id}
                                style={{
                                    ...styles.tr,
                                    background: i === 0 ? 'rgba(170, 59, 255, 0.07)' : undefined,
                                }}
                            >
                                <td style={styles.td}>{lib.id}</td>
                                <td style={styles.td}>{lib.estudante}</td>
                                <td style={styles.td}>{lib.matricula}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        background: lib.metodo === 'biometria' ? '#22c55e22' : '#eab30822',
                                        color: lib.metodo === 'biometria' ? '#22c55e' : '#ca8a04',
                                    }}>
                                        {lib.metodo === 'biometria' ? '🔬 Biometria' : '✋ Manual'}
                                    </span>
                                </td>
                                <td style={styles.td}>{formatHora(lib.data_hora)}</td>
                                <td style={styles.td}>{lib.operador ?? '—'}</td>
                            </tr>
                        ))}
                        {(hoje?.ultimas_liberacoes ?? []).length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ ...styles.td, textAlign: 'center', opacity: 0.5 }}>
                                    Nenhuma liberação hoje
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── estilos ────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
    page: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        textAlign: 'left',
    },
    loading: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '300px', fontSize: '18px', opacity: 0.6,
    },
    header: {
        display: 'flex', alignItems: 'center', gap: '16px',
    },
    title: {
        margin: 0, fontSize: '28px', fontWeight: 600,
        color: 'var(--text-h)',
    },
    wsIndicator: {
        padding: '4px 12px', borderRadius: '20px',
        fontSize: '13px', fontWeight: 500,
    },
    cardsRow: {
        display: 'flex', gap: '16px', flexWrap: 'wrap',
    },
    card: {
        flex: 1, minWidth: '160px',
        background: 'var(--code-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
    },
    cardBig: {
        flex: 2,
        border: '2px solid var(--accent)',
        background: 'var(--accent-bg)',
    },
    cardLabel: {
        margin: '0 0 4px', fontSize: '13px', opacity: 0.7,
        color: 'var(--text)',
    },
    cardValue: {
        margin: '0 0 4px', fontSize: '32px', fontWeight: 700,
        color: 'var(--text-h)',
    },
    cardValueBig: {
        margin: '0 0 4px', fontSize: '56px', fontWeight: 700,
        color: 'var(--accent)',
        lineHeight: 1,
    },
    cardSub: {
        margin: 0, fontSize: '13px',
    },
    chartsRow: {
        display: 'flex', gap: '16px', flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    chartCard: {
        background: 'var(--code-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '200px',
    },
    chartTitle: {
        margin: '0 0 16px', fontSize: '15px', fontWeight: 600,
        color: 'var(--text-h)',
    },
    tableCard: {
        background: 'var(--code-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        overflowX: 'auto',
    },
    table: {
        width: '100%', borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left', padding: '8px 12px',
        fontSize: '12px', fontWeight: 600,
        textTransform: 'uppercase', opacity: 0.6,
        borderBottom: '1px solid var(--border)',
    },
    td: {
        padding: '10px 12px', fontSize: '14px',
        borderBottom: '1px solid var(--border)',
        color: 'var(--text)',
    },
    tr: {},
    badge: {
        padding: '3px 8px', borderRadius: '20px',
        fontSize: '12px', fontWeight: 500,
    },
};
