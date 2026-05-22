import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildBookingRequest,
  validateBookingForm,
} from '../src/lib/bookingData.js'

test('buildBookingRequest normalizes the direct booking payload', () => {
  const result = buildBookingRequest({
    customerName: '  Maria Souza  ',
    customerPhone: ' (11) 99888-7777 ',
    serviceName: 'Limpeza',
    preferredDate: '2026-05-25',
    preferredWindow: 'manha',
    addressLine: ' Rua das Flores, 123 ',
    neighborhood: ' Centro ',
    city: ' São Paulo ',
    state: ' sp ',
    notes: '  Ar da sala pingando.  ',
    technicianSlug: 'joao-climatizacao',
  })

  assert.deepEqual(result, {
    customerName: 'Maria Souza',
    customerPhone: '(11) 99888-7777',
    serviceName: 'Limpeza',
    preferredDate: '2026-05-25',
    preferredWindow: 'manha',
    addressLine: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    notes: 'Ar da sala pingando.',
    technicianSlug: 'joao-climatizacao',
    status: 'pending',
    source: 'qr-direct-booking',
  })
})

test('validateBookingForm reports missing required fields', () => {
  const result = validateBookingForm({
    customerName: '  ',
    customerPhone: '',
    serviceName: 'Limpeza',
    preferredDate: '',
    preferredWindow: 'tarde',
    addressLine: '',
    neighborhood: 'Centro',
    city: '',
    state: 'SP',
    technicianSlug: '',
  })

  assert.deepEqual(result, {
    customerName: 'Informe o nome do cliente.',
    customerPhone: 'Informe o WhatsApp do cliente.',
    preferredDate: 'Selecione a data desejada.',
    addressLine: 'Informe o endereço do atendimento.',
    city: 'Informe a cidade do atendimento.',
    technicianSlug: 'Técnico do QR não identificado.',
  })
})
