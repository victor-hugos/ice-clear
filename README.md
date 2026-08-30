# Ice Clear MVP

MVP da plataforma `Ice Clear`, focada em tecnicos de ar-condicionado que querem manter clientes, organizar pedidos recorrentes e transformar o QR code em uma entrada simples para novos atendimentos.

O produto valida dois fluxos centrais:

- `Agendar servico`: para o cliente que ja sabe o que precisa.
- `Falar com o tecnico`: para o cliente que precisa explicar o defeito antes de fechar.

Neste estagio, a experiencia principal do MVP esta publicada na Cloudflare. A persistencia real agora usa Cloudflare D1 como banco do projeto.

## O que este projeto demonstra

- Modelagem de MVP SaaS a partir de uma dor operacional real.
- Fluxo tecnico/cliente com pagina publica por `slug` e QR code.
- Agendamento direto e fluxo consultivo com conversa.
- Inbox do tecnico para acompanhar pedidos e threads.
- Centro de alertas/eventos do tecnico salvo no Cloudflare D1.
- Persistencia principal em Cloudflare D1.
- Deploy atual em Cloudflare Workers com Static Assets.
- Documentacao de produto por fluxo, nao apenas por tecnologia.

## Stack

- Frontend: `React`, `Vite`, `Tailwind CSS`.
- Dados: `Cloudflare D1`.
- Auth: fluxo simplificado do MVP, com autenticacao real a definir.
- Deploy: `Cloudflare Workers` com Static Assets.
- Testes: testes de regras/dados no workspace `web/tests`.
- Documentacao: fluxos em `docs/`.

## Estado atual

Implementado:

- onboarding inicial do tecnico;
- pagina publica por `slug` para o QR;
- fluxo direto de agendamento;
- fluxo consultivo com abertura de conversa;
- inbox do tecnico com pedidos e conversas;
- resposta do tecnico dentro da thread consultiva;
- visao do cliente para acompanhar a resposta;
- centro de alertas/eventos salvo no Cloudflare D1;
- code-splitting no frontend para evitar bundle grande no build.

Ainda local/mockado ou pendente:

- notificacoes reais via WhatsApp;
- autenticacao real na stack Cloudflare;
- validacao ponta a ponta completa em ambiente publicado.

## Estrutura

```txt
ice-clear-mvp/
|-- docs/       # Fluxos de produto e setup operacional
|-- cloudflare/ # Configuracoes e referencias de dados para Cloudflare
`-- web/        # Aplicacao React/Vite
```

## Fluxos principais

### Cliente

1. Escaneia o QR ou acessa a pagina publica do tecnico.
2. Escolhe `Agendar servico` ou `Falar com o tecnico`.
3. Envia pedido, dados de contato e contexto do problema.
4. Acompanha a resposta do tecnico pela thread consultiva.

### Tecnico

1. Faz onboarding e cria perfil publico.
2. Compartilha QR ou link por `slug`.
3. Recebe pedidos e conversas no dashboard.
4. Responde, organiza atendimento e prepara recorrencia futura.

## Documentacao util

- `docs/mvp-foundation.md`
- `docs/direct-booking.md`
- `docs/consultation-flow.md`
- `docs/customer-consultation-thread.md`
- `docs/technician-dashboard.md`
- `docs/notification-center.md`
- `docs/cloudflare-setup.md`

## Desenvolvimento local

Entre na aplicacao web:

```bash
cd web
npm install
npm run dev
```

Para build:

```bash
cd web
npm run build
```

## Fluxo de evolucao aprovado

1. Fechar o MVP local.
2. Publicar o estado tecnico no Git.
3. Validar auth, pedidos e conversas com dados reais.
5. Manter o deploy na `Cloudflare`.
6. Adicionar notificacoes reais via WhatsApp.

## Observacao

As decisoes permanentes de produto e arquitetura seguem como proposta operacional ate aprovacao final. O objetivo atual e manter o projeto apresentavel como vitrine tecnica de MVP SaaS, sem fingir que a operacao em producao ja esta homologada.
