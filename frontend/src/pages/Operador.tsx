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


    const [mostrarBusca, setMostrarBusca] =
        useState(false)

    const [busca, setBusca] =
        useState('')

    const [resultadosBusca, setResultadosBusca] =
        useState<Estudante[]>([])

    const [estudanteManual, setEstudanteManual] =
        useState<Estudante | null>(null)

    const [observacao, setObservacao] =
        useState('')

    const [modo, setModo] = useState<'biometria' | 'manual'>('biometria')

    // foco automático
    useEffect(() => {
        if (mostrarBusca || estudanteManual) return

        const interval = setInterval(() => {
            if (
                document.activeElement !== inputRef.current &&
                !mostrarBusca &&
                !estudanteManual
            ) {
                inputRef.current?.focus()
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [mostrarBusca, estudanteManual])

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

    async function buscarAluno(
        termo: string
    ) {

        const texto = termo.trim()

        if (texto.length < 2) {

            setResultadosBusca([])

            return
        }

        try {

            const response = await api.get(
                `/estudantes/busca/?q=${texto}`
            )

            setResultadosBusca(response.data)

        } catch (error) {

            console.error(error)
        }
    }

    async function verificarDigital(codigoHex: string) {
        try {
            setMensagem('Verificando digital...')
            setStatus('idle')

            const response = await api.post('/verificar-digital/', {
                codigo_hex: codigoHex
            })

            if (response.data.status === 'nao_cadastrado') {
                setStatus('erro')
                setMensagem('Digital não cadastrada')
                setEstudante(null)
                return
            }

            if (response.data.status === 'bloqueado') {
                setStatus('erro')
                setMensagem(response.data.motivo)
                setEstudante(null)
                return
            }

            if (response.data.status === 'liberado') {

                setModo('biometria') // 👈 ADD ISSO

                setStatus('sucesso')
                setMensagem('LIBERADO (BIOMETRIA)')

                setContadorHoje(prev => prev + 1)

                setEstudante(response.data.estudante) // mantém isso

                setMostrarBusca(false)
                setEstudanteManual(null)
                setBusca('')
                setResultadosBusca([])
                setObservacao('')

                setTimeout(() => {
                    setEstudante(null)
                    setStatus('idle')
                    setMensagem('Aproxime o dedo no leitor')
                    inputRef.current?.focus()
                }, 2500)
            }

            else {
                console.warn('Resposta inesperada:', response.data)
            }

        } catch (error) {
            setStatus('erro')
            setMensagem('Erro ao verificar digital')
            setEstudante(null)
        }
    }


    async function confirmarLiberacaoManual() {
        if (!estudanteManual) return

        try {
            const response = await api.post('/liberar-manual/', {
                estudante_id: estudanteManual.id,
                observacao,
            })

            const status = response.data.status

            // 🔴 CASO: já almoçou hoje
            if (status === 'ja_almocou_hoje') {
                setStatus('erro')
                setMensagem('ALUNO JÁ ALMOÇOU HOJE')

                resetTela()

                setStatus('erro')
                setMensagem('ALUNO JÁ ALMOÇOU HOJE')
                setTimeout(() => {
                    setStatus('idle')
                    setMensagem('Aproxime o dedo no leitor')
                    inputRef.current?.focus()
                }, 2000)

                return
            }

            // 🟢 CASO: liberado normal
            if (status === 'liberado') {
                setModo('manual')
                setStatus('sucesso')
                setMensagem('LIBERADO (MANUAL)')

                setEstudante(estudanteManual)
                setContadorHoje(prev => prev + 1)

                setMostrarBusca(false)
                setEstudanteManual(null)
                setBusca('')
                setResultadosBusca([])
                setObservacao('')

                setTimeout(() => {
                    setEstudante(null)
                    setStatus('idle')
                    setMensagem('Aproxime o dedo no leitor')
                    inputRef.current?.focus()
                }, 2500)

                return
            }

            // fallback
            setStatus('erro')
            setMensagem('Resposta inesperada')

        } catch (error: any) {
            setStatus('erro')
            setMensagem(
                error.response?.data?.motivo ||
                error.response?.data?.erro ||
                'Erro na liberação manual'
            )
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


                    <h2 style={{ color: '#000', fontSize: 32, fontWeight: 'bold' }}>
                        {estudante.nome}
                    </h2>

                    <div className="text-xl font-bold mt-2">
                        {modo === 'manual'
                            ? 'LIBERAÇÃO MANUAL'
                            : 'LIBERAÇÃO BIOMÉTRICA'
                        }
                    </div>



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


            <button
                onClick={() =>
                    setMostrarBusca(true)
                }
                className="
                    mt-8
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-6
                    py-3
                    rounded-lg
                    font-bold
                "
            >
                Buscar Aluno
            </button>


            {mostrarBusca && (

                <div
                    className="
                        fixed
                        inset-0
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        z-[60]
                    "
                >

                    <div
                        className="
                bg-white
                p-6
                rounded-2xl
                w-[700px]
                max-h-[80vh]
                overflow-y-auto
            "
                    >

                        <h2
                            className="
                                mt-8
                                text-2xl
                                font-bold
                                text-black
                            "
                        >
                            Buscar Aluno
                        </h2>

                        <div className="flex gap-3 mb-4">

                            <input
                                type="text"
                                value={busca}

                                onChange={(e) =>
                                    setBusca(e.target.value)
                                }

                                onKeyDown={(e) => {

                                    if (e.key === 'Enter') {
                                        buscarAluno(busca)
                                    }

                                }}

                                placeholder="Nome ou matrícula"

                                className="
                                    flex-1
                                    border-2
                                    border-gray-400
                                    p-3
                                    rounded-lg
                                    text-black
                                    placeholder:text-gray-500
                                    bg-white
                                "
                            />

                            <button
                                onClick={() =>
                                    buscarAluno(busca)
                                }

                                className="
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    px-6
                                    rounded-lg
                                    font-bold
                                "
                            >
                                Buscar
                            </button>

                        </div>

                        <div className="space-y-3">

                            {busca.length >= 2 &&
                                resultadosBusca.length === 0 && (

                                    <div className="text-center text-gray-600 py-6">
                                        Nenhum aluno encontrado
                                    </div>

                                )}

                            {resultadosBusca.map((aluno) => (

                                <div
                                    key={aluno.id}
                                    className="
                            border
                            rounded-lg
                            p-4
                            flex
                            items-center
                            justify-between
                        "
                                >

                                    <div
                                        className="
                                flex
                                items-center
                                gap-4
                            "
                                    >

                                        {aluno.foto_url ? (

                                            <img
                                                src={aluno.foto_url}
                                                className="
                                        w-16
                                        h-16
                                        rounded-full
                                        object-cover
                                    "
                                            />

                                        ) : (

                                            <div
                                                className="
                                        w-16
                                        h-16
                                        rounded-full
                                        bg-gray-300
                                    "
                                            />

                                        )}

                                        <div>

                                            <div className="flex flex-col">

                                                <span className="text-black font-bold text-lg">
                                                    {aluno.nome}
                                                </span>

                                                <span className="text-gray-800">
                                                    Matrícula: {aluno.matricula}
                                                </span>

                                                <span className="text-gray-700">
                                                    Turma: {aluno.turma}
                                                </span>

                                            </div>
                                        </div>

                                    </div>

                                    <button

                                        onClick={() => {

                                            setMostrarBusca(false)

                                            setEstudanteManual(aluno)

                                        }}

                                        className="
                                bg-green-600
                                text-white
                                px-4
                                py-2
                                rounded-lg
                            "
                                    >
                                        Selecionar
                                    </button>

                                </div>

                            ))}

                        </div>

                        <button
                            onClick={() =>
                                setMostrarBusca(false)
                            }
                            className="
                    mt-6
                    bg-red-600
                    text-white
                    px-4
                    py-2
                    rounded-lg
                "
                        >
                            Fechar
                        </button>

                    </div>

                </div>

            )}




            {/* MODAL CONFIRMAÇÃO MANUAL */}
            {estudanteManual && (

                <div
                    className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-[70]
        "
                >

                    <div
                        className="
                bg-white
                rounded-2xl
                p-8
                w-[500px]
                flex
                flex-col
                items-center
            "
                    >

                        <h2
                            className="
                    text-3xl
                    font-bold
                    text-black
                    mb-6
                "
                        >
                            Confirmar Liberação
                        </h2>

                        {estudanteManual.foto_url ? (

                            <img
                                src={estudanteManual.foto_url}
                                className="
                            w-40
                            h-40
                            rounded-full
                            object-cover
                            mb-6
                        "
                            />

                        ) : (

                            <div
                                className="
                            w-40
                            h-40
                            rounded-full
                            bg-gray-300
                            mb-6
                        "
                            />

                        )}

                        <div className="text-black text-2xl font-bold">
                            {estudanteManual.nome}
                        </div>

                        <div className="text-lg mt-2">
                            Matrícula:
                            {' '}
                            {estudanteManual.matricula}
                        </div>

                        <div className="text-lg">
                            Turma:
                            {' '}
                            {estudanteManual.turma}
                        </div>

                        <textarea
                            value={observacao}
                            onChange={(e) =>
                                setObservacao(e.target.value)
                            }
                            placeholder="Motivo da liberação manual"
                            className="
                        w-full
                        border
                        rounded-lg
                        p-3
                        mt-6
                        text-black
                    "
                        />

                        <div
                            className="
                        flex
                        gap-4
                        mt-6
                    "
                        >

                            <button
                                onClick={
                                    confirmarLiberacaoManual
                                }
                                disabled={!observacao.trim()}
                                className="
                            bg-green-600
                            text-white
                            px-6
                            py-3
                            rounded-lg
                            font-bold
                            disabled:opacity-50
                        "
                            >
                                Confirmar Liberação
                            </button>

                            <button
                                onClick={() => {

                                    setEstudanteManual(null)
                                    setObservacao('')
                                    inputRef.current?.focus()

                                }}
                                className="
                            bg-red-600
                            text-white
                            px-6
                            py-3
                            rounded-lg
                            font-bold
                        "
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </div>

            )}


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


            </div>

        </div>
    )
}