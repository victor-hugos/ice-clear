import { Link } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'

function TechnicianAuthPage() {
  const statusTone = {
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:py-3">
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
            className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Voltar
          </Link>
        </header>

        <main className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <SectionLabel tone="light">Acesso do técnico</SectionLabel>
            <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Acesso simplificado para validar o MVP.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Nesta etapa, o cadastro salva direto na Cloudflare. A autenticação real entra depois, sem outro provedor de banco.
            </p>

            <div className={`mt-8 rounded-2xl border px-4 py-3 text-sm ${statusTone.warning}`}>
              Use o cadastro para montar a página pública e testar a jornada do técnico.
            </div>

            <Link
              to="/tecnico/onboarding"
              className="mt-6 inline-flex rounded-full bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200"
            >
              Ir para o cadastro
            </Link>
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
              className="mt-6 inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Ir para o cadastro
            </Link>
          </section>
        </main>
      </div>
    </div>
  )
}

export default TechnicianAuthPage
