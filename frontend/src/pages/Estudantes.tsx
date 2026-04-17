import { useEffect, useState } from 'react';
import api from '../services/api';

interface Estudante {
    id: number;
    nome: string;
    matricula: string;
    foto_url?: string;
    ativo?: boolean;
}

export default function Estudantes() {
    const [dados, setDados] = useState<Estudante[]>([]);

    const [nome, setNome] = useState('');
    const [matricula, setMatricula] = useState('');
    const [foto, setFoto] = useState<File | null>(null);

    const [busca, setBusca] = useState('');
    const [filtroAtivo, setFiltroAtivo] = useState('');

    const [editandoId, setEditandoId] = useState<number | null>(null);

    async function carregar() {
        const res = await api.get('estudantes/', {
            params: {
                busca: busca || undefined,
                ativo: filtroAtivo || undefined,
            }
        });
        setDados(res.data);
    }

    async function salvar(e: React.FormEvent) {
        e.preventDefault();

        try {
            if (editandoId) {
                // 🔥 EDIÇÃO (SEM FORM DATA se não tiver foto)
                const data: any = {
                    nome,
                    matricula,
                };

                if (foto) {
                    const formData = new FormData();
                    formData.append('nome', nome);
                    formData.append('matricula', matricula);
                    formData.append('foto', foto);

                    await api.patch(`estudantes/${editandoId}/`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } else {
                    await api.patch(`estudantes/${editandoId}/`, data);
                }

            } else {
                // 🔥 CRIAÇÃO (sempre formData)
                const formData = new FormData();
                formData.append('nome', nome);
                formData.append('matricula', matricula);
                if (foto) formData.append('foto', foto);

                await api.post('estudantes/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            resetForm();
            carregar();

        } catch (err: any) {
            console.log('ERRO BACKEND:', err.response?.data);
            alert(JSON.stringify(err.response?.data));
        }
    }

    function editar(e: Estudante) {
        setEditandoId(e.id);
        setNome(e.nome);
        setMatricula(e.matricula);
    }

    async function desativar(id: number) {
        await api.patch(`estudantes/${id}/`, {
            ativo: false
        });
        carregar();
    }

    function resetForm() {
        setNome('');
        setMatricula('');
        setFoto(null);
        setEditandoId(null);
    }

    useEffect(() => {
        carregar();
    }, [busca, filtroAtivo]);

    return (
        <div style={container}>

            <h1>Gestão de Estudantes</h1>

            {/* 🔍 BUSCA + FILTRO */}
            <div style={toolbar}>
                <input
                    placeholder="Buscar por nome ou matrícula"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    style={input}
                />

                <select
                    value={filtroAtivo}
                    onChange={e => setFiltroAtivo(e.target.value)}
                    style={input}
                >
                    <option value="">Todos</option>
                    <option value="true">Ativos</option>
                    <option value="false">Inativos</option>
                </select>
            </div>

            {/* FORM */}
            <div style={card}>
                <h3>{editandoId ? 'Editar Estudante' : 'Cadastrar Estudante'}</h3>

                <form onSubmit={salvar}>
                    <input
                        placeholder="Nome"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        style={input}
                    />

                    <input
                        placeholder="Matrícula"
                        value={matricula}
                        onChange={e => setMatricula(e.target.value)}
                        style={input}
                    />

                    <label style={file}>
                        {foto ? foto.name : 'Selecionar foto'}
                        <input
                            type="file"
                            hidden
                            onChange={e => setFoto(e.target.files?.[0] || null)}
                        />
                    </label>

                    <button style={btn}>
                        {editandoId ? 'Salvar' : 'Cadastrar'}
                    </button>

                    {editandoId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            style={btnCancel}
                        >
                            Cancelar
                        </button>
                    )}
                </form>
            </div>

            {/* LISTA */}
            <div>
                {dados.map(e => (
                    <div key={e.id} style={item}>
                        {e.foto_url ? (
                            <img src={e.foto_url} style={img} />
                        ) : (
                            <div style={noImg}>Sem foto</div>
                        )}

                        <div style={{ flex: 1 }}>
                            <strong>{e.nome}</strong><br />
                            {e.matricula}<br />
                            <span style={{
                                color: e.ativo ? 'green' : 'red',
                                fontSize: 12
                            }}>
                                {e.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => editar(e)} style={btnSmall}>
                                Editar
                            </button>

                            {e.ativo && (
                                <button onClick={() => desativar(e.id)} style={btnDanger}>
                                    Desativar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

/* 🎨 ESTILOS */

const container = {
    padding: 30,
    background: '#f5f6fa',
    minHeight: '100vh'
};

const toolbar = {
    display: 'flex',
    gap: 12,
    marginBottom: 20
};

const card = {
    background: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20
};

const item = {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    background: '#fff',
    borderRadius: 8,
    marginBottom: 10
};

const input = {
    width: '100%',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #ddd'
};

const file = {
    display: 'block',
    padding: 10,
    border: '1px dashed #aaa',
    borderRadius: 6,
    marginBottom: 10,
    cursor: 'pointer'
};

const btn = {
    width: '100%',
    padding: 12,
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
};

const btnCancel = {
    marginTop: 10,
    width: '100%',
    padding: 10,
    background: '#ccc',
    border: 'none',
    borderRadius: 6
};

const btnSmall = {
    padding: '6px 10px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6
};

const btnDanger = {
    padding: '6px 10px',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: 6
};

const img = {
    width: 80,
    height: 80,
    objectFit: 'cover' as const,
    borderRadius: 8
};

const noImg = {
    width: 80,
    height: 80,
    background: '#ddd',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12
};