import { useEffect, useState } from 'react';
import api from '../services/api';

interface Estudante {
    id: number;
    nome: string;
    matricula: string;
    foto?: string;
    foto_url?: string; // 🔥 CORREÇÃO
}

export default function Estudantes() {
    const [dados, setDados] = useState<Estudante[]>([]);
    const [nome, setNome] = useState('');
    const [matricula, setMatricula] = useState('');
    const [foto, setFoto] = useState<File | null>(null);

    async function carregar() {
        const res = await api.get('estudantes/');
        setDados(res.data);
    }

    async function criar(e: React.FormEvent) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('matricula', matricula);
        if (foto) formData.append('foto', foto);

        await api.post('estudantes/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        setNome('');
        setMatricula('');
        setFoto(null);
        carregar();
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

            {/* 🔥 FORM BONITO */}
            <div style={{
                background: '#fff',
                padding: 24,
                borderRadius: 10,
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                marginBottom: 30,
                maxWidth: '100%'
            }}>
                <h3 style={{ marginBottom: 16 }}>Cadastrar Estudante</h3>

                <form onSubmit={criar}>
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

                    {/* 🔥 INPUT FILE BONITO */}
                    <label style={fileStyle}>
                        {foto ? foto.name : 'Selecionar foto'}
                        <input
                            type="file"
                            hidden
                            onChange={e => setFoto(e.target.files?.[0] || null)}
                        />
                    </label>

                    <button type="submit" style={buttonStyle}>
                        Cadastrar
                    </button>
                </form>
            </div>

            {/* 🔥 LISTA MELHORADA */}
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

                        <div>
                            <strong style={{ fontSize: 16 }}>{e.nome}</strong><br />
                            <span style={{ color: '#666' }}>{e.matricula}</span>
                        </div>
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
    fontSize: 14
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

const fileStyle = {
    display: 'block',
    padding: '10px',
    border: '1px dashed #aaa',
    borderRadius: 6,
    textAlign: 'center' as const,
    cursor: 'pointer',
    marginBottom: 12
};