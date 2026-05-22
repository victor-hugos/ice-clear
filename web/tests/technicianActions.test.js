import test from 'node:test'
import assert from 'node:assert/strict'

import { updateServiceRequestStatusInList } from '../src/lib/serviceRequestData.js'
import { updateConsultationStatusInList } from '../src/lib/consultationThreadData.js'

test('updateServiceRequestStatusInList updates only the targeted booking status', () => {
  const result = updateServiceRequestStatusInList(
    [
      { id: 'req-1', status: 'pending' },
      { id: 'req-2', status: 'pending' },
    ],
    'req-2',
    'confirmed',
  )

  assert.deepEqual(result, [
    { id: 'req-1', status: 'pending' },
    { id: 'req-2', status: 'confirmed' },
  ])
})

test('updateConsultationStatusInList updates only the targeted consultation status', () => {
  const result = updateConsultationStatusInList(
    [
      { id: 'thread-1', status: 'open' },
      { id: 'thread-2', status: 'open' },
    ],
    'thread-1',
    'answered',
  )

  assert.deepEqual(result, [
    { id: 'thread-1', status: 'answered' },
    { id: 'thread-2', status: 'open' },
  ])
})
