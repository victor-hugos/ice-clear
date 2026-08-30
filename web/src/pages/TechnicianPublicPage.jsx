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
              'Ainda não existe um técnico publicado com este link. Finalize o cadastro e salve o perfil.',
          })
          return
        }

        setTechnician(data)
        setStatus({
          type: 'success',
          message: 'Página pronta para receber pedidos e conversas.',
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
  const location = technician
    ? `${technician.city || 'Cidade não definida'}${technician.state ? `, ${technician.state}` : ''}`
    : 'Página pública aberta pelo QR'

  return (
    <div className="min-h-screen bg-[#f5f7f4] px-5 py-5 text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-700">
              Ice Clear
            </p>
            <p className="text-sm text-slate-600">Página pública do QR</p>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Voltar para a home
          </Link>
        </header>

        <main className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionLabel>Técnico do QR</SectionLabel>
            <h1 className="mt-3 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold text-slate-950 sm:text-5xl">
              {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {location}. Escolha o caminho mais adequado para o seu atendimento.
            </p>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {status.message}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                to={`/t/${slug}/agendar`}
                className="rounded-lg bg-slate-950 p-5 text-left text-white shadow-sm transition hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <SectionLabel tone="light">Fluxo 1</SectionLabel>
                <h2 className="mt-3 text-2xl font-semibold">Agendar serviço</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Para limpeza, revisão, retorno programado ou pedido já definido.
                </p>
              </Link>
              <Link
                to={`/t/${slug}/conversar`}
                className="rounded-lg border border-emerald-600 bg-white p-5 text-left text-slate-950 shadow-sm transition hover:border-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <SectionLabel tone="emerald">Fluxo 2</SectionLabel>
                <h2 className="mt-3 text-2xl font-semibold">Falar com o técnico</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Para mandar texto, foto ou áudio e explicar o defeito antes do agendamento.
                </p>
              </Link>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-800 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
              <SectionLabel tone="light">Serviços publicados</SectionLabel>
              <div className="mt-5 flex flex-wrap gap-2">
                {services.length > 0 ? (
                  services.map((service) => (
                    <span
                      key={service}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200"
                    >
                      {service}
                    </span>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-300">
                    Os serviços aparecerão aqui assim que o cadastro for salvo.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionLabel>Link do QR</SectionLabel>
              <p className="mt-4 break-all rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
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
