import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildTechnicianAgendaItems,
  getTechnicianAppTabs,
  resolveTechnicianAppTab,
} from '../src/lib/technicianAppData.js'

test('getTechnicianAppTabs exposes the mobile technician bottom navigation order', () => {
  assert.deepEqual(
    getTechnicianAppTabs().map((tab) => tab.id),
    ['profile', 'messages', 'agenda'],
  )
})

test('resolveTechnicianAppTab maps technician app paths to a known tab', () => {
  assert.equal(resolveTechnicianAppTab('/tecnico/app/perfil'), 'profile')
  assert.equal(resolveTechnicianAppTab('/tecnico/app/mensagens'), 'messages')
  assert.equal(resolveTechnicianAppTab('/tecnico/app/agenda'), 'agenda')
  assert.equal(resolveTechnicianAppTab('/tecnico/app/qualquer'), 'profile')
})

test('buildTechnicianAgendaItems creates sorted appointment cards from booking requests', () => {
  const items = buildTechnicianAgendaItems([
    {
      id: 'later',
      customerName: 'Bruna',
      serviceName: 'Limpeza',
      preferredDate: '2026-06-02',
      preferredWindow: 'tarde',
      status: 'pending',
      addressLine: 'Rua B, 20',
      city: 'Sao Paulo',
      state: 'SP',
      createdAt: '2026-05-30T10:00:00.000Z',
    },
    {
      id: 'first',
      customerName: 'Ana',
      serviceName: 'Revisao preventiva',
      preferredDate: '2026-06-01',
      preferredWindow: 'manha',
      status: 'confirmed',
      addressLine: 'Rua A, 10',
      city: 'Sao Paulo',
      state: 'SP',
      createdAt: '2026-05-30T09:00:00.000Z',
    },
  ])

  assert.deepEqual(
    items.map((item) => item.id),
    ['first', 'later'],
  )
  assert.equal(items[0].title, 'Revisao preventiva')
  assert.equal(items[0].customerName, 'Ana')
  assert.equal(items[0].location, 'Rua A, 10, Sao Paulo - SP')
})
