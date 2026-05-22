# Direct Booking Flow

## Objetivo

Permitir que o cliente que ja sabe o que quer solicite o servico direto pelo QR,
sem precisar conversar com o tecnico antes.

## Rota atual

- `/t/:slug/agendar`

## Comportamento do MVP

- carrega o tecnico pelo slug
- mostra os servicos publicados, quando existirem
- coleta nome, WhatsApp, data, janela, endereco e observacoes
- valida os campos obrigatorios
- gera um pedido estruturado
- salva localmente no MVP

## Arquivos principais

- `src/lib/bookingData.js`
- `src/lib/serviceRequestData.js`
- `src/pages/CustomerBookingPage.jsx`
- `tests/bookingData.test.js`

## Proxima evolucao

1. Persistir `service_requests` no Supabase.
2. Exibir o pedido no painel do tecnico.
3. Notificar o tecnico via WhatsApp.
4. Permitir confirmacao, recusa ou remarcacao.
