import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'
import { serviceOptions } from '../data/services.js'
import {
  getCurrentTechnicianSession,
  loadTechnicianOnboardingData,
  saveTechnicianOnboardingData,
} from '../lib/technicianData.js'

const onboardingStorageKey = 'ice-clear-technician-onboarding-draft'

const initialForm = {
  fullName: '',
  businessName: '',
  whatsapp: '',
  city: '',
  state: '',
  slug: '',
  serviceRadiusKm: '15',
  services: ['Limpeza', 'Revisão preventiva'],
}

function readStoredDraft() {
  if (typeof window === 'undefined') {
    return { form: initialForm, savedAt: '', source: 'local' }
  }

  const stored = window.localStorage.getItem(onboardingStorageKey)

  if (!stored) {
    return { form: initialForm, savedAt: '', source: 'local' }
  }

  try {
    const parsed = JSON.parse(stored)

    return {
      form: { ...initialForm, ...parsed.form },
      savedAt: parsed.savedAt ?? '',
      source: parsed.source ?? 'local',
    }
  } catch {
    window.localStorage.removeItem(onboardingStorageKey)
    return { form: initialForm, savedAt: '', source: 'local' }
  }
}

function TechnicianOnboardingPage() {
  const [draft, setDraft] = useState(readStoredDraft)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [sessionMode, setSessionMode] = useState('checking')
  const form = draft.form
  const savedAt = draft.savedAt

  useEffect(() => {
    let active = true

    async function hydrateFromCloudflare() {
      try {
        const session = await getCurrentTechnicianSession()

        if (!active) {
          return
        }

        setSessionMode(session.mode)

        const onboarding = await loadTechnicianOnboardingData()

        if (!active || !onboarding.form) {
          return
        }

        setDraft((current) => ({
          ...current,
          form: { ...current.form, ...onboarding.form },
          source: onboarding.mode,
        }))

        setStatus({
          type: 'success',
          message:
            onboarding.mode === 'cloudflare'
              ? 'Cloudflare pronta para salvar o perfil.'
              : 'Rascunho carregado neste navegador. Você pode continuar editando.',
        })
      } catch (error) {
        if (!active) {
          return
        }

        setSessionMode('local')
        setStatus({
          type: 'error',
          message: `Não foi possível carregar o cadastro salvo: ${error.message}`,
        })
      }
    }

    void hydrateFromCloudflare()

    return () => {
      active = false
    }
  }, [])

  function updateField(field, value) {
    setDraft((current) => ({
      ...current,
      form: { ...current.form, [field]: value },
    }))
  }

  function toggleService(service) {
    setDraft((current) => {
      const alreadySelected = current.form.services.includes(service)

      return {
        ...current,
        form: {
          ...current.form,
          services: alreadySelected
            ? current.form.services.filter((item) => item !== service)
            : [...current.form.services, service],
        },
      }
    })
  }

  function saveDraftLocally(source = 'local') {
    const savedAtValue = new Date().toLocaleString('pt-BR')
    const nextDraft = {
      form,
      savedAt: savedAtValue,
      source,
    }

    window.localStorage.setItem(onboardingStorageKey, JSON.stringify(nextDraft))
    setDraft(nextDraft)

    return savedAtValue
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const savedAtValue = saveDraftLocally(draft.source)
    setStatus({ type: 'loading', message: 'Salvando cadastro...' })

    try {
      const result = await saveTechnicianOnboardingData(form)
      window.localStorage.setItem(
        onboardingStorageKey,
        JSON.stringify({
          form,
          savedAt: savedAtValue,
          source: result.mode,
        }),
      )

      setDraft((current) => ({
        ...current,
        savedAt: savedAtValue,
        source: result.mode,
      }))

      setStatus({
        type: 'success',
        message: `Perfil salvo. Página pública pronta em ${result.publicPath}.`,
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Falha ao salvar o cadastro: ${error.message}`,
      })
    }
  }

  const publicLink = form.slug ? `/t/${form.slug}` : '/t/seu-slug'
  const dashboardLink = form.slug ? `/tecnico/painel?slug=${encodeURIComponent(form.slug)}` : '/tecnico/painel'
  const statusTone = {
    idle: 'border-slate-200 bg-slate-50 text-slate-600',
    loading: 'border-sky-200 bg-sky-50 text-sky-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-3 rounded-3xl border border-white bg-white/90 px-5 py-4 shadow-[0_10px_40px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:py-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-700">
              Ice Clear
            </p>
            <p className="text-sm text-slate-600">Cadastro do técnico</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/tecnico/entrar"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Voltar
            </Link>
            <Link
              to={publicLink}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Ver página pública
            </Link>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <SectionLabel>Perfil básico</SectionLabel>
            <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold tracking-[-0.04em] text-slate-950">
              O técnico precisa preencher só o necessário para começar.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Cadastre as informações essenciais para criar a página pública do QR: nome, região, WhatsApp e serviços oferecidos.
            </p>

            <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${statusTone[status.type] || statusTone.idle}`}>
              {status.message ||
                (sessionMode === `checking` ? `Verificando acesso...` : `Cadastro pronto para edição.`)}
            </div>

            <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Nome completo
                </span>
                <input
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="João Carlos"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Nome da empresa
                </span>
                <input
                  value={form.businessName}
                  onChange={(event) => updateField('businessName', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="João Climatização"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  WhatsApp
                </span>
                <input
                  value={form.whatsapp}
                  onChange={(event) => updateField('whatsapp', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="(11) 99999-9999"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Cidade
                </span>
                <input
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="São Paulo"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Estado
                </span>
                <input
                  value={form.state}
                  onChange={(event) => updateField('state', event.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="SP"
                  maxLength={2}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Slug público do QR
                </span>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    updateField(
                      'slug',
                      event.target.value
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9-]/g, '-')
                        .replace(/-{2,}/g, '-')
                        .replace(/^-|-$/g, ''),
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                  placeholder="joao-climatizacao"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Raio de atendimento inicial (km)
                </span>
                <input
                  type="number"
                  min="1"
                  value={form.serviceRadiusKm}
                  onChange={(event) => updateField('serviceRadiusKm', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                />
              </label>

              <div className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Serviços oferecidos
                </span>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {serviceOptions.map((service) => {
                    const selected = form.services.includes(service)

                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleService(service)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          selected
                            ? 'border-sky-300 bg-sky-50 text-sky-900'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {service}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Salvar cadastro
                </button>
                <Link
                  to={publicLink}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Pré-visualizar página pública
                </Link>
                <Link
                  to={dashboardLink}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Abrir painel do técnico
                </Link>
                <p className="text-sm text-slate-500">
                  {savedAt ? `Rascunho salvo em ${savedAt}` : 'Ainda não salvo neste navegador.'}
                </p>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-sky-100 bg-sky-50 p-8">
              <SectionLabel>Preview do QR</SectionLabel>
              <div className="mt-6 rounded-[1.75rem] border border-sky-100 bg-white p-6 shadow-[0_20px_60px_rgba(14,116,144,0.10)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">
                      {form.businessName || form.fullName || 'Seu técnico'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {form.city || 'Cidade'}{form.state ? `, ${form.state}` : ''}
                    </p>
                  </div>
                  <div className="grid h-20 w-20 place-items-center rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                    QR
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {form.services.length > 0 ? (
                    form.services.map((service) => (
                      <span
                        key={service}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        {service}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">
                      Selecione pelo menos um serviço.
                    </span>
                  )}
                </div>
                <div className="mt-6 rounded-2xl bg-slate-950 px-4 py-4 text-sm text-slate-200">
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-sky-200">
                    Link público do QR
                  </p>
                  <p className="mt-2 break-all text-slate-300">
                    iceclear.app{publicLink}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <SectionLabel>Como usar</SectionLabel>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  Salve o cadastro para gerar a página pública do QR.
                </li>
                <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  Use a prévia para conferir como o cliente verá os serviços.
                </li>
                <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  Abra o painel para acompanhar pedidos e conversas do técnico.
                </li>
              </ul>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default TechnicianOnboardingPage
