import { Link } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'
import heroImage from '../assets/hero.png'

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

const businessLevers = [
  {
    title: 'Cliente volta no tempo certo',
    description:
      'O QR transforma cada atendimento em uma porta de retorno para limpeza, revisão e manutenção preventiva.',
  },
  {
    title: 'Mais pedidos ficam registrados',
    description:
      'Agendamentos e conversas entram no painel antes de virar WhatsApp solto, reduzindo perda de histórico.',
  },
  {
    title: 'Receita recorrente por relacionamento',
    description:
      'O técnico pode vender planos de manutenção, lembretes e pacotes por temporada em vez de depender só de chamados avulsos.',
  },
]

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f7f4] text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="mb-5 flex flex-col gap-3 border-b border-slate-200/80 bg-[#f5f7f4]/95 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/2.png"
              alt="Ícone da marca Ice Clear"
              className="h-12 w-12 rounded-xl border border-slate-200 bg-white/70 object-cover p-1 shadow-sm"
            />
            <div>
              <img
                src="/1.png"
                alt="Logo Ice Clear"
                className="h-8 w-auto object-contain"
              />
              <p className="text-sm text-slate-600">
                Plataforma de recorrência para técnicos de ar-condicionado
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="#business-model"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Ver modelo
            </a>
            <Link
              to="/tecnico/entrar"
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-900"
            >
              Entrar como técnico
            </Link>
          </div>
        </header>

        <main>
          <section className="relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-lg bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/78 to-slate-950/20" />
            <div className="absolute right-6 top-6 hidden w-44 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:block lg:right-10 lg:top-10">
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                <img
                  src="/2.jpg"
                  alt="Marca Ice Clear em destaque"
                  className="mx-auto h-28 w-28 object-contain"
                />
              </div>
            </div>
            <div className="relative flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col justify-end px-6 py-8 sm:px-10 lg:px-12">
              <SectionLabel tone="light">QR code + agendamento + recorrência</SectionLabel>
              <h1 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-5xl font-semibold leading-none text-white sm:text-7xl">
                Ice Clear
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">
                Plataforma para técnicos de ar-condicionado transformarem cada atendimento em retorno: QR fixo, pedidos organizados, conversa inicial e manutenção periódica.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#customer-flows"
                  className="rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-cyan-200"
                >
                  Ver fluxos do cliente
                </a>
                <Link
                  to="/tecnico/onboarding"
                  className="rounded-lg border border-white bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
                >
                  Simular entrada do técnico
                </Link>
              </div>
              <div className="mt-10 grid gap-3 border-t border-white/20 pt-5 text-sm text-slate-200 sm:grid-cols-3">
                <p>QR fixo no cliente</p>
                <p>Chat antes do orçamento</p>
                <p>Lembretes de manutenção</p>
              </div>
            </div>
          </section>

          <section id="customer-flows" className="grid gap-4 border-b border-slate-200 py-8 md:grid-cols-3">
            {customerActions.map((action, index) => (
              <article
                key={action.title}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <SectionLabel tone={index === 0 ? 'sky' : 'emerald'}>
                  Fluxo {index + 1}
                </SectionLabel>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">{action.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {action.description}
                </p>
              </article>
            ))}
            <article className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <SectionLabel tone="amber">Retenção</SectionLabel>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Recorrência
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Limpeza e revisão periódica viram uma rotina visível para o técnico, não uma lembrança solta no WhatsApp.
              </p>
            </article>
          </section>

          <section
            id="business-model"
            className="grid gap-8 py-8 lg:grid-cols-[0.8fr_1.2fr]"
          >
            <div>
              <SectionLabel>Valor e negócio</SectionLabel>
              <h2 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-3xl font-semibold text-slate-950 sm:text-4xl">
                Fidelização vira rotina, não improviso.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Modelo sugerido: assinatura mensal para o técnico, taxa sobre pedidos pagos e pacotes de automação para lembretes de limpeza, revisão e retorno por temporada.
              </p>
            </div>
            <div className="grid gap-3">
              {businessLevers.map((item) => (
                <article
                  key={item.title}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <section
          id="technician-flow"
          className="border-t border-slate-200 py-8"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <SectionLabel>Jornada do técnico</SectionLabel>
              <h2 className="mt-4 font-['Space_Grotesk',ui-sans-serif,system-ui] text-3xl font-semibold text-slate-950 sm:text-4xl">
                Menos cliente perdido depois do primeiro serviço.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                A experiência foi desenhada para o técnico criar sua página,
                compartilhar o QR e manter pedidos, conversas e retornos em um
                fluxo simples de operação.
              </p>
            </div>

            <div className="grid max-w-3xl gap-4 md:grid-cols-2">
              {technicianSteps.map((step, index) => (
                <article
                  key={step}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-700">
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
