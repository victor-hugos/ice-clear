import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildConsultationThreadInsertPayload,
  buildServiceRequestInsertPayload,
  mapConsultationThreadRecord,
  mapServiceRequestRecord,
} from '../src/lib/cloudflareRecordMappers.js'

test('buildServiceRequestInsertPayload maps a booking payload to the D1 row shape', () => {
  const payload = buildServiceRequestInsertPayload(
    {
      technicianSlug: 'joao-clima',
      customerName: 'Maria Souza',
      customerPhone: '(11) 99888-7777',
      serviceName: 'Limpeza',
      preferredDate: '2026-05-22',
      preferredWindow: 'manha',
      addressLine: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      notes: 'Dois aparelhos',
      status: 'pending',
    },
    {
      technicianProfileId: 'profile-123',
    },
  )

  assert.deepEqual(payload, {
    technician_profile_id: 'profile-123',
    technician_slug: 'joao-clima',
    customer_name: 'Maria Souza',
    customer_phone: '(11) 99888-7777',
    service_name: 'Limpeza',
    preferred_date: '2026-05-22',
    preferred_window: 'manha',
    address_line: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    notes: 'Dois aparelhos',
    status: 'pending',
  })
})

test('mapServiceRequestRecord maps a D1 booking row back to the app shape', () => {
  const record = mapServiceRequestRecord({
    id: 'request-1',
    technician_slug: 'joao-clima',
    customer_name: 'Maria Souza',
    customer_phone: '(11) 99888-7777',
    service_name: 'Limpeza',
    preferred_date: '2026-05-22',
    preferred_window: 'manha',
    address_line: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    notes: 'Dois aparelhos',
    status: 'confirmed',
    created_at: '2026-05-22T12:00:00.000Z',
  })

  assert.deepEqual(record, {
    id: 'request-1',
    technicianSlug: 'joao-clima',
    customerName: 'Maria Souza',
    customerPhone: '(11) 99888-7777',
    serviceName: 'Limpeza',
    preferredDate: '2026-05-22',
    preferredWindow: 'manha',
    addressLine: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    notes: 'Dois aparelhos',
    status: 'confirmed',
    createdAt: '2026-05-22T12:00:00.000Z',
  })
})

test('buildConsultationThreadInsertPayload maps a consultation payload to the D1 row shape', () => {
  const payload = buildConsultationThreadInsertPayload(
    {
      technicianSlug: 'joao-clima',
      customerName: 'Carlos Lima',
      customerPhone: '(11) 97777-6666',
      issueSummary: 'Liga mas nao gela',
      preferredReplyChannel: 'whatsapp',
      attachments: [
        { kind: 'audio', name: 'audio-1.ogg' },
        { kind: 'image', name: 'foto-1.jpg' },
      ],
      status: 'open',
    },
    {
      technicianProfileId: 'profile-123',
    },
  )

  assert.deepEqual(payload, {
    technician_profile_id: 'profile-123',
    technician_slug: 'joao-clima',
    customer_name: 'Carlos Lima',
    customer_phone: '(11) 97777-6666',
    issue_summary: 'Liga mas nao gela',
    preferred_reply_channel: 'whatsapp',
    attachments: JSON.stringify([
      { kind: 'audio', name: 'audio-1.ogg' },
      { kind: 'image', name: 'foto-1.jpg' },
    ]),
    status: 'open',
  })
})

test('mapConsultationThreadRecord rebuilds the consultation thread with customer and technician messages', () => {
  const thread = mapConsultationThreadRecord({
    thread: {
      id: 'thread-1',
      technician_slug: 'joao-clima',
      customer_access_token: 'token-123',
      customer_name: 'Carlos Lima',
      customer_phone: '(11) 97777-6666',
      issue_summary: 'Liga mas nao gela',
      preferred_reply_channel: 'whatsapp',
      attachments: JSON.stringify([{ kind: 'audio', name: 'audio-1.ogg' }]),
      status: 'answered',
      created_at: '2026-05-22T09:00:00.000Z',
    },
    messages: [
      {
        id: 'message-1',
        sender: 'technician',
        kind: 'text',
        body: 'Posso revisar hoje à tarde.',
        created_at: '2026-05-22T10:00:00.000Z',
      },
    ],
  })

  assert.deepEqual(thread, {
    id: 'thread-1',
    technicianSlug: 'joao-clima',
    customerAccessToken: 'token-123',
    customerName: 'Carlos Lima',
    customerPhone: '(11) 97777-6666',
    issueSummary: 'Liga mas nao gela',
    preferredReplyChannel: 'whatsapp',
    attachments: [{ kind: 'audio', name: 'audio-1.ogg' }],
    status: 'answered',
    createdAt: '2026-05-22T09:00:00.000Z',
    messages: [
      {
        id: 'thread-1-customer-1',
        sender: 'customer',
        kind: 'text',
        body: 'Liga mas nao gela',
        createdAt: '2026-05-22T09:00:00.000Z',
      },
      {
        id: 'message-1',
        sender: 'technician',
        kind: 'text',
        body: 'Posso revisar hoje à tarde.',
        createdAt: '2026-05-22T10:00:00.000Z',
      },
    ],
  })
})
