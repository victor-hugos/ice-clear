import test from 'node:test'
import assert from 'node:assert/strict'

import { cloudflareApiRequest } from '../src/lib/cloudflareApiClient.js'

test('cloudflareApiRequest sends JSON requests to the Worker API', async () => {
  const calls = []
  const result = await cloudflareApiRequest('/api/example', {
    method: 'POST',
    body: { name: 'Ice Clear' },
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return Response.json({ ok: true })
    },
  })

  assert.deepEqual(result, { ok: true })
  assert.equal(calls[0].url, '/api/example')
  assert.equal(calls[0].options.method, 'POST')
  assert.equal(calls[0].options.headers['Content-Type'], 'application/json')
  assert.equal(calls[0].options.body, JSON.stringify({ name: 'Ice Clear' }))
})

test('cloudflareApiRequest surfaces Worker API errors', async () => {
  await assert.rejects(
    cloudflareApiRequest('/api/example', {
      fetchImpl: async () =>
        Response.json({ error: 'Perfil não encontrado.' }, { status: 404 }),
    }),
    /Perfil não encontrado\./,
  )
})
