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
- cria conversas no Cloudflare D1 via API Worker

## Arquivos principais

- `src/lib/consultationData.js`
- `src/lib/consultationThreadData.js`
- `src/pages/CustomerConsultationPage.jsx`
- `tests/consultationData.test.js`

## Proxima evolucao

1. Validar criacao, leitura e resposta de conversas via API Worker no painel do tecnico.
2. Notificar o tecnico via WhatsApp.
3. Permitir resposta do tecnico dentro da plataforma.
