# Technician Dashboard

## Objetivo

Dar ao técnico um primeiro inbox operacional para enxergar pedidos diretos e conversas consultivas no mesmo lugar.

## Rota atual

- `/tecnico/painel?slug=...`

## Comportamento do MVP

- lê pedidos diretos salvos no Cloudflare D1
- lê conversas consultivas salvas no Cloudflare D1
- junta tudo em uma única timeline ordenada por data mais recente
- mostra contadores simples de volume operacional

## Arquivos principais

- `src/lib/technicianInboxData.js`
- `src/pages/TechnicianDashboardPage.jsx`
- `tests/technicianInboxData.test.js`

## Próxima evolução

1. Evoluir filtros e estados operacionais para `service_requests` e `consultation_threads` reais.
2. Adicionar ações do técnico: confirmar, recusar, responder.
3. Acoplar notificação por WhatsApp para novos itens.
