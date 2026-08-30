import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SectionLabel from '../components/SectionLabel.jsx'
import { listNotificationEvents } from '../lib/notificationCenterData.js'

function NotificationCenterPage() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug') || ''
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState({
    type: 'loading',
    message: 'Carregando alertas do técnico...',
  })

  useEffect(() => {
    let active = true

    async function loadEvents() {
      try {
        const nextEvents = await listNotificationEvents({
          audience: 'technician',
          technicianSlug: slug,
        })

        if (!active) {
          return
        }

        setEvents(nextEvents)
        setStatus({
          type: 'success',
          message: 'Alertas carregados da Cloudflare.',
        })
      } catch (error) {
        if (!active) {
          return
        }

        setStatus({
          type: 'error',
          message: `Falha ao carregar alertas: ${error.message}`,
        })
      }
    }

    void loadEvents()

    return () => {
      active = false
    }
  }, [slug])

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:py-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-200">
              Ice Clear
            </p>
            <p className="text-sm text-slate-300">Centro de alertas</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/tecnico/painel${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`}
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Voltar para o painel
            </Link>
          </div>
        </header>

        <main className="rounded-[2rem] border border-white bg-white p-8 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <SectionLabel>Alertas operacionais</SectionLabel>
          <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Tudo que exigiria alerta já aparece aqui.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Aqui ficam os eventos importantes para o técnico acompanhar pedidos, conversas e respostas sem perder retorno de cliente.
          </p>

          <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
            status.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}>
            {status.message}
          </div>

          <div className="mt-8 space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.24em] text-sky-700">
                        {event.type}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                        {event.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{event.message}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      <p>Status: {event.status}</p>
                      <p>{new Date(event.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm leading-7 text-slate-600">
                Ainda não há alertas para este técnico. Gere pedidos, conversas e respostas para alimentar esta timeline.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default NotificationCenterPage
