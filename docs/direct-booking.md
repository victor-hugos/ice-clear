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
- salva pedidos no Cloudflare D1 via API Worker

## Arquivos principais

- `src/lib/bookingData.js`
- `src/lib/serviceRequestData.js`
- `src/pages/CustomerBookingPage.jsx`
- `tests/bookingData.test.js`

## Proxima evolucao

1. Validar criacao e leitura de `service_requests` via API Worker no painel do tecnico.
2. Notificar o tecnico via WhatsApp.
3. Permitir confirmacao, recusa ou remarcacao.
