// frontend/src/pages/Configuracoes.tsx

import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Configuracoes() {

    const [configs, setConfigs] = useState<any[]>([]);

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {

        const res =
            await api.get('/configuracoes/');

        setConfigs(res.data);
    }

    async function salvar(
        id: number,
        valor: string
    ) {

        await api.put(
            `/configuracoes/${id}/`,
            { valor }
        );

        carregar();
    }

    return (
        <div className="p-8">

            <h1 className="text-2xl font-bold mb-8">
                Configurações
            </h1>

            {configs.map((cfg) => (

                <div
                    key={cfg.id}
                    className="mb-4"
                >

                    <label>
                        {cfg.chave}
                    </label>

                    <input
                        className="border p-2 ml-2"
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
                            salvar(
                                cfg.id,
                                cfg.valor
                            )
                        }
                    >
                        Salvar
                    </button>

                </div>

            ))}

        </div>
    );
}

