import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Ocorrencias() {

    const [tipo, setTipo] = useState('problema_biometria');
    const [descricao, setDescricao] = useState('');
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);

    async function carregar() {
        const res = await api.get('/ocorrencias/');

        console.log("RESPOSTA API:", res.data);

        setOcorrencias(
            Array.isArray(res.data)
                ? res.data
                : res.data.results || []
        );
    }

    useEffect(() => {
        carregar();
    }, []);

    async function salvar() {

        await api.post('/ocorrencias/', {
            tipo,
            descricao,
        });

        setDescricao('');

        await carregar();
    }

    return (
        <div className="p-8">

            <h1 className="text-2xl font-bold mb-6">
                Ocorrências
            </h1>

            <div className="space-y-4">

                <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="problema_biometria">
                        Problema Biometria
                    </option>

                    <option value="comportamento">
                        Comportamento
                    </option>

                    <option value="observacao_geral">
                        Observação Geral
                    </option>
                </select>

                <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="border w-full p-2 rounded"
                    rows={5}
                />

                <button
                    onClick={salvar}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Registrar
                </button>
            </div>

            <hr className="my-8" />

            {ocorrencias.map((o) => (
                <div
                    key={o.id}
                    className="border p-3 rounded mb-2"
                >
                    <strong>{o.tipo}</strong>
                    <p>{o.descricao}</p>
                </div>
            ))}
        </div>
    );
}