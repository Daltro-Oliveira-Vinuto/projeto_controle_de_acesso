import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Estudante {
    id: number;
    nome: string;
    matricula: string;
    foto?: string;
    foto_url?: string;
    ativo?: boolean;
}

export default function Estudantes() {
    const navigate = useNavigate();

    const [dados, setDados] = useState<Estudante[]>([]);
    const [nome, setNome] = useState('');
    const [matricula, setMatricula] = useState('');
    const [foto, setFoto] = useState<File | null>(null);

    const [preview, setPreview] = useState<string | null>(null);
    const [busca, setBusca] = useState('');
    const [mostrarAtivos, setMostrarAtivos] = useState(true);

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

        await api.post('estudantes/', formData);

        setNome('');
        setMatricula('');
        setFoto(null);
        setPreview(null);

        carregar();
    }

    async function desativar(id: number) {
        await api.patch(`estudantes/${id}/`, { ativo: false });
        carregar();
    }

    useEffect(() => {
        carregar();
    }, []);

    return (
        <div style={container}>
            <h1 style={{ marginBottom: 20 }}>Gestão de Estudantes</h1>

            {/* 🔎 BUSCA */}
            <input
                placeholder="Buscar por nome ou matrícula..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                style={inputStyle}
            />

            {/* 🎯 FILTRO */}
            <button onClick={() => setMostrarAtivos(!mostrarAtivos)} style={filterButton}>
                {mostrarAtivos ? 'Mostrar Inativos' : 'Mostrar Ativos'}
            </button>

            {/* 📋 FORM */}
            <div style={card}>
                <h3>Cadastrar Estudante</h3>

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

                    <label style={fileStyle}>
                        {foto ? foto.name : 'Selecionar foto'}
                        <input
                            type="file"
                            hidden
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setFoto(file);
                                    setPreview(URL.createObjectURL(file));
                                }
                            }}
                        />
                    </label>

                    {preview && (
                        <img src={preview} style={previewStyle} />
                    )}

                    <button type="submit" style={buttonStyle}>
                        Cadastrar
                    </button>
                </form>
            </div>

            {/* 📊 LISTA */}
            <div>
                {dados
                    .filter(e =>
                        e.nome.toLowerCase().includes(busca.toLowerCase()) ||
                        e.matricula.includes(busca)
                    )
                    .filter(e => mostrarAtivos ? e.ativo !== false : e.ativo === false)
                    .map(e => (
                        <div key={e.id} style={item}>

                            <div
                                style={{ cursor: 'pointer', display: 'flex', gap: 16 }}
                                onClick={() => navigate(`/estudantes/${e.id}`)}
                            >
                                {e.foto_url ? (
                                    <img src={e.foto_url} style={imgStyle} />
                                ) : (
                                    <div style={noImg}>Sem foto</div>
                                )}

                                <div>
                                    <strong>{e.nome}</strong><br />
                                    {e.matricula}<br />
                                    <span>{e.ativo ? '🟢 Ativo' : '🔴 Inativo'}</span>
                                </div>
                            </div>

                            <div style={{ marginLeft: 'auto' }}>
                                <button
                                    onClick={() => navigate(`/estudantes/${e.id}?edit=true`)}
                                    style={editButton}
                                >
                                    Editar
                                </button>

                                <button
                                    onClick={() => desativar(e.id)}
                                    style={deleteButton}
                                >
                                    Desativar
                                </button>
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
    minHeight: '100vh',
    maxWidth: 900,
    margin: '0 auto'
};

const card = {
    background: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
};

const item = {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    padding: 12,
    background: '#fff',
    borderRadius: 8
};

const imgStyle = {
    width: 80,
    height: 80,
    borderRadius: 8,
    objectFit: 'cover' as const
};

const noImg = {
    width: 80,
    height: 80,
    background: '#ddd',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const inputStyle = {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: '1px solid #ccc'
};

const fileStyle = {
    display: 'block',
    padding: 10,
    border: '1px dashed #aaa',
    borderRadius: 6,
    marginBottom: 10,
    cursor: 'pointer'
};

const previewStyle = {
    width: 100,
    height: 100,
    borderRadius: 8,
    objectFit: 'cover' as const,
    marginBottom: 10
};

const buttonStyle = {
    width: '100%',
    padding: 10,
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 6
};

const editButton = {
    marginRight: 8,
    padding: '6px 10px',
    background: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
};

const deleteButton = {
    padding: '6px 10px',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
};

const filterButton = {
    marginBottom: 20,
    padding: '8px 12px',
    background: '#2c3e50',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
};