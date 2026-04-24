import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../services/api';

interface Estudante {
    id: number;
    nome: string;
    matricula: string;
    curso?: string;
    turma?: string;
    foto_url?: string;
    ativo: boolean;
}

// ─────────────────────────────────────────────────────────────
// Componente de Crop de Foto
// ─────────────────────────────────────────────────────────────
interface CropState {
    startX: number; startY: number;
    endX: number; endY: number;
    dragging: boolean;
}

function ImageCropper({
    file,
    onCropDone,
    onCancel,
}: {
    file: File;
    onCropDone: (blob: Blob) => void;
    onCancel: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [crop, setCrop] = useState<CropState>({ startX: 0, startY: 0, endX: 0, endY: 0, dragging: false });
    const [imgSrc, setImgSrc] = useState('');
    const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 });
    const [displaySize, setDisplaySize] = useState({ w: 400, h: 300 });

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImgSrc(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const img = e.currentTarget;
        imgRef.current = img;
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        setDisplaySize({ w: img.offsetWidth, h: img.offsetHeight });
        // Seleção inicial: quadrado centralizado
        const side = Math.min(img.offsetWidth, img.offsetHeight) * 0.8;
        const sx = (img.offsetWidth - side) / 2;
        const sy = (img.offsetHeight - side) / 2;
        setCrop({ startX: sx, startY: sy, endX: sx + side, endY: sy + side, dragging: false });
    }

    function getPos(e: React.MouseEvent | React.TouchEvent, rect: DOMRect) {
        if ('touches' in e) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    }

    function onMouseDown(e: React.MouseEvent) {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const { x, y } = getPos(e, rect);
        setCrop(c => ({ ...c, startX: x, startY: y, endX: x, endY: y, dragging: true }));
    }

    function onMouseMove(e: React.MouseEvent) {
        if (!crop.dragging) return;
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const { x, y } = getPos(e, rect);
        setCrop(c => ({ ...c, endX: x, endY: y }));
    }

    function onMouseUp() {
        setCrop(c => ({ ...c, dragging: false }));
    }

    function applyCrop() {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;

        // Converter coordenadas de display para coordenadas naturais da imagem
        const scaleX = naturalSize.w / displaySize.w;
        const scaleY = naturalSize.h / displaySize.h;

        const x1 = Math.min(crop.startX, crop.endX);
        const y1 = Math.min(crop.startY, crop.endY);
        const x2 = Math.max(crop.startX, crop.endX);
        const y2 = Math.max(crop.startY, crop.endY);

        const w = (x2 - x1) * scaleX;
        const h = (y2 - y1) * scaleY;

        if (w < 10 || h < 10) return; // seleção muito pequena

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, x1 * scaleX, y1 * scaleY, w, h, 0, 0, w, h);
        canvas.toBlob(blob => { if (blob) onCropDone(blob); }, 'image/jpeg', 0.92);
    }

    // Calcular o retângulo de seleção para overlay
    const selX = Math.min(crop.startX, crop.endX);
    const selY = Math.min(crop.startY, crop.endY);
    const selW = Math.abs(crop.endX - crop.startX);
    const selH = Math.abs(crop.endY - crop.startY);

    return (
        <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                🖱️ Arraste sobre a imagem para selecionar a área do crop
            </p>
            <div
                style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair', userSelect: 'none' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                {imgSrc && (
                    <img
                        src={imgSrc}
                        onLoad={onImgLoad}
                        style={{ maxWidth: '100%', maxHeight: 300, display: 'block', borderRadius: 8 }}
                        draggable={false}
                    />
                )}
                {/* Overlay escuro fora da seleção */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    pointerEvents: 'none',
                    borderRadius: 8,
                }} />
                {/* Janela de seleção */}
                {selW > 4 && selH > 4 && (
                    <div style={{
                        position: 'absolute',
                        left: selX, top: selY,
                        width: selW, height: selH,
                        border: '2px solid #3b82f6',
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
                        pointerEvents: 'none',
                        boxSizing: 'border-box',
                    }} />
                )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center' }}>
                <button type="button" onClick={applyCrop} style={cs.btnPrimary}>✂️ Aplicar Crop</button>
                <button type="button" onClick={onCancel} style={cs.btnCancel}>Usar sem cortar</button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────────────────────
export default function Estudantes() {
    const [dados, setDados] = useState<Estudante[]>([]);
    const [cursos, setCursos] = useState<string[]>([]);
    const [turmas, setTurmas] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal de cadastro/edição
    const [modalAberto, setModalAberto] = useState(false);

    // Tela de detalhe
    const [detalheId, setDetalheId] = useState<number | null>(null);

    // Crop
    const [arquivoParaCrop, setArquivoParaCrop] = useState<File | null>(null);

    // Campos do formulário
    const [nome, setNome] = useState('');
    const [matricula, setMatricula] = useState('');
    const [curso, setCurso] = useState('');
    const [turma, setTurma] = useState('');
    const [foto, setFoto] = useState<File | Blob | null>(null);
    const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(null);
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Filtros — começa mostrando TODOS (não só ativos)
    const [busca, setBusca] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('');
    const [filtroTurma, setFiltroTurma] = useState('');
    const [filtroAtivo, setFiltroAtivo] = useState('');   // '' = todos

    // ── carregamento ──────────────────────────────────────────
    const carregar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('estudantes/', {
                params: {
                    busca: busca || undefined,
                    curso: filtroCurso || undefined,
                    turma: filtroTurma || undefined,
                    ativo: filtroAtivo || undefined,
                }
            });
            setDados(res.data);
        } finally {
            setLoading(false);
        }
    }, [busca, filtroCurso, filtroTurma, filtroAtivo]);

    async function carregarFiltros() {
        try {
            const [rc, rt] = await Promise.all([
                api.get('estudantes/cursos/'),
                api.get('estudantes/turmas/'),
            ]);
            setCursos(rc.data);
            setTurmas(rt.data);
        } catch { /* silencia se ainda não tiver dados */ }
    }

    useEffect(() => { carregar(); }, [carregar]);
    useEffect(() => { carregarFiltros(); }, []);

    // ── preview da foto ───────────────────────────────────────
    useEffect(() => {
        if (foto) {
            const url = URL.createObjectURL(foto as Blob);
            setFotoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [foto]);

    // ── salvar (criar / editar) ───────────────────────────────
    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append('nome', nome);
            fd.append('matricula', matricula);
            fd.append('curso', curso);
            fd.append('turma', turma);
            if (foto) fd.append('foto', foto as Blob, 'foto.jpg');

            if (editandoId) {
                await api.patch(`estudantes/${editandoId}/`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('estudantes/', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            resetForm();
            // Ao criar novo estudante, garante que o filtro não vai esconder ele
            setFiltroAtivo('');
            carregar();
            carregarFiltros();
        } catch (err: any) {
            alert(JSON.stringify(err.response?.data));
        }
    }

    function abrirEditar(e: Estudante) {
        setEditandoId(e.id);
        setNome(e.nome);
        setMatricula(e.matricula);
        setCurso(e.curso || '');
        setTurma(e.turma || '');
        setFoto(null);
        setFotoPreviewUrl(e.foto_url || null);
        setArquivoParaCrop(null);
        setModalAberto(true);
    }

    async function desativar(id: number) {
        if (!confirm('Deseja desativar este estudante?')) return;
        await api.patch(`estudantes/${id}/`, { ativo: false });
        setDetalheId(null);
        carregar();
    }

    async function ativar(id: number) {
        await api.patch(`estudantes/${id}/ativar/`);
        setDetalheId(null);
        carregar();
    }

    function resetForm() {
        setNome(''); setMatricula(''); setCurso(''); setTurma('');
        setFoto(null); setFotoPreviewUrl(null);
        setEditandoId(null); setArquivoParaCrop(null);
        setModalAberto(false);
        if (fileRef.current) fileRef.current.value = '';
    }

    function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setArquivoParaCrop(file);   // abre o cropper
    }

    function onCropDone(blob: Blob) {
        setFoto(blob);
        setArquivoParaCrop(null);   // fecha o cropper
    }

    function onCropCanceled() {
        // Usa o arquivo original sem cortar
        if (arquivoParaCrop) setFoto(arquivoParaCrop);
        setArquivoParaCrop(null);
    }

    const estudanteDetalhe = dados.find(e => e.id === detalheId);

    // ════════════════════════════════════════════════════════════
    // TELA DE DETALHE
    // ════════════════════════════════════════════════════════════
    if (detalheId && estudanteDetalhe) {
        return (
            <div style={cs.pageCenter}>
                <div style={cs.detalheCard}>
                    <button onClick={() => setDetalheId(null)} style={cs.btnBack}>← Voltar</button>

                    {/* Foto centralizada */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 20px' }}>
                        {estudanteDetalhe.foto_url
                            ? <img src={estudanteDetalhe.foto_url} style={cs.fotoGrande} />
                            : <div style={cs.semFotoGrande}>👤</div>}
                    </div>

                    <h2 style={{ textAlign: 'center', margin: '0 0 20px', color: '#111827', fontSize: 22 }}>
                        {estudanteDetalhe.nome}
                    </h2>

                    <div style={cs.infoGrid}>
                        <div style={cs.infoItem}>
                            <span style={cs.infoLabel}>Matrícula</span>
                            <span style={cs.infoValue}>{estudanteDetalhe.matricula}</span>
                        </div>
                        <div style={cs.infoItem}>
                            <span style={cs.infoLabel}>Curso</span>
                            <span style={cs.infoValue}>{estudanteDetalhe.curso || '—'}</span>
                        </div>
                        <div style={cs.infoItem}>
                            <span style={cs.infoLabel}>Turma</span>
                            <span style={cs.infoValue}>{estudanteDetalhe.turma || '—'}</span>
                        </div>
                        <div style={cs.infoItem}>
                            <span style={cs.infoLabel}>Status</span>
                            <span style={{
                                ...cs.infoValue,
                                color: estudanteDetalhe.ativo ? '#16a34a' : '#dc2626',
                                fontWeight: 700,
                            }}>
                                {estudanteDetalhe.ativo ? '✅ Ativo' : '❌ Inativo'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                        <button onClick={() => { setDetalheId(null); abrirEditar(estudanteDetalhe); }} style={{ ...cs.btnPrimary, flex: 1 }}>
                            ✏️ Editar
                        </button>
                        {estudanteDetalhe.ativo
                            ? <button onClick={() => desativar(estudanteDetalhe.id)} style={{ ...cs.btnDanger, flex: 1 }}>
                                🔴 Desativar
                            </button>
                            : <button onClick={() => ativar(estudanteDetalhe.id)} style={{ ...cs.btnSuccess, flex: 1 }}>
                                🟢 Reativar
                            </button>}
                    </div>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // TELA PRINCIPAL — LISTAGEM
    // ════════════════════════════════════════════════════════════
    return (
        <div style={cs.container}>

            {/* Cabeçalho */}
            <div style={cs.header}>
                <h1 style={cs.titulo}>👥 Gestão de Estudantes</h1>
                <button onClick={() => { resetForm(); setModalAberto(true); }} style={cs.btnPrimary}>
                    + Novo Estudante
                </button>
            </div>

            {/* Filtros */}
            <div style={cs.filtros}>
                <input
                    placeholder="🔍 Buscar por nome ou matrícula..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    style={cs.inputFiltro}
                />
                <select value={filtroCurso} onChange={e => setFiltroCurso(e.target.value)} style={cs.selectFiltro}>
                    <option value="">Todos os cursos</option>
                    {cursos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filtroTurma} onChange={e => setFiltroTurma(e.target.value)} style={cs.selectFiltro}>
                    <option value="">Todas as turmas</option>
                    {turmas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filtroAtivo} onChange={e => setFiltroAtivo(e.target.value)} style={cs.selectFiltro}>
                    <option value="">Todos</option>
                    <option value="true">Ativos</option>
                    <option value="false">Inativos</option>
                </select>
            </div>

            {/* Contador */}
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>
                {loading ? 'Carregando...' : `${dados.length} estudante(s) encontrado(s)`}
            </p>

            {/* Tabela */}
            <div style={cs.tableWrapper}>
                <table style={cs.table}>
                    <thead>
                        <tr style={cs.theadRow}>
                            <th style={cs.th}>Foto</th>
                            <th style={cs.th}>Nome</th>
                            <th style={cs.th}>Matrícula</th>
                            <th style={cs.th}>Curso</th>
                            <th style={cs.th}>Turma</th>
                            <th style={cs.th}>Status</th>
                            <th style={cs.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && dados.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                                    Nenhum estudante encontrado.
                                </td>
                            </tr>
                        )}
                        {dados.map(e => (
                            <tr key={e.id} style={cs.tr}>
                                <td style={cs.td}>
                                    {e.foto_url
                                        ? <img src={e.foto_url} style={cs.fotoTabela} />
                                        : <div style={cs.semFotoTabela}>👤</div>}
                                </td>
                                <td style={cs.td}>
                                    {/* FIX: cor do nome legível (#111827) com fundo branco */}
                                    <button onClick={() => setDetalheId(e.id)} style={cs.linkBtn}>
                                        {e.nome}
                                    </button>
                                </td>
                                <td style={cs.td}>{e.matricula}</td>
                                <td style={cs.td}>{e.curso || '—'}</td>
                                <td style={cs.td}>{e.turma || '—'}</td>
                                <td style={cs.td}>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                        background: e.ativo ? '#dcfce7' : '#fee2e2',
                                        color: e.ativo ? '#15803d' : '#dc2626',
                                    }}>
                                        {e.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td style={cs.td}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => abrirEditar(e)} style={cs.btnSmall}>Editar</button>
                                        {e.ativo
                                            ? <button onClick={() => desativar(e.id)} style={cs.btnSmallDanger}>Desativar</button>
                                            : <button onClick={() => ativar(e.id)} style={cs.btnSmallSuccess}>Reativar</button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Modal Cadastro/Edição ── */}
            {modalAberto && (
                <div style={cs.overlay}>
                    <div style={cs.modal}>

                        {/* Título do modal */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, color: '#111827' }}>
                                {editandoId ? '✏️ Editar Estudante' : '➕ Novo Estudante'}
                            </h2>
                            <button onClick={resetForm} style={cs.closeBtn}>✕</button>
                        </div>

                        {/* Cropper — aparece quando o usuário seleciona um arquivo */}
                        {arquivoParaCrop ? (
                            <ImageCropper
                                file={arquivoParaCrop}
                                onCropDone={onCropDone}
                                onCancel={onCropCanceled}
                            />
                        ) : (
                            <form onSubmit={salvar}>

                                {/* Preview da foto — centralizado */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                                    {fotoPreviewUrl
                                        ? <img src={fotoPreviewUrl} style={cs.fotoPreview} />
                                        : <div style={cs.semFotoPreview}>👤</div>}
                                    <label style={cs.fileLbl}>
                                        📷 {foto ? 'Trocar foto' : 'Selecionar foto'}
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={onFileSelected}
                                        />
                                    </label>
                                </div>

                                <label style={cs.label}>Nome *</label>
                                <input required value={nome} onChange={e => setNome(e.target.value)}
                                    style={cs.input} placeholder="Nome completo" />

                                <label style={cs.label}>Matrícula *</label>
                                <input required value={matricula} onChange={e => setMatricula(e.target.value)}
                                    style={cs.input} placeholder="Ex: 2024001" />

                                <label style={cs.label}>Curso</label>
                                <input value={curso} onChange={e => setCurso(e.target.value)}
                                    style={cs.input} placeholder="Ex: Técnico em Informática" />

                                <label style={cs.label}>Turma</label>
                                <input value={turma} onChange={e => setTurma(e.target.value)}
                                    style={cs.input} placeholder="Ex: 2° Ano A" />

                                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                    <button type="submit" style={{ ...cs.btnPrimary, flex: 1 }}>
                                        {editandoId ? '💾 Salvar' : '✅ Cadastrar'}
                                    </button>
                                    <button type="button" onClick={resetForm} style={{ ...cs.btnCancel, flex: 1 }}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────────────────────
const cs: Record<string, React.CSSProperties> = {
    // Layout
    container: { padding: '30px 24px', background: '#f5f6fa', minHeight: '100vh' },
    pageCenter: { padding: '40px 16px', background: '#f5f6fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    titulo: { margin: 0, color: '#111827', fontSize: 24, fontWeight: 700 },
    filtros: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
    inputFiltro: { flex: 2, minWidth: 200, padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', background: '#fff' },
    selectFiltro: { flex: 1, minWidth: 140, padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', background: '#fff' },

    // Tabela
    tableWrapper: { background: '#fff', borderRadius: 12, overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    theadRow: { background: '#f8fafc' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' },
    tr: { borderBottom: '1px solid #f3f4f6' },
    td: { padding: '10px 16px', fontSize: 14, color: '#374151', verticalAlign: 'middle' },

    // FIX principal: nome do aluno legível
    linkBtn: { background: 'none', border: 'none', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', fontSize: 14, padding: 0, textDecoration: 'underline' },

    // Fotos na tabela
    fotoTabela: { width: 44, height: 44, objectFit: 'cover', borderRadius: 8, display: 'block' },
    semFotoTabela: { width: 44, height: 44, background: '#e5e7eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },

    // Detalhe — card centralizado
    detalheCard: {
        background: '#fff', borderRadius: 20, padding: 36,
        width: '100%', maxWidth: 480,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    },
    fotoGrande: { width: 150, height: 150, objectFit: 'cover', borderRadius: '50%', border: '4px solid #e5e7eb', display: 'block' },
    semFotoGrande: {
        width: 150, height: 150, background: '#f3f4f6', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 50, border: '4px solid #e5e7eb',
    },
    infoGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
    infoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 10 },
    infoLabel: { fontSize: 13, color: '#6b7280', fontWeight: 500 },
    infoValue: { fontSize: 14, color: '#111827', fontWeight: 600 },

    // Modal
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
    modal: { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' },
    closeBtn: { background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280', lineHeight: 1 },

    // Preview foto no modal — centralizado
    fotoPreview: { width: 110, height: 110, objectFit: 'cover', borderRadius: '50%', border: '3px solid #e5e7eb', marginBottom: 10 },
    semFotoPreview: { width: 110, height: 110, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, marginBottom: 10, border: '3px solid #e5e7eb' },
    fileLbl: { padding: '7px 18px', border: '1px dashed #93c5fd', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#2563eb', background: '#eff6ff' },

    // Form
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4, marginTop: 14 },
    input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', boxSizing: 'border-box', background: '#fff' },

    // Botões
    btnPrimary: { padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    btnCancel: { padding: '10px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    btnDanger: { padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    btnSuccess: { padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    btnBack: { marginBottom: 8, padding: '7px 14px', background: 'none', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#374151' },
    btnSmall: { padding: '5px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
    btnSmallDanger: { padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
    btnSmallSuccess: { padding: '5px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};