import { Link, useSearchParams } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'
import { listLocalNotificationEvents } from '../lib/notificationCenterData.js'

function NotificationCenterPage() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug') || ''
  const events = listLocalNotificationEvents({ audience: 'technician', technicianSlug: slug })

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-200">
              Ice Clear
            </p>
            <p className="text-sm text-slate-300">Centro de alertas</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/tecnico/painel${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Voltar para o painel
            </Link>
          </div>
        </header>

        <main className="rounded-[2rem] border border-white bg-white p-8 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <SectionLabel>Eventos do MVP</SectionLabel>
          <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Tudo que exigiria alerta já aparece aqui.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Esta camada ainda é local, mas já representa os eventos que depois vão alimentar WhatsApp, push ou email.
          </p>

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
                Ainda não há alertas locais para este técnico. Gere pedidos, conversas e respostas para alimentar esta timeline.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default NotificationCenterPage
