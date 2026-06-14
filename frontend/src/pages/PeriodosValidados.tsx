// frontend/src/pages/PeriodosValidados.tsx

import { useEffect, useState } from 'react';
import api from '../services/api';

export default function PeriodosValidados() {

    const [dados, setDados] = useState<any[]>([]);

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {

        const res =
            await api.get('/periodos-validados/');

        setDados(res.data);
    }

    return (
        <div className="p-8">

            <h1 className="text-2xl font-bold mb-6">
                Períodos Validados
            </h1>

            <table className="w-full border">

                <thead>

                    <tr>

                        <th>Protocolo</th>
                        <th>Fiscal</th>
                        <th>Refeições</th>
                        <th>Total</th>

                    </tr>

                </thead>

                <tbody>

                    {dados.map((item) => (

                        <tr key={item.id}>

                            <td>{item.protocolo}</td>

                            <td>{item.fiscal_email}</td>

                            <td>{item.total_refeicoes}</td>

                            <td>
                                R$ {item.valor_total}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

