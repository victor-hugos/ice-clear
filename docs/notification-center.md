# Notification Center

## Objetivo

Fechar a camada de experiencia do MVP com uma timeline local de eventos relevantes.

## Rota atual

- `/tecnico/alertas?slug=...`

## Eventos atuais do MVP

- `booking_created`
- `consultation_created`
- `booking_confirmed`
- `consultation_answered`
- `technician_reply_sent`

## Comportamento

- eventos sao gerados localmente
- a timeline e ordenada do mais novo para o mais antigo
- serve como preparacao direta para WhatsApp, push ou email depois

## Arquivos principais

- `src/lib/notificationCenterData.js`
- `src/pages/NotificationCenterPage.jsx`
- `tests/notificationCenterData.test.js`
