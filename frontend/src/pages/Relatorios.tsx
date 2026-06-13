// frontend / src / pages / Relatorios.tsx

// src/pages/Relatorios.tsx
// Sprint 10 — Relatórios e Exportação

import { useEffect, useState } from 'react';
import api from '../services/api';

// ---------------------------------------------------------------------------
// tipos
// ---------------------------------------------------------------------------

type Aba = 'diario' | 'mensal' | 'estudante' | 'operador' | 'excecoes' | 'pagamento';

interface Estudante {
    id: number;
    nome: string;
    matricula: string;
    curso: string;
    turma: string;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function hoje() {
    return new Date().toISOString().split('T')[0];
}

function umMesAtras() {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
}

function anoAtual() {
    return String(new Date().getFullYear());
}

function mesAtual() {
    return String(new Date().getMonth() + 1).padStart(2, '0');
}

// Abre o blob do PDF em nova aba ou força download do CSV
async function baixar(url: string, filename: string) {
    const resp = await api.get(url, { responseType: 'blob' });
    const blob = resp.data as Blob;
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
}

// ---------------------------------------------------------------------------
// estilos inline — mantém a identidade visual roxa do projeto
// ---------------------------------------------------------------------------

const cores = {
    primario: '#6d28d9',
    primarioHover: '#5b21b6',
    fundo: '#f5f3ff',
    texto: '#1e1b4b',
    cinza: '#6b7280',
    borda: '#e5e7eb',
    branco: '#ffffff',
    vermelho: '#dc2626',
};

const S = {
    page: {
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: cores.texto,
        minHeight: '100vh',
        background: cores.fundo,
    } as React.CSSProperties,

    titulo: {
        fontSize: '1.6rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
        color: cores.primario,
    } as React.CSSProperties,

    abas: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap' as const,
        marginBottom: '1.5rem',
    } as React.CSSProperties,

    aba: (ativa: boolean) => ({
        padding: '0.5rem 1.1rem',
        borderRadius: '9999px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: ativa ? 700 : 400,
        background: ativa ? cores.primario : cores.branco,
        color: ativa ? cores.branco : cores.primario,
        boxShadow: ativa ? '0 2px 8px rgba(109,40,217,.3)' : '0 1px 3px rgba(0,0,0,.1)',
        transition: 'all .2s',
    } as React.CSSProperties),

    card: {
        background: cores.branco,
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 2px 16px rgba(0,0,0,.07)',
        marginBottom: '1.5rem',
    } as React.CSSProperties,

    linha: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap' as const,
        alignItems: 'flex-end',
        marginBottom: '1rem',
    } as React.CSSProperties,

    campo: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.3rem',
    } as React.CSSProperties,

    label: {
        fontSize: '0.8rem',
        fontWeight: 600,
        color: cores.cinza,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    } as React.CSSProperties,

    input: {
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        border: `1px solid ${cores.borda}`,
        fontSize: '0.95rem',
        outline: 'none',
        minWidth: '160px',
    } as React.CSSProperties,

    select: {
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        border: `1px solid ${cores.borda}`,
        fontSize: '0.95rem',
        outline: 'none',
        minWidth: '220px',
        background: cores.branco,
    } as React.CSSProperties,

    botoes: {
        display: 'flex',
        gap: '0.75rem',
        marginTop: '0.5rem',
        flexWrap: 'wrap' as const,
    } as React.CSSProperties,

    btn: (cor: string) => ({
        padding: '0.55rem 1.2rem',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '0.9rem',
        background: cor,
        color: cores.branco,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'opacity .2s',
    } as React.CSSProperties),

    tabelaWrap: {
        overflowX: 'auto' as const,
        marginTop: '1rem',
    } as React.CSSProperties,

    tabela: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        fontSize: '0.88rem',
    } as React.CSSProperties,

    th: {
        background: cores.primario,
        color: cores.branco,
        padding: '0.6rem 0.8rem',
        textAlign: 'left' as const,
        fontWeight: 600,
        whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,

    td: (par: boolean) => ({
        padding: '0.5rem 0.8rem',
        background: par ? '#f5f3ff' : cores.branco,
        borderBottom: `1px solid ${cores.borda}`,
    } as React.CSSProperties),

    vazio: {
        padding: '2rem',
        textAlign: 'center' as const,
        color: cores.cinza,
        fontStyle: 'italic',
    } as React.CSSProperties,

    erro: {
        color: cores.vermelho,
        marginTop: '0.5rem',
        fontSize: '0.9rem',
    } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// sub-componente de tabela genérica
// ---------------------------------------------------------------------------

function Tabela({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
    if (rows.length === 0) {
        return <p style={S.vazio}>Nenhum registro encontrado.</p>;
    }
    return (
        <div style={S.tabelaWrap}>
            <table style={S.tabela}>
                <thead>
                    <tr>
                        {headers.map((h) => (
                            <th key={h} style={S.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j} style={S.td(i % 2 === 0)}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ---------------------------------------------------------------------------
// abas
// ---------------------------------------------------------------------------

function AbaDiario() {
    const [data, setData] = useState(hoje());
    const [preview, setPreview] = useState<{ headers: string[]; rows: (string | number)[][] } | null>(null);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function carregar() {
        setErro('');
        setCarregando(true);
        try {
            const res = await api.get('/relatorios/diario/preview', { params: { data } });
            setPreview(res.data);
        } catch {
            // preview endpoint opcional — usa lista direta
            setPreview(null);
            setErro('Pré-visualização indisponível. Use os botões para baixar o relatório.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div>
            <div style={S.linha}>
                <div style={S.campo}>
                    <span style={S.label}>Data</span>
                    <input type="date" style={S.input} value={data}
                        onChange={(e) => setData(e.target.value)} />
                </div>
                <button style={S.btn('#6366f1')} onClick={carregar} disabled={carregando}>
                    🔍 Pré-visualizar
                </button>
            </div>
            {erro && <p style={S.erro}>{erro}</p>}
            <div style={S.botoes}>
                <button style={S.btn(cores.primario)}
                    onClick={() => baixar(`/relatorios/diario?data=${data}&formato=pdf`, `relatorio_diario_${data}.pdf`)}>
                    📄 Gerar PDF
                </button>
                <button style={S.btn('#059669')}
                    onClick={() => baixar(`/relatorios/diario?data=${data}&formato=csv`, `relatorio_diario_${data}.csv`)}>
                    📊 Exportar CSV
                </button>
            </div>
            {carregando && <p style={{ color: cores.cinza, marginTop: '1rem' }}>Carregando...</p>}
            {preview && <Tabela headers={preview.headers} rows={preview.rows} />}
        </div>
    );
}

function AbaMensal() {
    const [ano, setAno] = useState(anoAtual());
    const [mes, setMes] = useState(mesAtual());

    const MESES = [
        { v: '01', l: 'Janeiro' }, { v: '02', l: 'Fevereiro' }, { v: '03', l: 'Março' },
        { v: '04', l: 'Abril' }, { v: '05', l: 'Maio' }, { v: '06', l: 'Junho' },
        { v: '07', l: 'Julho' }, { v: '08', l: 'Agosto' }, { v: '09', l: 'Setembro' },
        { v: '10', l: 'Outubro' }, { v: '11', l: 'Novembro' }, { v: '12', l: 'Dezembro' },
    ];

    return (
        <div>
            <div style={S.linha}>
                <div style={S.campo}>
                    <span style={S.label}>Mês</span>
                    <select style={S.select} value={mes} onChange={(e) => setMes(e.target.value)}>
                        {MESES.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                    </select>
                </div>
                <div style={S.campo}>
                    <span style={S.label}>Ano</span>
                    <input type="number" style={S.input} value={ano}
                        min="2020" max="2099" onChange={(e) => setAno(e.target.value)} />
                </div>
            </div>
            <div style={S.botoes}>
                <button style={S.btn(cores.primario)}
                    onClick={() => baixar(`/relatorios/mensal?ano=${ano}&mes=${Number(mes)}&formato=pdf`,
                        `relatorio_mensal_${ano}_${mes}.pdf`)}>
                    📄 Gerar PDF
                </button>
                <button style={S.btn('#059669')}
                    onClick={() => baixar(`/relatorios/mensal?ano=${ano}&mes=${Number(mes)}&formato=csv`,
                        `relatorio_mensal_${ano}_${mes}.csv`)}>
                    📊 Exportar CSV
                </button>
            </div>
        </div>
    );
}

function AbaEstudante() {
    const [busca, setBusca] = useState('');
    const [todos, setTodos] = useState<Estudante[]>([]);
    const [filtrados, setFiltrados] = useState<Estudante[]>([]);
    const [selecionado, setSelecionado] = useState<Estudante | null>(null);

    useEffect(() => {
        api.get('/estudantes/').then((r) => {
            const lista: Estudante[] = r.data.results ?? r.data;
            setTodos(lista);
        }).catch(() => { });
    }, []);

    useEffect(() => {
        const q = busca.toLowerCase();
        setFiltrados(
            q.length < 2 ? [] :
                todos.filter((e) =>
                    e.nome.toLowerCase().includes(q) ||
                    e.matricula.toLowerCase().includes(q)
                ).slice(0, 8)
        );
    }, [busca, todos]);

    return (
        <div>
            <div style={S.campo}>
                <span style={S.label}>Buscar estudante</span>
                <input
                    style={{ ...S.input, minWidth: '300px' }}
                    placeholder="Nome ou matrícula..."
                    value={busca}
                    onChange={(e) => { setBusca(e.target.value); setSelecionado(null); }}
                />
            </div>
            {filtrados.length > 0 && !selecionado && (
                <ul style={{
                    listStyle: 'none', padding: 0, margin: '0.5rem 0',
                    background: cores.branco, border: `1px solid ${cores.borda}`,
                    borderRadius: '0.5rem', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,.08)'
                }}>
                    {filtrados.map((e) => (
                        <li key={e.id}
                            style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: `1px solid ${cores.borda}` }}
                            onClick={() => { setSelecionado(e); setBusca(e.nome); setFiltrados([]); }}>
                            <b>{e.nome}</b> — {e.matricula} ({e.curso})
                        </li>
                    ))}
                </ul>
            )}
            {selecionado && (
                <>
                    <p style={{ marginTop: '0.5rem', color: cores.cinza }}>
                        Selecionado: <b>{selecionado.nome}</b> — {selecionado.matricula}
                    </p>
                    <div style={S.botoes}>
                        <button style={S.btn(cores.primario)}
                            onClick={() => baixar(`/relatorios/estudante/${selecionado.id}?formato=pdf`,
                                `relatorio_estudante_${selecionado.matricula}.pdf`)}>
                            📄 Gerar PDF
                        </button>
                        <button style={S.btn('#059669')}
                            onClick={() => baixar(`/relatorios/estudante/${selecionado.id}?formato=csv`,
                                `relatorio_estudante_${selecionado.matricula}.csv`)}>
                            📊 Exportar CSV
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function AbaPeriodo({
    nomeAba, rotaBase, nomeArquivo, titulo
}: { nomeAba: string; rotaBase: string; nomeArquivo: string; titulo: string }) {
    const [inicio, setInicio] = useState(umMesAtras());
    const [fim, setFim] = useState(hoje());

    const params = `?inicio=${inicio}&fim=${fim}`;

    return (
        <div>
            <div style={S.linha}>
                <div style={S.campo}>
                    <span style={S.label}>Data inicial</span>
                    <input type="date" style={S.input} value={inicio}
                        max={fim} onChange={(e) => setInicio(e.target.value)} />
                </div>
                <div style={S.campo}>
                    <span style={S.label}>Data final</span>
                    <input type="date" style={S.input} value={fim}
                        min={inicio} onChange={(e) => setFim(e.target.value)} />
                </div>
            </div>
            <div style={S.botoes}>
                <button style={S.btn(cores.primario)}
                    onClick={() => baixar(`${rotaBase}${params}&formato=pdf`,
                        `${nomeArquivo}_${inicio}_${fim}.pdf`)}>
                    📄 Gerar PDF
                </button>
                <button style={S.btn('#059669')}
                    onClick={() => baixar(`${rotaBase}${params}&formato=csv`,
                        `${nomeArquivo}_${inicio}_${fim}.csv`)}>
                    📊 Exportar CSV
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// componente principal
// ---------------------------------------------------------------------------

const ABAS: { id: Aba; label: string }[] = [
    { id: 'diario', label: '📅 Diário' },
    { id: 'mensal', label: '🗓️ Mensal' },
    { id: 'estudante', label: '👤 Por Estudante' },
    { id: 'operador', label: '🧑‍💼 Por Operador' },
    { id: 'excecoes', label: '⚠️ Exceções' },
    { id: 'pagamento', label: '💰 Pagamento' },
];

const DESCRICOES: Record<Aba, string> = {
    diario: 'Todas as refeições servidas em uma data específica.',
    mensal: 'Consolidado mensal de refeições por mês e ano.',
    estudante: 'Histórico completo de refeições de um estudante.',
    operador: 'Liberações agrupadas por operador em um intervalo de datas.',
    excecoes: 'Somente liberações manuais (com motivo registrado).',
    pagamento: 'Base para faturamento: total de refeições por estudante.',
};

export default function Relatorios() {
    const [aba, setAba] = useState<Aba>('diario');

    return (
        <div style={S.page}>
            <h1 style={S.titulo}>📊 Relatórios e Exportação</h1>

            {/* Abas */}
            <div style={S.abas}>
                {ABAS.map((a) => (
                    <button key={a.id} style={S.aba(aba === a.id)}
                        onClick={() => setAba(a.id)}>
                        {a.label}
                    </button>
                ))}
            </div>

            {/* Conteúdo */}
            <div style={S.card}>
                <p style={{ color: cores.cinza, marginBottom: '1.2rem', fontSize: '0.9rem' }}>
                    {DESCRICOES[aba]}
                </p>

                {aba === 'diario' && <AbaDiario />}
                {aba === 'mensal' && <AbaMensal />}
                {aba === 'estudante' && <AbaEstudante />}
                {aba === 'operador' && (
                    <AbaPeriodo
                        nomeAba="operador"
                        rotaBase="/relatorios/operador"
                        nomeArquivo="relatorio_operador"
                        titulo="Relatório por Operador"
                    />
                )}
                {aba === 'excecoes' && (
                    <AbaPeriodo
                        nomeAba="excecoes"
                        rotaBase="/relatorios/excecoes"
                        nomeArquivo="relatorio_excecoes"
                        titulo="Relatório de Exceções"
                    />
                )}
                {aba === 'pagamento' && (
                    <AbaPeriodo
                        nomeAba="pagamento"
                        rotaBase="/relatorios/pagamento"
                        nomeArquivo="relatorio_pagamento"
                        titulo="Relatório de Pagamento"
                    />
                )}
            </div>
        </div>
    );
}

