import { Link } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'

const technicianSteps = [
  'Cria a conta com nome, WhatsApp e cidade.',
  'Seleciona os serviços que oferece e gera o QR fixo.',
  'Cola o adesivo após o atendimento.',
  'Recebe pedidos e conversas pelo painel com alerta no WhatsApp.',
]

const customerActions = [
  {
    title: 'Agendar serviço',
    description:
      'Para limpeza, revisão preventiva ou retorno programado quando o cliente já sabe o que precisa.',
  },
  {
    title: 'Falar com o técnico',
    description:
      'Para enviar descrição, foto ou áudio do defeito antes de virar orçamento ou agendamento.',
  },
]

const foundations = [
  'React + Vite + Tailwind',
  'Supabase para auth, banco, storage e realtime',
  'WhatsApp como notificação, não como chat principal',
  'Pagamento na plataforma para reduzir contorno',
]

function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dcf4ff_0%,#f5fbff_38%,#eef4f7_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="mb-10 flex items-center justify-between rounded-full border border-white/70 bg-white/70 px-5 py-3 shadow-[0_10px_40px_rgba(27,66,88,0.08)] backdrop-blur">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-sky-700">
              Ice Clear
            </p>
            <p className="text-sm text-slate-600">
              MVP para técnicos de ar-condicionado
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="#foundation"
              className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 transition hover:border-sky-300 hover:bg-sky-100"
            >
              Ver base do produto
            </a>
            <Link
              to="/tecnico/entrar"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Entrar como técnico
            </Link>
          </div>
        </header>

        <main className="grid flex-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(19,52,71,0.12)] backdrop-blur lg:p-12">
            <SectionLabel>QR code + agendamento + recorrência</SectionLabel>
            <h1 className="mt-4 max-w-3xl font-['Space_Grotesk',ui-sans-serif,system-ui] text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-6xl">
              O cliente escaneia. O técnico organiza. A manutenção volta.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              O Ice Clear nasce como uma plataforma simples para técnicos de
              ar-condicionado fidelizarem clientes com QR fixo, conversa
              mediada, agendamento direto e manutenção periódica.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#customer-flows"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Ver fluxos do cliente
              </a>
              <Link
                to="/tecnico/onboarding"
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Testar onboarding
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <SectionLabel tone="light">Entrada</SectionLabel>
                <h2 className="mt-3 text-2xl font-semibold">QR fixo</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Sem reimpressão por atendimento no MVP. O QR leva para a
                  página oficial do técnico.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-sky-100 bg-sky-50/90 p-5">
                <SectionLabel>Operação</SectionLabel>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                  Chat interno
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  O cliente descreve o defeito por texto, foto ou áudio e o
                  técnico responde com alerta via WhatsApp.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/90 p-5">
                <SectionLabel tone="emerald">Retenção</SectionLabel>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                  Recorrência
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Limpeza e revisão periódica entram como fluxo nativo do
                  produto, não como improviso.
                </p>
              </article>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <section
              id="customer-flows"
              className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(10,20,30,0.24)]"
            >
              <SectionLabel tone="light">Fluxos do cliente</SectionLabel>
              <div className="mt-6 space-y-4">
                {customerActions.map((action) => (
                  <article
                    key={action.title}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                  >
                    <h2 className="text-xl font-semibold">{action.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {action.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="foundation"
              className="rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(19,52,71,0.12)] backdrop-blur"
            >
              <SectionLabel>Fundação técnica</SectionLabel>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                {foundations.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </main>

        <section
          id="technician-flow"
          className="mt-8 rounded-[2rem] border border-white/80 bg-white/75 p-8 shadow-[0_24px_80px_rgba(19,52,71,0.12)] backdrop-blur lg:p-10"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <SectionLabel>Jornada do técnico</SectionLabel>
              <h2 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                O produto precisa ensinar o uso sozinho.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                O MVP foi desenhado para que o técnico crie a conta, gere o QR
                e opere pedidos sem precisar aprender um sistema pesado.
              </p>
            </div>

            <div className="grid max-w-3xl gap-4 md:grid-cols-2">
              {technicianSteps.map((step, index) => (
                <article
                  key={step}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-sky-700">
                    Passo {index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {step}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LandingPage
