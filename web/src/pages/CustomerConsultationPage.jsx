import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'
import { validateConsultationForm } from '../lib/consultationData.js'
import { createConsultationThread } from '../lib/consultationThreadData.js'
import { createNotificationEvent } from '../lib/notificationCenterData.js'
import { getPublicTechnicianBySlug } from '../lib/technicianData.js'

const attachmentKinds = [
  { value: 'audio', label: 'Áudio' },
  { value: 'image', label: 'Foto' },
]

const initialForm = {
  customerName: '',
  customerPhone: '',
  issueSummary: '',
  preferredReplyChannel: 'whatsapp',
  attachmentKind: 'audio',
  attachmentName: '',
}

function CustomerConsultationPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [technician, setTechnician] = useState(null)
  const [status, setStatus] = useState({ type: 'loading', message: 'Carregando técnico do QR...' })
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [attachments, setAttachments] = useState([])
  const [submittedThread, setSubmittedThread] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    async function loadTechnician() {
      try {
        const data = await getPublicTechnicianBySlug(slug)

        if (!active) {
          return
        }

        if (!data) {
          setStatus({
            type: 'error',
            message:
              'Não encontramos um técnico publicado para este QR. Volte e finalize o cadastro do técnico.',
          })
          return
        }

        setTechnician(data)
        setStatus({
          type: 'success',
          message: 'Técnico identificado. Você já pode iniciar a conversa.',
        })
      } catch (error) {
        if (!active) {
          return
        }

        setStatus({
          type: 'error',
          message: `Falha ao carregar técnico: ${error.message}`,
        })
      }
    }

    void loadTechnician()

    return () => {
      active = false
    }
  }, [slug])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  function addAttachment() {
    if (!form.attachmentName.trim()) {
      return
    }

    setAttachments((current) => [
      ...current,
      {
        kind: form.attachmentKind,
        name: form.attachmentName.trim(),
      },
    ])
    setForm((current) => ({ ...current, attachmentName: '' }))
  }

  function removeAttachment(indexToRemove) {
    setAttachments((current) => current.filter((_, index) => index !== indexToRemove))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateConsultationForm({
      ...form,
      technicianSlug: slug,
      attachments,
    })

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: 'error',
        message: 'Revise os campos obrigatórios antes de enviar a conversa.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { thread } = await createConsultationThread({
        ...form,
        technicianSlug: slug,
        attachments,
      })

      await createNotificationEvent({
        type: 'consultation_created',
        audience: 'technician',
        technicianSlug: slug,
        title: 'Nova conversa consultiva',
        message: `${thread.customerName} iniciou uma conversa sobre o defeito do equipamento.`,
        relatedId: thread.id,
      })

      setSubmittedThread(thread)
      setStatus({
        type: 'success',
        message: 'Conversa iniciada. O técnico poderá responder pelo painel e manter o histórico organizado.',
      })
      setForm(initialForm)
      setAttachments([])
      setErrors({})

      window.setTimeout(() => {
        const tokenQuery = thread.customerAccessToken
          ? `?token=${encodeURIComponent(thread.customerAccessToken)}`
          : ''

        navigate(`/t/${slug}/conversar/${thread.id}${tokenQuery}`)
      }, 600)
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Falha ao iniciar conversa: ${error.message}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusTone = {
    loading: 'border-sky-200 bg-sky-50 text-sky-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7fbff_0%,#eef5f8_40%,#e8eef2_100%)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-3 rounded-3xl border border-white bg-white/90 px-5 py-4 shadow-[0_10px_40px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:py-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-700">
              Ice Clear
            </p>
            <p className="text-sm text-slate-600">Falar com o técnico</p>
          </div>
          <Link
            to={`/t/${slug}`}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Voltar para o QR
          </Link>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-white bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <SectionLabel>Conversa consultiva</SectionLabel>
            <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold tracking-[-0.04em] text-slate-950">
              Explique o defeito antes de agendar.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Esse fluxo cobre o cliente que ainda precisa explicar o problema.
              A descrição, o canal de resposta e os anexos ficam organizados para o técnico avaliar antes de agendar.
            </p>

            <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${statusTone[status.type] || statusTone.loading}`}>
              {status.message}
            </div>

            <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Nome do cliente</span>
                <input
                  value={form.customerName}
                  onChange={(event) => updateField('customerName', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="Carlos Lima"
                />
                {errors.customerName ? <p className="mt-2 text-sm text-rose-600">{errors.customerName}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">WhatsApp</span>
                <input
                  value={form.customerPhone}
                  onChange={(event) => updateField('customerPhone', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="(11) 97777-6666"
                />
                {errors.customerPhone ? <p className="mt-2 text-sm text-rose-600">{errors.customerPhone}</p> : null}
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Descreva o defeito</span>
                <textarea
                  value={form.issueSummary}
                  onChange={(event) => updateField('issueSummary', event.target.value)}
                  className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="Ex.: o aparelho liga, faz barulho, mas não gela."
                />
                {errors.issueSummary ? <p className="mt-2 text-sm text-rose-600">{errors.issueSummary}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Canal de resposta</span>
                <select
                  value={form.preferredReplyChannel}
                  onChange={(event) => updateField('preferredReplyChannel', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="platform">Pela plataforma</option>
                </select>
              </label>

              <div className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Anexo</span>
                <div className="flex gap-2">
                  <select
                    value={form.attachmentKind}
                    onChange={(event) => updateField('attachmentKind', event.target.value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  >
                    {attachmentKinds.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={form.attachmentName}
                    onChange={(event) => updateField('attachmentName', event.target.value)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                    placeholder="nome-do-arquivo.ext"
                  />
                  <button
                    type="button"
                    onClick={addAttachment}
                    className="rounded-full border border-emerald-700 bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {attachments.length > 0 ? (
                    attachments.map((attachment, index) => (
                      <button
                        key={`${attachment.kind}-${attachment.name}-${index}`}
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50"
                      >
                        {attachment.kind}: {attachment.name} ×
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Sem anexos ainda. Adicione áudio ou foto quando quiser orientar melhor o técnico.
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Iniciando conversa...' : 'Iniciar conversa com o técnico'}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.20)]">
              <SectionLabel tone="light">Técnico da conversa</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold">
                {technician?.displayName || 'Carregando técnico'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {technician
                  ? `${technician.city || 'Cidade não definida'}${technician.state ? `, ${technician.state}` : ''}`
                  : 'Assim que o QR for identificado, a conversa fica vinculada ao técnico certo.'}
              </p>
            </section>

            <section className="rounded-[2rem] border border-white bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <SectionLabel>Última conversa iniciada</SectionLabel>
              {submittedThread ? (
                <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <strong>Cliente:</strong> {submittedThread.customerName}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <strong>Resumo:</strong> {submittedThread.issueSummary}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <strong>Anexos:</strong> {submittedThread.attachments.length}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 break-all">
                    <strong>ID da conversa:</strong> {submittedThread.id}
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  Depois do envio, a abertura da conversa aparece aqui como confirmação rápida.
                </p>
              )}
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default CustomerConsultationPage
