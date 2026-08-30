import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import SectionLabel from '../components/SectionLabel.jsx'
import {
  appendTechnicianReply,
  listConsultationThreadsByTechnician,
  updateConsultationStatus,
} from '../lib/consultationThreadData.js'
import {
  listServiceRequestsByTechnician,
  updateServiceRequestStatus,
} from '../lib/serviceRequestData.js'
import {
  buildTechnicianInboxFeed,
  summarizeTechnicianInbox,
} from '../lib/technicianInboxData.js'
import { createNotificationEvent } from '../lib/notificationCenterData.js'

function TechnicianDashboardPage() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug') || ''
  const [refreshToken, setRefreshToken] = useState(0)
  const [actionMessage, setActionMessage] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const [serviceRequests, setServiceRequests] = useState([])
  const [consultationThreads, setConsultationThreads] = useState([])
  const [loadingState, setLoadingState] = useState('idle')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true

    async function loadInbox() {
      if (!slug) {
        setServiceRequests([])
        setConsultationThreads([])
        setLoadError('')
        setLoadingState('idle')
        return
      }

      setLoadingState('loading')
      setLoadError('')

      try {
        const [requestResult, threadResult] = await Promise.all([
          listServiceRequestsByTechnician(slug),
          listConsultationThreadsByTechnician(slug),
        ])

        if (!active) {
          return
        }

        setServiceRequests(requestResult.requests)
        setConsultationThreads(threadResult.threads)
        setLoadingState('loaded')
      } catch (error) {
        if (!active) {
          return
        }

        setLoadError(error.message)
        setLoadingState('error')
      }
    }

    void loadInbox()

    return () => {
      active = false
    }
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

  const status = !slug
    ? {
        type: 'error',
        message: 'Informe o slug do técnico na URL para abrir o painel.',
      }
    : loadError
      ? {
          type: 'error',
          message: `Falha ao carregar o painel: ${loadError}`,
        }
      : {
          type: 'success',
          message:
            actionMessage ||
            'Painel atualizado. Pedidos e conversas aparecem aqui quando chegam pelo QR.',
        }

  function refreshInbox(nextMessage) {
    setRefreshToken((current) => current + 1)
    setActionMessage(nextMessage)
  }

  async function handleConfirmBooking(requestId) {
    try {
      const { request: updated } = await updateServiceRequestStatus(requestId, 'confirmed')

      if (updated) {
        await createNotificationEvent({
          type: 'booking_confirmed',
          audience: 'technician',
          technicianSlug: slug,
          title: 'Pedido confirmado',
          message: `O pedido de ${updated.customerName} foi confirmado pelo técnico.`,
          relatedId: updated.id,
        })
        refreshInbox(`Pedido de ${updated.customerName} confirmado.`)
      }
    } catch (error) {
      setActionMessage(`Falha ao confirmar pedido: ${error.message}`)
    }
  }

  async function handleAnswerConsultation(threadId) {
    try {
      const { thread: updated } = await updateConsultationStatus(threadId, 'answered')

      if (updated) {
        await createNotificationEvent({
          type: 'consultation_answered',
          audience: 'technician',
          technicianSlug: slug,
          title: 'Conversa marcada como respondida',
          message: `A conversa de ${updated.customerName} foi marcada como respondida.`,
          relatedId: updated.id,
        })
        refreshInbox(`Conversa de ${updated.customerName} marcada como respondida.`)
      }
    } catch (error) {
      setActionMessage(`Falha ao atualizar conversa: ${error.message}`)
    }
  }

  function handleReplyDraftChange(threadId, value) {
    setReplyDrafts((current) => ({
      ...current,
      [threadId]: value,
    }))
  }

  async function handleSendReply(threadId) {
    const replyBody = (replyDrafts[threadId] || '').trim()

    if (!replyBody) {
      return
    }

    try {
      const { thread: updated } = await appendTechnicianReply(threadId, replyBody)

      if (updated) {
        await createNotificationEvent({
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
        refreshInbox(`Resposta enviada para ${updated.customerName}.`)
      }
    } catch (error) {
      setActionMessage(`Falha ao enviar resposta: ${error.message}`)
    }
  }

  const statusTone = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:py-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-200">
              Ice Clear
            </p>
            <p className="text-sm text-slate-300">Painel do técnico</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/tecnico/onboarding"
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Voltar para cadastro
            </Link>
            {slug ? (
              <>
                <Link
                  to={`/tecnico/alertas?slug=${encodeURIComponent(slug)}`}
                  className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ver alertas
                </Link>
                <Link
                  to={`/t/${slug}`}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
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
              Aqui o técnico acompanha pedidos diretos e conversas consultivas no mesmo lugar, com contexto suficiente para responder rápido e manter o cliente ativo.
            </p>

            <div className="mt-8 space-y-4">
              {loadingState === 'loading' ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm leading-7 text-slate-600">
                  Carregando pedidos e conversas do técnico...
                </div>
              ) : inboxItems.length > 0 ? (
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
                            onClick={() => void handleConfirmBooking(item.id)}
                            disabled={item.status === 'confirmed'}
                            className="rounded-full border border-emerald-700 bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {item.status === 'confirmed' ? 'Pedido confirmado' : 'Confirmar pedido'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleAnswerConsultation(item.id)}
                            disabled={item.status === 'answered'}
                            className="rounded-full border border-cyan-700 bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                              onClick={() => void handleSendReply(item.id)}
                              className="self-start rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
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
                  Ainda não há pedidos nem conversas para este técnico.
                  Cadastre o técnico, abra a página pública do QR e teste os dois fluxos do cliente para popular este painel.
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
