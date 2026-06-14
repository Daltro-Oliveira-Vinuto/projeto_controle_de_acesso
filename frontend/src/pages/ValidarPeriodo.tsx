// frontend/src/pages/ValidarPeriodo.tsx

import { useState } from 'react';
import api from '../services/api';

export default function ValidarPeriodo() {

    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const [simulacao, setSimulacao] = useState<any>(null);

    const [resultado, setResultado] = useState<any>(null);

    async function simular() {

        if (!dataInicio || !dataFim) {

            alert(
                'Selecione data inicial e final'
            );

            return;
        }

        try {

            const res = await api.post(
                '/fiscal/simular-periodo/',
                {
                    data_inicio: dataInicio,
                    data_fim: dataFim
                }
            );

            setSimulacao(res.data);

        } catch (err) {

            alert(
                'Erro ao simular período'
            );
        }
    }

    async function validar() {

        if (!simulacao) {

            alert(
                'Faça a simulação primeiro'
            );

            return;
        }

        const confirmar = window.confirm(
            `
Período:
${simulacao.data_inicio}
até
${simulacao.data_fim}

Total de refeições:
${simulacao.total_refeicoes}

Valor unitário:
R$ ${simulacao.valor_refeicao}

Valor total:
R$ ${simulacao.valor_total}

Deseja validar?
`
        );

        if (!confirmar) {
            return;
        }

        try {

            const res = await api.post(
                '/fiscal/validar-periodo/',
                {
                    data_inicio: dataInicio,
                    data_fim: dataFim
                }
            );

            setResultado(res.data);

        } catch (err) {

            alert(
                'Erro ao validar período'
            );
        }
    }

    return (
        <div className="p-8">

            <h1 className="text-2xl font-bold mb-6">
                Validar Período Fiscal
            </h1>

            <div className="space-y-4">

                <div>
                    <label>Data Inicial</label>
                    <br />
                    <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) =>
                            setDataInicio(e.target.value)
                        }
                        className="border p-2"
                    />
                </div>

                <div>
                    <label>Data Final</label>
                    <br />
                    <input
                        type="date"
                        value={dataFim}
                        onChange={(e) =>
                            setDataFim(e.target.value)
                        }
                        className="border p-2"
                    />
                </div>

                <div className="flex gap-4">

                    <button
                        onClick={simular}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Simular
                    </button>

                    <button
                        onClick={validar}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Validar
                    </button>

                </div>

            </div>

            {simulacao && (

                <div className="mt-8 border rounded p-4 bg-yellow-50">

                    <h2 className="font-bold mb-3">
                        Prévia da Validação
                    </h2>

                    <p>
                        <strong>Período:</strong>
                        {' '}
                        {simulacao.data_inicio}
                        {' '}
                        até
                        {' '}
                        {simulacao.data_fim}
                    </p>

                    <p>
                        <strong>Total de refeições:</strong>
                        {' '}
                        {simulacao.total_refeicoes}
                    </p>

                    <p>
                        <strong>Valor unitário:</strong>
                        {' '}
                        R$ {simulacao.valor_refeicao}
                    </p>

                    <p>
                        <strong>Valor total:</strong>
                        {' '}
                        R$ {simulacao.valor_total}
                    </p>

                </div>
            )}

            {resultado && (

                <div className="mt-8 border rounded p-4 bg-green-50">

                    <h2 className="font-bold mb-3">
                        Período Validado
                    </h2>

                    <p>
                        <strong>Protocolo:</strong>
                        {' '}
                        {resultado.protocolo}
                    </p>

                    <p>
                        <strong>Valor Total:</strong>
                        {' '}
                        R$ {resultado.valor_total}
                    </p>

                </div>
            )}

        </div>
    );
}