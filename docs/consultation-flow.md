# Consultation Flow

## Objetivo

Permitir que o cliente explique o defeito antes de virar agendamento.

## Rota atual

- `/t/:slug/conversar`

## Comportamento do MVP

- carrega o tecnico pelo slug
- coleta nome, WhatsApp, resumo do defeito e canal de resposta
- aceita anexos como metadados de audio/foto no MVP
- valida os campos obrigatorios
- cria uma conversa local com primeira mensagem do cliente

## Arquivos principais

- `src/lib/consultationData.js`
- `src/lib/consultationThreadData.js`
- `src/pages/CustomerConsultationPage.jsx`
- `tests/consultationData.test.js`

## Proxima evolucao

1. Persistir `chat_threads` e `chat_messages` no Supabase.
2. Exibir a conversa no painel do tecnico.
3. Notificar o tecnico via WhatsApp.
4. Permitir resposta do tecnico dentro da plataforma.
