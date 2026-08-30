# Notification Center

## Objetivo

Fechar a camada de experiencia do MVP com uma timeline de eventos relevantes salva no Cloudflare D1.

## Rota atual

- `/tecnico/alertas?slug=...`

## Eventos atuais do MVP

- `booking_created`
- `consultation_created`
- `booking_confirmed`
- `consultation_answered`
- `technician_reply_sent`

## Comportamento

- eventos sao gerados pelo frontend e salvos via `/api/notifications`
- a timeline e ordenada do mais novo para o mais antigo
- serve como preparacao direta para WhatsApp, push ou email depois
- o tecnico consulta os alertas por `audience` e `technicianSlug`

## Arquivos principais

- `src/lib/notificationCenterData.js`
- `src/pages/NotificationCenterPage.jsx`
- `tests/notificationCenterData.test.js`
