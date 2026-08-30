import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildNotificationEvent,
  createNotificationEvent,
  listNotificationEvents,
  sortNotificationEventsByNewest,
  updateNotificationEventStatus,
} from '../src/lib/notificationCenterData.js'

test('buildNotificationEvent normalizes a technician notification event', () => {
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

test('createNotificationEvent persists notifications through the Cloudflare API', async () => {
  const calls = []
  const event = await createNotificationEvent(
    {
      type: 'booking_created',
      audience: 'technician',
      technicianSlug: 'joao-climatizacao',
      title: 'Novo pedido recebido',
      message: 'Maria solicitou uma limpeza.',
      relatedId: 'req-1',
    },
    {
      apiRequest: async (path, options) => {
        calls.push({ path, options })
        return {
          event: {
            id: 'evt-1',
            ...options.body,
            createdAt: '2026-05-22T15:00:00.000Z',
            status: 'unread',
          },
        }
      },
    },
  )

  assert.equal(calls[0].path, '/api/notifications')
  assert.equal(calls[0].options.method, 'POST')
  assert.equal(calls[0].options.body.type, 'booking_created')
  assert.equal(event.id, 'evt-1')
})

test('listNotificationEvents reads technician notifications from the Cloudflare API', async () => {
  const calls = []
  const events = await listNotificationEvents(
    { audience: 'technician', technicianSlug: 'joao-climatizacao' },
    {
      apiRequest: async (path) => {
        calls.push(path)
        return { events: [{ id: 'evt-1', type: 'booking_created' }] }
      },
    },
  )

  assert.equal(
    calls[0],
    '/api/notifications?audience=technician&technicianSlug=joao-climatizacao',
  )
  assert.deepEqual(events, [{ id: 'evt-1', type: 'booking_created' }])
})

test('updateNotificationEventStatus updates notification state through the Cloudflare API', async () => {
  const calls = []
  const event = await updateNotificationEventStatus('evt-1', 'read', {
    apiRequest: async (path, options) => {
      calls.push({ path, options })
      return { event: { id: 'evt-1', status: 'read' } }
    },
  })

  assert.equal(calls[0].path, '/api/notifications/evt-1/status')
  assert.equal(calls[0].options.method, 'PATCH')
  assert.deepEqual(calls[0].options.body, { status: 'read' })
  assert.deepEqual(event, { id: 'evt-1', status: 'read' })
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
