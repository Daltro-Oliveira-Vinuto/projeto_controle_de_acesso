// src/pages/Operador.tsx

import api from '../services/api'
import { useEffect, useRef, useState } from 'react'

type Estudante = {
    id: number
    nome: string
    matricula: string
    curso: string
    turma: string
    foto_url: string | null
}

export default function Operador() {

    const inputRef = useRef<HTMLInputElement>(null)

    const [codigo, setCodigo] = useState('')
    const [status, setStatus] = useState<
        'idle' | 'sucesso' | 'erro'
    >('idle')

    const [mensagem, setMensagem] = useState(
        'Aproxime o dedo no leitor'
    )

    const [estudante, setEstudante] =
        useState<Estudante | null>(null)

    const [contadorHoje, setContadorHoje] =
        useState(0)

    // foco automático
    useEffect(() => {

        inputRef.current?.focus()

        const interval = setInterval(() => {
            inputRef.current?.focus()
        }, 1000)

        return () => clearInterval(interval)

    }, [])

    async function verificarDigital(
        codigoHex: string
    ) {

        try {

            setMensagem('Verificando digital...')
            setStatus('idle')

            const response = await api.post(
                '/verificar-digital/',
                {
                    codigo_hex: codigoHex
                }
            )

            // NÃO CADASTRADO
            if (
                response.data.status ===
                'nao_cadastrado'
            ) {

                setStatus('erro')
                setMensagem(
                    'Digital não cadastrada'
                )

                setEstudante(null)

                return
            }

            if (response.data.status === 'bloqueado') {

                setStatus('erro')

                setMensagem(
                    response.data.motivo
                )

                setEstudante(null)

                return
            }

            // SUCESSO
            if (response.data.status === 'liberado') {

                setContadorHoje(prev => prev + 1)

                setStatus('sucesso')

                setMensagem('LIBERADO')

                setEstudante(
                    response.data.estudante
                )

            }

        } catch (error) {

            console.error(error)

            setStatus('erro')

            setMensagem(
                'Erro ao verificar digital'
            )

            setEstudante(null)

        }
    }

    function handleKeyDown(
        e: React.KeyboardEvent<HTMLInputElement>
    ) {

        if (e.key === 'Enter') {

            e.preventDefault()

            const valor = codigo.trim()

            if (!valor) return

            verificarDigital(valor)

            setCodigo('')
        }
    }

    return (
        <div
            className={`
                min-h-screen
                flex
                flex-col
                items-center
                justify-center
                transition-all
                duration-300
                ${status === 'sucesso'
                    ? 'bg-green-100'
                    : status === 'erro'
                        ? 'bg-red-100'
                        : 'bg-gray-100'
                }
            `}
        >

            {/* INPUT OCULTO */}
            <input
                ref={inputRef}
                type="text"
                value={codigo}
                onChange={(e) =>
                    setCodigo(e.target.value)
                }
                onKeyDown={handleKeyDown}
                className="opacity-0 absolute"
                //className=" border p-4 rounded  bg-white text-black"
                autoFocus
            />

            {/* TÍTULO */}
            <h1
                style={{
                    color: '#000',
                    fontSize: 36,
                    fontWeight: 'bold',
                    marginBottom: 14,
                }}
            >
                Leitor Biométrico
            </h1>

            {/* MENSAGEM */}
            <div
                className={`
                    text-3xl
                    font-bold
                    mb-8
                    ${status === 'sucesso'
                        ? 'text-green-700'
                        : status === 'erro'
                            ? 'text-red-700'
                            : 'text-gray-700'
                    }
                `}
            >
                {mensagem}
            </div>

            {/* ESTUDANTE */}
            {estudante && (

                <div
                    className="
                        bg-white
                        rounded-2xl
                        shadow-xl
                        p-8
                        flex
                        flex-col
                        items-center
                        w-[400px]
                    "
                >

                    {estudante.foto_url ? (

                        <img
                            src={estudante.foto_url}
                            alt={estudante.nome}
                            className="
                                w-48
                                h-48
                                object-cover
                                rounded-full
                                mb-6
                                border-4
                                border-green-500
                            "
                        />

                    ) : (

                        <div
                            className="
                                w-48
                                h-48
                                rounded-full
                                bg-gray-300
                                mb-6
                            "
                        />

                    )}

                    <h2 style={{
                        color: '#000',
                        fontSize: 32,
                        fontWeight: 'bold',
                    }}>
                        {estudante.nome}
                    </h2>



                    <p className="text-xl mt-2">
                        Matrícula:
                        {' '}
                        {estudante.matricula}
                    </p>

                    <p className="text-lg text-gray-600">
                        {estudante.curso}
                    </p>

                    <p className="text-lg text-gray-600">
                        Turma:
                        {' '}
                        {estudante.turma}
                    </p>

                </div>

            )}

            <div
                className="
                    mt-8
                    text-2xl
                    font-bold
                    text-black
                "
            >
                Refeições liberadas hoje:
                {' '}
                {contadorHoje}
            </div>

            {/* TEXTO AUXILIAR */}
            <div
                className="
        mt-10
        flex
        flex-col
        items-center
        gap-4
    "
            >

                {/* TEXTO AUXILIAR */}
                <div className="text-gray-500">
                    Campo biométrico aguardando leitura...
                </div>

                {/* BOTÃO FALLBACK MANUAL */}
                <button
                    onClick={() => {
                        alert(
                            'Fallback manual será implementado na Sprint 7'
                        )
                    }}
                    className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-6
                py-3
                rounded-xl
                text-lg
                font-semibold
                shadow-lg
                transition-all
            "
                >
                    Buscar Aluno
                </button>

            </div>

        </div>
    )
}