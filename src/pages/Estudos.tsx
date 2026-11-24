import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Modo = 'foco' | 'curta' | 'longa';

const MODOS: Record<Modo, { rotulo: string; minutos: number; cor: string; fundo: string }> = {
  foco: { rotulo: 'Foco', minutos: 25, cor: '#2563EB', fundo: 'bg-blue-600 hover:bg-blue-700' },
  curta: { rotulo: 'Pausa curta', minutos: 5, cor: '#059669', fundo: 'bg-emerald-600 hover:bg-emerald-700' },
  longa: { rotulo: 'Pausa longa', minutos: 15, cor: '#D97706', fundo: 'bg-amber-600 hover:bg-amber-700' },
};

const RAIO = 120;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

export default function Estudos() {
  const [modo, setModo] = useState<Modo>('foco');
  const [segundos, setSegundos] = useState(MODOS.foco.minutos * 60);
  const [ativo, setAtivo] = useState(false);
  const [ciclos, setCiclos] = useState(0);

  const total = MODOS[modo].minutos * 60;
  const { cor, fundo } = MODOS[modo];

  useEffect(() => {
    if (!ativo) return;

    if (segundos === 0) {
      setAtivo(false);
      if (modo === 'foco') setCiclos((c) => c + 1);
      return;
    }

    const intervalo = setInterval(() => {
      setSegundos((atual) => atual - 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [ativo, segundos, modo]);

  const minutos = Math.floor(segundos / 60);
  const segsRestantes = segundos % 60;
  const tempo = `${String(minutos).padStart(2, '0')}:${String(segsRestantes).padStart(2, '0')}`;
  const progresso = total === 0 ? 0 : (total - segundos) / total;

  useEffect(() => {
    document.title = ativo ? `${tempo} · ${MODOS[modo].rotulo}` : 'Cantinho de Estudos';
  }, [tempo, ativo, modo]);

  function trocarModo(novo: Modo) {
    setModo(novo);
    setAtivo(false);
    setSegundos(MODOS[novo].minutos * 60);
  }

  function resetar() {
    setAtivo(false);
    setSegundos(total);
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-slate-900 px-6 py-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-extrabold tracking-tight m-0">Cantinho de Estudos</h1>
            <p className="text-slate-400 text-sm mt-1 m-0">Timer Pomodoro para manter o foco</p>
          </div>
          <Link to="/" className="text-slate-300 text-sm font-semibold no-underline hover:text-white">
            ← Início
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-slate-200 p-8 text-center">
          {/* Seletor de modo */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8">
            {(Object.keys(MODOS) as Modo[]).map((m) => (
              <button
                key={m}
                onClick={() => trocarModo(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer border-0 ${
                  modo === m ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {MODOS[m].rotulo}
              </button>
            ))}
          </div>

          {/* Relógio circular */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <svg viewBox="0 0 280 280" className="w-full h-full -rotate-90">
              <circle cx="140" cy="140" r={RAIO} fill="none" stroke="#E2E8F0" strokeWidth="12" />
              <circle
                cx="140"
                cy="140"
                r={RAIO}
                fill="none"
                stroke={cor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={CIRCUNFERENCIA}
                strokeDashoffset={CIRCUNFERENCIA * (1 - progresso)}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-extrabold text-slate-900 tabular-nums tracking-tight">{tempo}</span>
              <span className="text-sm text-slate-500 mt-1">
                {segundos === 0 ? 'Tempo esgotado!' : ativo ? MODOS[modo].rotulo : 'Pausado'}
              </span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setAtivo((a) => !a)}
              disabled={segundos === 0}
              className={`${fundo} text-white font-semibold py-3 px-8 rounded-xl shadow transition-colors cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {ativo ? 'Pausar' : segundos === total ? 'Iniciar' : 'Continuar'}
            </button>
            <button
              onClick={resetar}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors cursor-pointer border-0"
            >
              Resetar
            </button>
          </div>

          {/* Ciclos concluídos */}
          <p className="text-sm text-slate-500 mt-8 mb-0">
            Ciclos de foco concluídos: <strong className="text-slate-800">{ciclos}</strong>
          </p>
        </div>
      </section>
    </main>
  );
}
