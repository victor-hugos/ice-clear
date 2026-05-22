import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'
import { getPublicTechnicianBySlug } from '../lib/technicianData.js'

function TechnicianPublicPage() {
  const { slug } = useParams()
  const [status, setStatus] = useState({ type: 'loading', message: 'Carregando página pública...' })
  const [technician, setTechnician] = useState(null)

  useEffect(() => {
    let active = true

    async function loadPublicProfile() {
      try {
        const data = await getPublicTechnicianBySlug(slug)

        if (!active) {
          return
        }

        if (!data) {
          setTechnician(null)
          setStatus({
            type: 'empty',
            message:
              'Ainda não existe um técnico publicado com este slug. Finalize o onboarding e salve o perfil.',
          })
          return
        }

        setTechnician(data)
        setStatus({
          type: 'success',
          message:
            data.mode === 'supabase'
              ? 'Página carregada a partir do Supabase.'
              : 'Página carregada a partir do fallback local do MVP.',
        })
      } catch (error) {
        if (!active) {
          return
        }

        setTechnician(null)
        setStatus({
          type: 'error',
          message: `Falha ao carregar página pública: ${error.message}`,
        })
      }
    }

    void loadPublicProfile()

    return () => {
      active = false
    }
  }, [slug])

  const displayName = technician?.displayName || 'Técnico Ice Clear'
  const services = technician?.services ?? []

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7fbff_0%,#eef5f8_40%,#e8eef2_100%)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between rounded-full border border-white bg-white/90 px-5 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-700">
              Ice Clear
            </p>
            <p className="text-sm text-slate-600">Página pública do QR</p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            Voltar para a home
          </Link>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[2rem] border border-white bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <SectionLabel>Técnico do QR</SectionLabel>
            <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              {displayName}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {technician
                ? `${technician.city || 'Cidade não definida'}${technician.state ? `, ${technician.state}` : ''}. O foco continua sendo dar dois caminhos claros: agendar direto ou falar com o técnico.`
                : 'Esta é a primeira forma da página que o cliente abre ao escanear o QR. O foco é sempre dar dois caminhos claros: agendar direto ou falar com o técnico.'}
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {status.message}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                to={`/t/${slug}/agendar`}
                className="rounded-[1.75rem] bg-slate-950 p-6 text-left text-white transition hover:bg-slate-800"
              >
                <SectionLabel tone="light">Fluxo 1</SectionLabel>
                <h2 className="mt-3 text-2xl font-semibold">Agendar serviço</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Para limpeza, revisão, retorno programado ou pedido já definido.
                </p>
              </Link>
              <Link
                to={`/t/${slug}/conversar`}
                className="rounded-[1.75rem] border border-slate-200 bg-sky-50 p-6 text-left text-slate-900 transition hover:border-sky-200 hover:bg-sky-100"
              >
                <SectionLabel>Fluxo 2</SectionLabel>
                <h2 className="mt-3 text-2xl font-semibold">Falar com o técnico</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Para mandar texto, foto ou áudio e explicar o defeito antes do agendamento.
                </p>
              </Link>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.20)]">
              <SectionLabel tone="light">Serviços publicados</SectionLabel>
              <div className="mt-5 flex flex-wrap gap-2">
                {services.length > 0 ? (
                  services.map((service) => (
                    <span
                      key={service}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200"
                    >
                      {service}
                    </span>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-300">
                    Os serviços aparecerão aqui assim que o onboarding for salvo.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <SectionLabel>Rota atual do MVP</SectionLabel>
              <p className="mt-4 break-all rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                /t/{slug || 'seu-slug'}
              </p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default TechnicianPublicPage
