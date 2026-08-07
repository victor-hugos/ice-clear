# Ice Clear MVP

MVP da plataforma `Ice Clear`, focada em tecnicos de ar-condicionado que querem manter clientes, organizar pedidos recorrentes e transformar o QR code em uma entrada simples para novos atendimentos.

O produto valida dois fluxos centrais:

- `Agendar servico`: para o cliente que ja sabe o que precisa.
- `Falar com o tecnico`: para o cliente que precisa explicar o defeito antes de fechar.

Neste estagio, a experiencia principal do MVP ja esta montada localmente. A conexao com `Supabase` esta preparada e parcialmente acoplada aos fluxos operacionais, com aplicacao da migration real e validacao em ambiente publicado ainda pendentes.

## O que este projeto demonstra

- Modelagem de MVP SaaS a partir de uma dor operacional real.
- Fluxo tecnico/cliente com pagina publica por `slug` e QR code.
- Agendamento direto e fluxo consultivo com conversa.
- Inbox do tecnico para acompanhar pedidos e threads.
- Centro local de alertas/eventos para simular notificacoes.
- Preparacao de persistencia com Supabase e fallback local.
- Estrutura pronta para deploy futuro na Vercel.
- Documentacao de produto por fluxo, nao apenas por tecnologia.

## Stack

- Frontend: `React`, `Vite`, `Tailwind CSS`.
- Dados/Auth: `Supabase` preparado e parcialmente acoplado.
- Deploy: `Vercel` como destino futuro.
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
- centro local de alertas/eventos;
- code-splitting no frontend para evitar bundle grande no build.

Ainda local/mockado ou pendente:

- notificacoes reais via WhatsApp;
- autenticacao real completa do `Supabase`;
- migration operacional aplicada no projeto Supabase;
- validacao ponta a ponta em ambiente publicado;
- deploy em `Vercel`.

## Estrutura

```txt
ice-clear-mvp/
|-- docs/       # Fluxos de produto e setup operacional
|-- supabase/   # Migrations e preparacao da camada de dados
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
- `docs/supabase-setup.md`

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
3. Aplicar a migration operacional no `Supabase`.
4. Validar auth, pedidos e conversas com dados reais.
5. Conectar o deploy na `Vercel`.
6. Adicionar notificacoes reais via WhatsApp.

## Observacao

As decisoes permanentes de produto e arquitetura seguem como proposta operacional ate aprovacao final. O objetivo atual e manter o projeto apresentavel como vitrine tecnica de MVP SaaS, sem fingir que a operacao em producao ja esta homologada.
