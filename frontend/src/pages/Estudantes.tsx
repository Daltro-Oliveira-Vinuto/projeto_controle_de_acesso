import { useEffect, useState } from 'react';
import api from '../services/api';

interface Estudante {
    id: number;
    nome: string;
    matricula: string;
    foto?: string;
    foto_url?: string;
}

export default function Estudantes() {
    const [dados, setDados] = useState<Estudante[]>([]);
    const [nome, setNome] = useState('');
    const [matricula, setMatricula] = useState('');
    const [foto, setFoto] = useState<File | null>(null);

    // 🔥 NOVO: controle de edição
    const [editandoId, setEditandoId] = useState<number | null>(null);

    async function carregar() {
        const res = await api.get('estudantes/');
        setDados(res.data);
    }

    // 🔥 CREATE + UPDATE
    async function salvar(e: React.FormEvent) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('matricula', matricula);
        if (foto) formData.append('foto', foto);

        if (editandoId) {
            // 🔥 UPDATE
            await api.patch(`estudantes/${editandoId}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } else {
            // 🔥 CREATE
            await api.post('estudantes/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }

        // reset
        setNome('');
        setMatricula('');
        setFoto(null);
        setEditandoId(null);

        carregar();
    }

    // 🔥 entra em modo edição
    function editar(estudante: Estudante) {
        setNome(estudante.nome);
        setMatricula(estudante.matricula);
        setEditandoId(estudante.id);
    }

    useEffect(() => {
        carregar();
    }, []);

    return (
        <div style={{
            padding: 30,
            background: '#f5f6fa',
            minHeight: '100vh'
        }}>
            <h1 style={{ marginBottom: 20 }}>Gestão de Estudantes</h1>

            {/* FORM */}
            <div style={{
                background: '#fff',
                padding: 24,
                borderRadius: 10,
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                marginBottom: 30,
                width: '100%',
                maxWidth: 900
            }}>
                <h3 style={{ marginBottom: 16 }}>
                    {editandoId ? 'Editar Estudante' : 'Cadastrar Estudante'}
                </h3>

                <form onSubmit={salvar}>
                    <input
                        placeholder="Nome"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        placeholder="Matrícula"
                        value={matricula}
                        onChange={e => setMatricula(e.target.value)}
                        style={inputStyle}
                    />

                    <label style={fileStyle}>
                        {foto ? foto.name : 'Selecionar foto'}
                        <input
                            type="file"
                            hidden
                            onChange={e => setFoto(e.target.files?.[0] || null)}
                        />
                    </label>

                    <button type="submit" style={buttonStyle}>
                        {editandoId ? 'Salvar alterações' : 'Cadastrar'}
                    </button>

                    {/* 🔥 cancelar edição */}
                    {editandoId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditandoId(null);
                                setNome('');
                                setMatricula('');
                                setFoto(null);
                            }}
                            style={cancelStyle}
                        >
                            Cancelar
                        </button>
                    )}
                </form>
            </div>

            {/* LISTA */}
            <div>
                {dados.map(e => (
                    <div
                        key={e.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            marginBottom: 12,
                            padding: 12,
                            background: '#fff',
                            borderRadius: 8,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                        }}
                    >
                        {e.foto_url ? (
                            <img
                                src={e.foto_url}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 8,
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: 8,
                                background: '#ddd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12
                            }}>
                                Sem foto
                            </div>
                        )}

                        <div style={{ flex: 1 }}>
                            <strong>{e.nome}</strong><br />
                            <span style={{ color: '#666' }}>{e.matricula}</span>
                        </div>

                        {/* 🔥 BOTÃO EDITAR */}
                        <button
                            onClick={() => editar(e)}
                            style={editButtonStyle}
                        >
                            Editar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* 🎨 ESTILOS */

const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: 12,
    borderRadius: 6,
    border: '1px solid #ddd',
};

const buttonStyle = {
    width: '100%',
    padding: '12px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    cursor: 'pointer'
};

const cancelStyle = {
    marginTop: 10,
    width: '100%',
    padding: '10px',
    background: '#ccc',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
};

const editButtonStyle = {
    padding: '6px 10px',
    cursor: 'pointer'
};

const fileStyle = {
    display: 'block',
    padding: '10px',
    border: '1px dashed #aaa',
    borderRadius: 6,
    textAlign: 'center' as const,
    cursor: 'pointer',
    marginBottom: 12
};