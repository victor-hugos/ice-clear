import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'
import { getConsultationThreadByIdAndSlug } from '../lib/consultationThreadData.js'
import { getPublicTechnicianBySlug } from '../lib/technicianData.js'

function CustomerConsultationThreadPage() {
  const { slug, threadId } = useParams()
  const [searchParams] = useSearchParams()
  const accessToken = searchParams.get('token') || ''
  const [status, setStatus] = useState({ type: 'loading', message: 'Carregando conversa...' })
  const [technician, setTechnician] = useState(null)
  const [thread, setThread] = useState(null)

  useEffect(() => {
    let active = true

    async function loadThread() {
      try {
        const technicianData = await getPublicTechnicianBySlug(slug)
        const { thread: threadData } = await getConsultationThreadByIdAndSlug(
          threadId,
          slug,
          accessToken,
        )

        if (!active) {
          return
        }

        setTechnician(technicianData)
        setThread(threadData)

        if (!threadData) {
          setStatus({
            type: 'error',
            message:
              'Conversa não encontrada. Gere a conversa primeiro pelo fluxo de QR ou use o link com token de acesso.',
          })
          return
        }

        setStatus({
          type: 'success',
          message:
            threadData.status === 'answered'
              ? 'O técnico já respondeu. Veja a última mensagem abaixo.'
              : 'A conversa foi aberta e está aguardando resposta do técnico.',
        })
      } catch (error) {
        if (!active) {
          return
        }

        setStatus({
          type: 'error',
          message: `Falha ao carregar a conversa: ${error.message}`,
        })
      }
    }

    void loadThread()

    return () => {
      active = false
    }
  }, [accessToken, slug, threadId])

  const statusTone = {
    loading: 'border-sky-200 bg-sky-50 text-sky-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7fbff_0%,#eef5f8_40%,#e8eef2_100%)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-3 rounded-3xl border border-white bg-white/90 px-5 py-4 shadow-[0_10px_40px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:py-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-700">
              Ice Clear
            </p>
            <p className="text-sm text-slate-600">Acompanhar conversa</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/t/${slug}`}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Voltar para o QR
            </Link>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-white bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <SectionLabel>Histórico do cliente</SectionLabel>
            <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold tracking-[-0.04em] text-slate-950">
              Veja a resposta do técnico no mesmo histórico.
            </h1>
            <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${statusTone[status.type] || statusTone.loading}`}>
              {status.message}
            </div>

            <div className="mt-8 space-y-4">
              {thread?.messages?.length ? (
                thread.messages.map((message) => (
                  <article
                    key={message.id}
                    className={`rounded-[1.5rem] p-5 ${
                      message.sender === 'technician'
                        ? 'border border-sky-200 bg-sky-50'
                        : 'border border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.24em] text-sky-700">
                      {message.sender === 'technician' ? 'Técnico' : 'Cliente'}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{message.body}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      {new Date(message.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm leading-7 text-slate-600">
                  Nenhuma mensagem disponível ainda nesta conversa.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.20)]">
              <SectionLabel tone="light">Resumo da conversa</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold">
                {technician?.displayName || 'Técnico Ice Clear'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Status atual: {thread?.status || 'não encontrado'}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Canal preferido: {thread?.preferredReplyChannel || 'não informado'}
              </p>
            </section>

            <section className="rounded-[2rem] border border-white bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <SectionLabel>Dados do pedido consultivo</SectionLabel>
              {thread ? (
                <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <strong>Cliente:</strong> {thread.customerName}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <strong>WhatsApp:</strong> {thread.customerPhone}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <strong>Anexos:</strong> {thread.attachments.length}
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  Os dados completos aparecem aqui quando a conversa está disponível.
                </p>
              )}
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default CustomerConsultationThreadPage
