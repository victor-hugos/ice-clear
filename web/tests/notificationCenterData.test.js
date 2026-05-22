import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildNotificationEvent,
  sortNotificationEventsByNewest,
} from '../src/lib/notificationCenterData.js'

test('buildNotificationEvent normalizes a local MVP notification event', () => {
  const result = buildNotificationEvent({
    type: 'booking_created',
    audience: 'technician',
    technicianSlug: 'joao-climatizacao',
    title: '  Novo pedido recebido  ',
    message: '  Maria solicitou uma limpeza.  ',
    relatedId: 'req-1',
    createdAt: '2026-05-22T15:00:00.000Z',
  })

  assert.deepEqual(result, {
    type: 'booking_created',
    audience: 'technician',
    technicianSlug: 'joao-climatizacao',
    title: 'Novo pedido recebido',
    message: 'Maria solicitou uma limpeza.',
    relatedId: 'req-1',
    createdAt: '2026-05-22T15:00:00.000Z',
    status: 'unread',
  })
})

test('sortNotificationEventsByNewest orders the latest event first', () => {
  const result = sortNotificationEventsByNewest([
    { id: 'evt-1', createdAt: '2026-05-22T15:00:00.000Z' },
    { id: 'evt-2', createdAt: '2026-05-22T16:00:00.000Z' },
  ])

  assert.deepEqual(result, [
    { id: 'evt-2', createdAt: '2026-05-22T16:00:00.000Z' },
    { id: 'evt-1', createdAt: '2026-05-22T15:00:00.000Z' },
  ])
})
