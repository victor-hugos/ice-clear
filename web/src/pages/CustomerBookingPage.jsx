import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'
import { serviceOptions } from '../data/services.js'
import { validateBookingForm } from '../lib/bookingData.js'
import { createServiceRequest } from '../lib/serviceRequestData.js'
import { createNotificationEvent } from '../lib/notificationCenterData.js'
import { getPublicTechnicianBySlug } from '../lib/technicianData.js'

const initialForm = {
  customerName: '',
  customerPhone: '',
  serviceName: 'Limpeza',
  preferredDate: '',
  preferredWindow: 'manha',
  addressLine: '',
  neighborhood: '',
  city: '',
  state: '',
  notes: '',
}

const windowOptions = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
]

function CustomerBookingPage() {
  const { slug } = useParams()
  const [technician, setTechnician] = useState(null)
  const [status, setStatus] = useState({ type: 'loading', message: 'Carregando técnico do QR...' })
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submittedRequest, setSubmittedRequest] = useState(null)
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
        setForm((current) => ({
          ...current,
          serviceName: data.services[0] || current.serviceName,
          city: data.city || current.city,
          state: data.state || current.state,
        }))
        setStatus({
          type: 'success',
          message: 'Técnico identificado. Você já pode solicitar o serviço.',
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

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateBookingForm({
      ...form,
      technicianSlug: slug,
    })

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: 'error',
        message: 'Revise os campos obrigatórios antes de enviar o pedido.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { request } = await createServiceRequest({
        ...form,
        technicianSlug: slug,
      })

      await createNotificationEvent({
        type: 'booking_created',
        audience: 'technician',
        technicianSlug: slug,
        title: 'Novo pedido recebido',
        message: `${request.customerName} solicitou ${request.serviceName}.`,
        relatedId: request.id,
      })

      setSubmittedRequest(request)
      setStatus({
        type: 'success',
        message: 'Pedido enviado. O técnico poderá acompanhar pelo painel e retornar pelo canal informado.',
      })
      setForm(initialForm)
      setErrors({})
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Falha ao enviar pedido: ${error.message}`,
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
            <p className="text-sm text-slate-600">Agendar serviço</p>
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
            <SectionLabel>Pedido direto</SectionLabel>
            <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold tracking-[-0.04em] text-slate-950">
              Solicite o serviço sem sair da plataforma.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Esse fluxo atende o cliente que já sabe o que quer. Ele escolhe o serviço,
              informa endereço e janela desejada, e o pedido entra estruturado para o técnico.
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
                  placeholder="Maria Souza"
                />
                {errors.customerName ? <p className="mt-2 text-sm text-rose-600">{errors.customerName}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">WhatsApp</span>
                <input
                  value={form.customerPhone}
                  onChange={(event) => updateField('customerPhone', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="(11) 99888-7777"
                />
                {errors.customerPhone ? <p className="mt-2 text-sm text-rose-600">{errors.customerPhone}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Serviço</span>
                <select
                  value={form.serviceName}
                  onChange={(event) => updateField('serviceName', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                >
                  {(technician?.services?.length ? technician.services : serviceOptions).map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Data desejada</span>
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={(event) => updateField('preferredDate', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                />
                {errors.preferredDate ? <p className="mt-2 text-sm text-rose-600">{errors.preferredDate}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Janela preferida</span>
                <select
                  value={form.preferredWindow}
                  onChange={(event) => updateField('preferredWindow', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                >
                  {windowOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Endereço</span>
                <input
                  value={form.addressLine}
                  onChange={(event) => updateField('addressLine', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="Rua, número e complemento"
                />
                {errors.addressLine ? <p className="mt-2 text-sm text-rose-600">{errors.addressLine}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Bairro</span>
                <input
                  value={form.neighborhood}
                  onChange={(event) => updateField('neighborhood', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="Centro"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Cidade</span>
                <input
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="São Paulo"
                />
                {errors.city ? <p className="mt-2 text-sm text-rose-600">{errors.city}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Estado</span>
                <input
                  value={form.state}
                  onChange={(event) => updateField('state', event.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="SP"
                  maxLength={2}
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Observações</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="Ex.: limpar dois aparelhos, um na sala e outro no quarto."
                />
              </label>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Enviando pedido...' : 'Enviar pedido de serviço'}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.20)]">
              <SectionLabel tone="light">Técnico do pedido</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold">
                {technician?.displayName || 'Carregando técnico'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {technician
                  ? `${technician.city || 'Cidade não definida'}${technician.state ? `, ${technician.state}` : ''}`
                  : 'Assim que o QR for identificado, o pedido fica vinculado ao técnico certo.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(technician?.services?.length ? technician.services : serviceOptions).map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <SectionLabel>Último pedido gerado</SectionLabel>
              {submittedRequest ? (
                <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <strong>Cliente:</strong> {submittedRequest.customerName}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <strong>Serviço:</strong> {submittedRequest.serviceName}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <strong>Data:</strong> {submittedRequest.preferredDate} ({submittedRequest.preferredWindow})
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 break-all">
                    <strong>ID do pedido:</strong> {submittedRequest.id}
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  Depois do envio, o pedido aparece aqui como confirmação rápida.
                </p>
              )}
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default CustomerBookingPage
