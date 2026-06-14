// frontend/src/pages/Configuracoes.tsx

import { useEffect, useState } from 'react';
import api from '../services/api';

type Configuracao = {
    id: number;
    chave: string;
    valor: string;
    descricao?: string;
};

export default function Configuracoes() {

    const [configs, setConfigs] = useState<Configuracao[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {
        try {
            setLoading(true);

            const res = await api.get('/configuracoes/');

            const data = res.data;

            setConfigs(
                Array.isArray(data)
                    ? data
                    : data.results ?? []
            );

        } catch (err) {
            console.error('Erro ao carregar configurações:', err);
            setConfigs([]);
        } finally {
            setLoading(false);
        }
    }

    async function salvar(id: number, valor: string) {
        try {

            await api.patch(`/configuracoes/${id}/`, {
                valor
            });

            await carregar();

        } catch (err: any) {
            console.error(
                'Erro ao salvar configuração:',
                err?.response?.data || err
            );
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">
                    Configurações
                </h1>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="p-8">

            <h1 className="text-2xl font-bold mb-8">
                Configurações
            </h1>

            {configs.length === 0 ? (
                <p>Nenhuma configuração encontrada.</p>
            ) : (
                configs.map((cfg) => (
                    <div
                        key={cfg.id}
                        className="mb-4 flex items-center"
                    >

                        <label className="w-40 font-medium">
                            {cfg.chave}
                        </label>

                        <input
                            className="border p-2 ml-2 flex-1"
                            value={cfg.valor}
                            onChange={(e) =>
                                setConfigs(prev =>
                                    prev.map(c =>
                                        c.id === cfg.id
                                            ? {
                                                ...c,
                                                valor: e.target.value
                                            }
                                            : c
                                    )
                                )
                            }
                        />

                        <button
                            className="ml-2 bg-blue-600 text-white px-3 py-1 rounded"
                            onClick={() =>
                                salvar(cfg.id, cfg.valor)
                            }
                        >
                            Salvar
                        </button>

                    </div>
                ))
            )}

        </div>
    );
}