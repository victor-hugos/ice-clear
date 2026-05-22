import test from 'node:test'
import assert from 'node:assert/strict'

import { appendTechnicianReplyInList } from '../src/lib/consultationThreadData.js'

test('appendTechnicianReplyInList appends a technician message and marks the thread as answered', () => {
  const result = appendTechnicianReplyInList(
    [
      {
        id: 'thread-1',
        status: 'open',
        messages: [
          {
            id: 'msg-1',
            sender: 'customer',
            kind: 'text',
            body: 'O ar não está gelando.',
            createdAt: '2026-05-22T12:00:00.000Z',
          },
        ],
      },
      {
        id: 'thread-2',
        status: 'open',
        messages: [],
      },
    ],
    'thread-1',
    'Pode ser sujeira na evaporadora. Consigo passar amanhã às 10h.',
    '2026-05-22T12:05:00.000Z',
  )

  assert.equal(result[0].status, 'answered')
  assert.equal(result[0].messages.length, 2)
  assert.deepEqual(result[0].messages[1], {
    id: 'thread-1-technician-2',
    sender: 'technician',
    kind: 'text',
    body: 'Pode ser sujeira na evaporadora. Consigo passar amanhã às 10h.',
    createdAt: '2026-05-22T12:05:00.000Z',
  })
  assert.deepEqual(result[1], {
    id: 'thread-2',
    status: 'open',
    messages: [],
  })
})
