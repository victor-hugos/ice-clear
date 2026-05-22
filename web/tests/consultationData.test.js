import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildConsultationRequest,
  validateConsultationForm,
} from '../src/lib/consultationData.js'

test('buildConsultationRequest normalizes a consultation payload with attachments metadata', () => {
  const result = buildConsultationRequest({
    customerName: '  Carlos Lima ',
    customerPhone: ' (11) 97777-6666 ',
    issueSummary: '  O ar liga mas não gela.  ',
    preferredReplyChannel: 'whatsapp',
    technicianSlug: 'joao-climatizacao',
    attachments: [
      { kind: 'audio', name: 'audio-defeito.m4a' },
      { kind: 'image', name: 'frente-aparelho.jpg' },
    ],
  })

  assert.deepEqual(result, {
    customerName: 'Carlos Lima',
    customerPhone: '(11) 97777-6666',
    issueSummary: 'O ar liga mas não gela.',
    preferredReplyChannel: 'whatsapp',
    technicianSlug: 'joao-climatizacao',
    attachments: [
      { kind: 'audio', name: 'audio-defeito.m4a' },
      { kind: 'image', name: 'frente-aparelho.jpg' },
    ],
    status: 'open',
    source: 'qr-consultation',
  })
})

test('validateConsultationForm reports missing fields for consultation intake', () => {
  const result = validateConsultationForm({
    customerName: ' ',
    customerPhone: '',
    issueSummary: '',
    preferredReplyChannel: 'whatsapp',
    technicianSlug: '',
    attachments: [],
  })

  assert.deepEqual(result, {
    customerName: 'Informe o nome do cliente.',
    customerPhone: 'Informe o WhatsApp do cliente.',
    issueSummary: 'Descreva o problema do equipamento.',
    technicianSlug: 'Técnico do QR não identificado.',
  })
})
