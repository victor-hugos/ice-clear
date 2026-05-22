import test from 'node:test'
import assert from 'node:assert/strict'

import { findConsultationThreadByIdAndSlug } from '../src/lib/consultationThreadData.js'

test('findConsultationThreadByIdAndSlug returns only the matching thread for the technician slug', () => {
  const result = findConsultationThreadByIdAndSlug(
    [
      { id: 'thread-1', technicianSlug: 'joao-climatizacao' },
      { id: 'thread-2', technicianSlug: 'maria-clima' },
    ],
    'thread-1',
    'joao-climatizacao',
  )

  assert.deepEqual(result, {
    id: 'thread-1',
    technicianSlug: 'joao-climatizacao',
  })
})

test('findConsultationThreadByIdAndSlug returns null when the slug does not match', () => {
  const result = findConsultationThreadByIdAndSlug(
    [{ id: 'thread-1', technicianSlug: 'joao-climatizacao' }],
    'thread-1',
    'maria-clima',
  )

  assert.equal(result, null)
})
