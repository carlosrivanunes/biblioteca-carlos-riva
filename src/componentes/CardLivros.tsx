import { useEffect, useState } from 'react'

interface CardLivrosProps {
  titulo: string
  autor: string
  categoria: string
  imagem?: string
}

const GRADIENTES = [
  'from-blue-700 to-indigo-900',
  'from-emerald-600 to-teal-900',
  'from-amber-500 to-orange-800',
  'from-rose-600 to-purple-900',
  'from-sky-600 to-slate-900',
]

function gradientePorTitulo(titulo: string) {
  const soma = [...titulo].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GRADIENTES[soma % GRADIENTES.length]
}

const cacheCapas = new Map<string, string | null>()

// Busca a capa no Open Library quando nenhuma imagem é informada
async function buscarCapa(titulo: string, autor: string, sinal: AbortSignal) {
  const chave = `${titulo}|${autor}`
  if (cacheCapas.has(chave)) return cacheCapas.get(chave) ?? null

  const params = new URLSearchParams({ title: titulo, author: autor, limit: '1', fields: 'cover_i' })
  const resposta = await fetch(`https://openlibrary.org/search.json?${params}`, { signal: sinal })
  const dados = await resposta.json()
  const id = dados?.docs?.[0]?.cover_i
  const url = id ? `https://covers.openlibrary.org/b/id/${id}-M.jpg?default=false` : null
  cacheCapas.set(chave, url)
  return url
}

function CardLivros({ titulo, autor, categoria, imagem }: CardLivrosProps) {
  const [falhou, setFalhou] = useState(false)
  const [capaBuscada, setCapaBuscada] = useState<string | null>(null)
  const fonte = imagem ?? capaBuscada
  const mostrarFoto = Boolean(fonte) && !falhou

  useEffect(() => {
    if (imagem) return
    const controle = new AbortController()
    buscarCapa(titulo, autor, controle.signal)
      .then(setCapaBuscada)
      .catch(() => {})
    return () => controle.abort()
  }, [titulo, autor, imagem])

  return (
    <article className="flex gap-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-36 w-24 shrink-0 overflow-hidden rounded-lg shadow-md">
        {mostrarFoto ? (
          <img
            src={fonte ?? undefined}
            alt={`Capa do livro ${titulo}`}
            loading="lazy"
            onError={() => setFalhou(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${gradientePorTitulo(titulo)} p-2 text-center`}
          >
            <span className="text-3xl">📖</span>
            <span className="mt-2 text-[11px] font-bold leading-tight text-white">{titulo}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center">
        <span className="mb-2 w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
          {categoria}
        </span>
        <h3 className="m-0 text-lg font-bold text-slate-900">{titulo}</h3>
        <p className="mt-1 mb-0 text-sm text-slate-500">{autor}</p>
      </div>
    </article>
  )
}

export default CardLivros
