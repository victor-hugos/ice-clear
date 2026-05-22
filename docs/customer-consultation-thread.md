# Customer Consultation Thread

## Objetivo

Permitir que o cliente acompanhe a resposta do técnico dentro da mesma thread consultiva.

## Rota atual

- `/t/:slug/conversar/:threadId`

## Comportamento do MVP

- carrega a thread local pelo `slug` e `threadId`
- mostra histórico de mensagens do cliente e do técnico
- destaca quando a conversa já foi respondida

## Arquivos principais

- `src/lib/consultationThreadData.js`
- `src/pages/CustomerConsultationThreadPage.jsx`
- `tests/customerConsultationThread.test.js`

## Próxima evolução

1. Atualização em tempo real da thread.
2. Notificação ao cliente quando o técnico responder.
3. Persistência completa no backend com `chat_threads` e `chat_messages` reais.
