import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildTechnicianInboxFeed,
  summarizeTechnicianInbox,
} from '../src/lib/technicianInboxData.js'

test('buildTechnicianInboxFeed merges bookings and consultations ordered by newest first', () => {
  const result = buildTechnicianInboxFeed({
    serviceRequests: [
      {
        id: 'req-1',
        customerName: 'Maria',
        serviceName: 'Limpeza',
        preferredDate: '2026-05-27',
        status: 'pending',
        createdAt: '2026-05-22T09:30:00.000Z',
      },
    ],
    consultationThreads: [
      {
        id: 'thread-1',
        customerName: 'Carlos',
        issueSummary: 'Ar liga, mas não gela.',
        status: 'open',
        createdAt: '2026-05-22T10:15:00.000Z',
        attachments: [{ kind: 'audio', name: 'audio.m4a' }],
      },
    ],
  })

  assert.deepEqual(result, [
    {
      id: 'thread-1',
      type: 'consultation',
      customerName: 'Carlos',
      title: 'Ar liga, mas não gela.',
      status: 'open',
      createdAt: '2026-05-22T10:15:00.000Z',
      attachmentCount: 1,
    },
    {
      id: 'req-1',
      type: 'booking',
      customerName: 'Maria',
      title: 'Limpeza',
      status: 'pending',
      createdAt: '2026-05-22T09:30:00.000Z',
      preferredDate: '2026-05-27',
    },
  ])
})

test('summarizeTechnicianInbox counts bookings, consultations and total items', () => {
  const result = summarizeTechnicianInbox([
    { id: '1', type: 'booking', status: 'pending' },
    { id: '2', type: 'booking', status: 'pending' },
    { id: '3', type: 'consultation', status: 'open' },
  ])

  assert.deepEqual(result, {
    total: 3,
    bookings: 2,
    consultations: 1,
    pending: 2,
    open: 1,
  })
})
