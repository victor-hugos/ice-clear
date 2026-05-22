# Ice Clear MVP

MVP local da plataforma `Ice Clear`, focada em tecnicos de ar-condicionado.

O produto foi estruturado para validar dois fluxos centrais:
- `Agendar servico`
- `Falar com o tecnico`

Neste estagio, a experiencia principal do MVP ja esta montada localmente e a conexao real com `Supabase` foi adiada de proposito para reduzir retrabalho antes da publicacao inicial no Git.

## Stack

- `React`
- `Vite`
- `Tailwind CSS`
- `Supabase` preparado, mas ainda nao acoplado ponta a ponta
- `Vercel` como destino futuro de deploy

## Estado atual

Implementado:
- onboarding inicial do tecnico
- pagina publica por `slug` para o QR
- fluxo direto de agendamento
- fluxo consultivo com abertura de conversa
- inbox do tecnico com pedidos e conversas
- resposta do tecnico dentro da thread consultiva
- visao do cliente para acompanhar a resposta
- centro local de alertas/eventos
- code-splitting no frontend para evitar bundle grande no build

Ainda local/mockado:
- persistencia operacional principal de pedidos e conversas
- notificacoes reais via WhatsApp
- autenticacao e banco reais do `Supabase`
- deploy em `Vercel`

## Estrutura

- `web/`: frontend do MVP
- `docs/`: notas operacionais e fluxo do produto
- `supabase/`: migrations e preparacao da camada futura de dados

## Fluxo de evolucao aprovado

1. fechar o MVP local
2. publicar no Git
3. conectar no `Supabase`
4. conectar no `Vercel`

## Desenvolvimento local

Entrar na aplicacao web:

```bash
cd web
npm install
npm run dev
```

## Documentacao util

- `docs/mvp-foundation.md`
- `docs/direct-booking.md`
- `docs/consultation-flow.md`
- `docs/customer-consultation-thread.md`
- `docs/technician-dashboard.md`
- `docs/notification-center.md`
- `docs/supabase-setup.md`

## Observacao

As decisoes permanentes de produto e arquitetura seguem como proposta operacional ate aprovacao final.
