// src/pages/Operador.tsx

import { useEffect, useRef, useState } from 'react'
import api from '../services/api'

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

            // SUCESSO
            if (response.data.status === 'ok') {

                setStatus('sucesso')

                setMensagem('ALUNO RECONHECIDO')

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

            {/* TEXTO AUXILIAR */}
            <div className="mt-10 text-gray-500">
                Campo biométrico aguardando leitura...
            </div>

        </div>
    )
}