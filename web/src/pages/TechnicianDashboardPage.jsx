import { Link, useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import SectionLabel from '../components/SectionLabel.jsx'
import {
  appendLocalTechnicianReply,
  listLocalConsultationThreadsByTechnician,
  updateLocalConsultationStatus,
} from '../lib/consultationThreadData.js'
import {
  listLocalServiceRequestsByTechnician,
  updateLocalServiceRequestStatus,
} from '../lib/serviceRequestData.js'
import {
  buildTechnicianInboxFeed,
  summarizeTechnicianInbox,
} from '../lib/technicianInboxData.js'
import { createLocalNotificationEvent } from '../lib/notificationCenterData.js'

function TechnicianDashboardPage() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug') || ''
  const [refreshToken, setRefreshToken] = useState(0)
  const [actionMessage, setActionMessage] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})

  const serviceRequests = useMemo(() => {
    void refreshToken
    return slug ? listLocalServiceRequestsByTechnician(slug) : []
  }, [refreshToken, slug])

  const consultationThreads = useMemo(() => {
    void refreshToken
    return slug ? listLocalConsultationThreadsByTechnician(slug) : []
  }, [refreshToken, slug])

  const consultationThreadMap = useMemo(
    () => Object.fromEntries(consultationThreads.map((thread) => [thread.id, thread])),
    [consultationThreads],
  )

  const inboxItems = useMemo(
    () =>
      buildTechnicianInboxFeed({
        serviceRequests,
        consultationThreads,
      }),
    [consultationThreads, serviceRequests],
  )

  const summary = useMemo(() => summarizeTechnicianInbox(inboxItems), [inboxItems])

  const status = slug
    ? {
        type: 'success',
        message:
          actionMessage ||
          'Painel carregado a partir do armazenamento local do MVP. O próximo passo é trocar isso por Supabase + notificação.',
      }
    : {
        type: 'error',
        message: 'Informe o slug do técnico na URL para abrir o painel do MVP.',
      }

  function refreshInbox(nextMessage) {
    setRefreshToken((current) => current + 1)
    setActionMessage(nextMessage)
  }

  function handleConfirmBooking(requestId) {
    const updated = updateLocalServiceRequestStatus(requestId, 'confirmed')

    if (updated) {
      createLocalNotificationEvent({
        type: 'booking_confirmed',
        audience: 'technician',
        technicianSlug: slug,
        title: 'Pedido confirmado',
        message: `O pedido de ${updated.customerName} foi confirmado pelo técnico.`,
        relatedId: updated.id,
      })
      refreshInbox(`Pedido de ${updated.customerName} confirmado no MVP.`)
    }
  }

  function handleAnswerConsultation(threadId) {
    const updated = updateLocalConsultationStatus(threadId, 'answered')

    if (updated) {
      createLocalNotificationEvent({
        type: 'consultation_answered',
        audience: 'technician',
        technicianSlug: slug,
        title: 'Conversa marcada como respondida',
        message: `A conversa de ${updated.customerName} foi marcada como respondida.`,
        relatedId: updated.id,
      })
      refreshInbox(`Conversa de ${updated.customerName} marcada como respondida no MVP.`)
    }
  }

  function handleReplyDraftChange(threadId, value) {
    setReplyDrafts((current) => ({
      ...current,
      [threadId]: value,
    }))
  }

  function handleSendReply(threadId) {
    const replyBody = (replyDrafts[threadId] || '').trim()

    if (!replyBody) {
      return
    }

    const updated = appendLocalTechnicianReply(threadId, replyBody)

    if (updated) {
      createLocalNotificationEvent({
        type: 'technician_reply_sent',
        audience: 'technician',
        technicianSlug: slug,
        title: 'Resposta enviada',
        message: `Uma resposta foi enviada para ${updated.customerName}.`,
        relatedId: updated.id,
      })
      setReplyDrafts((current) => ({
        ...current,
        [threadId]: '',
      }))
      refreshInbox(`Resposta enviada para ${updated.customerName} no MVP.`)
    }
  }

  const statusTone = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-200">
              Ice Clear
            </p>
            <p className="text-sm text-slate-300">Painel do técnico</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/tecnico/onboarding"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Voltar para onboarding
            </Link>
            {slug ? (
              <>
                <Link
                  to={`/tecnico/alertas?slug=${encodeURIComponent(slug)}`}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Ver alertas
                </Link>
                <Link
                  to={`/t/${slug}`}
                  className="rounded-full bg-sky-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-200"
                >
                  Abrir página pública
                </Link>
              </>
            ) : null}
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <SectionLabel tone="light">Resumo operacional</SectionLabel>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Total', value: summary.total },
                  { label: 'Pedidos', value: summary.bookings },
                  { label: 'Conversas', value: summary.consultations },
                  { label: 'Pendências', value: summary.pending + summary.open },
                ].map((item) => (
                  <article
                    key={item.label}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.24em] text-sky-200">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white p-8 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
              <SectionLabel>Modo atual</SectionLabel>
              <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${statusTone[status.type]}`}>
                {status.message}
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                <strong>Slug do painel:</strong> {slug || 'não informado'}
              </div>
            </section>
          </aside>

          <section className="rounded-[2rem] border border-white bg-white p-8 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <SectionLabel>Inbox do técnico</SectionLabel>
            <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold tracking-[-0.04em] text-slate-950">
              Pedidos e conversas no mesmo lugar.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Esse é o primeiro painel operacional do MVP. Aqui o técnico já consegue ver o que veio do fluxo direto e do fluxo consultivo, antes de entrarmos em notificação por WhatsApp e persistência total no backend.
            </p>

            <div className="mt-8 space-y-4">
              {inboxItems.length > 0 ? (
                inboxItems.map((item) => {
                  const thread = item.type === 'consultation' ? consultationThreadMap[item.id] : null
                  const latestMessage = thread?.messages?.at(-1) ?? null

                  return (
                    <article
                      key={`${item.type}-${item.id}`}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.24em] text-sky-700">
                            {item.type === 'booking' ? 'Pedido direto' : 'Conversa consultiva'}
                          </p>
                          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                            {item.customerName}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.title}</p>
                        </div>
                        <div className="text-sm text-slate-500">
                          <p>Status: {item.status}</p>
                          <p>{new Date(item.createdAt).toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                        {item.type === 'booking' ? (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                            Data desejada: {item.preferredDate}
                          </span>
                        ) : (
                          <>
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                              Anexos: {item.attachmentCount}
                            </span>
                            {latestMessage ? (
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                                Última mensagem: {latestMessage.sender === 'technician' ? 'técnico' : 'cliente'}
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {item.type === 'booking' ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmBooking(item.id)}
                            disabled={item.status === 'confirmed'}
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {item.status === 'confirmed' ? 'Pedido confirmado' : 'Confirmar pedido'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAnswerConsultation(item.id)}
                            disabled={item.status === 'answered'}
                            className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {item.status === 'answered' ? 'Conversa respondida' : 'Marcar como respondida'}
                          </button>
                        )}
                      </div>
                      {item.type === 'consultation' ? (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-sm font-medium text-slate-700">Resposta rápida do técnico</p>
                          {latestMessage?.sender === 'technician' ? (
                            <p className="mt-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700">
                              {latestMessage.body}
                            </p>
                          ) : null}
                          <div className="mt-3 flex gap-2">
                            <textarea
                              value={replyDrafts[item.id] || ''}
                              onChange={(event) => handleReplyDraftChange(item.id, event.target.value)}
                              className="min-h-24 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400"
                              placeholder="Ex.: Consigo passar amanhã às 10h para revisar o equipamento."
                            />
                            <button
                              type="button"
                              onClick={() => handleSendReply(item.id)}
                              className="self-start rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              Enviar resposta
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  )
                })
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm leading-7 text-slate-600">
                  Ainda não há pedidos nem conversas para este técnico no MVP.
                  Gere um onboarding com slug, abra a página pública e teste os dois fluxos do cliente para popular este painel.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default TechnicianDashboardPage
