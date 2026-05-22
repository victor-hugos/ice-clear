import { useState } from 'react'
import { Link } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'
import { hasSupabaseEnv, supabase } from '../lib/supabase.js'

function TechnicianAuthPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  async function handleMagicLink(event) {
    event.preventDefault()

    if (!hasSupabaseEnv || !supabase) {
      setStatus({
        type: 'warning',
        message:
          'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar o envio do magic link.',
      })
      return
    }

    setStatus({ type: 'loading', message: 'Enviando link de acesso...' })

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/tecnico/onboarding',
      },
    })

    if (error) {
      setStatus({ type: 'error', message: error.message })
      return
    }

    setStatus({
      type: 'success',
      message:
        'Link enviado. Abra o email do técnico e continue o onboarding no mesmo navegador.',
    })
  }

  const statusTone = {
    idle: 'border-slate-200 bg-slate-50 text-slate-600',
    loading: 'border-sky-200 bg-sky-50 text-sky-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-sky-200">
              Ice Clear
            </p>
            <p className="text-sm text-slate-300">
              Entrada do técnico
            </p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Voltar
          </Link>
        </header>

        <main className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <SectionLabel tone="light">Acesso do técnico</SectionLabel>
            <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Entrar sem senha, do jeito mais simples.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              O técnico entra por magic link e cai direto no onboarding. Isso
              mantém o acesso leve e reduz atrito logo no começo do MVP.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleMagicLink}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Email do técnico
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tecnico@iceclear.app"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                  required
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200"
              >
                Enviar link de acesso
              </button>
            </form>

            <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${statusTone[status.type]}`}>
              {status.message ||
                'Se o Supabase ainda não estiver configurado, esta tela continua útil como fluxo-base de acesso.'}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white p-8 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <SectionLabel>Próximas ações após login</SectionLabel>
            <div className="mt-6 space-y-4">
              {[
                'Cadastrar nome, WhatsApp e cidade.',
                'Selecionar serviços oferecidos.',
                'Definir slug público do QR.',
                'Salvar o perfil e gerar a primeira página pública.',
              ].map((item, index) => (
                <article key={item} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-sky-700">
                    Etapa {index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{item}</p>
                </article>
              ))}
            </div>
            <Link
              to="/tecnico/onboarding"
              className="mt-6 inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Ir para o onboarding do MVP
            </Link>
          </section>
        </main>
      </div>
    </div>
  )
}

export default TechnicianAuthPage
