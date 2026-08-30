import {
  buildConsultationThreadInsertPayload,
  buildServiceRequestInsertPayload,
  mapConsultationThreadRecord,
  mapServiceRequestRecord,
} from '../src/lib/cloudflareRecordMappers.js'

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init.headers ?? {}),
    },
  })
}

function error(message, status = 400) {
  return json({ error: message }, { status })
}

async function readJson(request) {
  try {
    return await request.json()
  } catch {
    throw new Error('Payload JSON inválido.')
  }
}

function rowId() {
  return crypto.randomUUID()
}

function nowIso() {
  return new Date().toISOString()
}

function normalizeServices(services = []) {
  return Array.from(new Set(services.map((service) => String(service ?? '').trim()).filter(Boolean)))
}

function publicProfileFromRows(rows) {
  if (!rows.length) {
    return null
  }

  const first = rows[0]

  return {
    mode: 'cloudflare',
    profileId: first.id,
    slug: first.slug,
    displayName: first.business_name || first.full_name || 'Técnico Ice Clear',
    fullName: first.full_name || '',
    businessName: first.business_name || '',
    city: first.city || '',
    state: first.state || '',
    serviceRadiusKm: first.service_radius_km ?? null,
    services: normalizeServices(rows.map((row) => row.service_name ?? '').filter(Boolean)),
  }
}

function mapNotificationEvent(row) {
  return {
    id: row.id,
    type: row.type,
    audience: row.audience,
    technicianSlug: row.technician_slug,
    title: row.title,
    message: row.message,
    relatedId: row.related_id,
    status: row.status,
    createdAt: row.created_at,
  }
}

async function getProfileBySlug(db, slug) {
  const { results } = await db
    .prepare(
      `select
        profiles.id,
        profiles.full_name,
        profiles.business_name,
        profiles.whatsapp,
        profiles.city,
        profiles.state,
        profiles.slug,
        profiles.service_radius_km,
        services.service_name
      from technician_profiles profiles
      left join technician_services services
        on services.technician_profile_id = profiles.id
        and services.active = 1
      where profiles.slug = ?
        and profiles.onboarding_completed = 1`,
    )
    .bind(slug)
    .all()

  return publicProfileFromRows(results ?? [])
}

async function saveTechnician(request, env) {
  const input = await readJson(request)
  const slug = String(input.slug ?? '').trim()

  if (!slug) {
    return error('Informe o slug do técnico.')
  }

  const existing = await env.DB
    .prepare('select id from technician_profiles where slug = ?')
    .bind(slug)
    .first()
  const profileId = existing?.id ?? rowId()
  const timestamp = nowIso()
  const services = normalizeServices(input.services ?? [])

  await env.DB
    .prepare(
      `insert into technician_profiles (
        id, full_name, business_name, whatsapp, city, state, slug,
        service_radius_km, onboarding_completed, created_at, updated_at
      )
      values (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      on conflict(slug) do update set
        full_name = excluded.full_name,
        business_name = excluded.business_name,
        whatsapp = excluded.whatsapp,
        city = excluded.city,
        state = excluded.state,
        service_radius_km = excluded.service_radius_km,
        onboarding_completed = 1,
        updated_at = excluded.updated_at`,
    )
    .bind(
      profileId,
      String(input.full_name ?? '').trim(),
      input.business_name ? String(input.business_name).trim() : null,
      String(input.whatsapp ?? '').trim(),
      String(input.city ?? '').trim(),
      String(input.state ?? '').trim().toUpperCase(),
      slug,
      Number(input.service_radius_km) || 15,
      timestamp,
      timestamp,
    )
    .run()

  await env.DB.prepare('delete from technician_services where technician_profile_id = ?')
    .bind(profileId)
    .run()

  for (const serviceName of services) {
    await env.DB
      .prepare(
        `insert into technician_services (
          id, technician_profile_id, service_name, active, created_at
        ) values (?, ?, ?, 1, ?)`,
      )
      .bind(rowId(), profileId, serviceName, timestamp)
      .run()
  }

  await env.DB
    .prepare(
      `insert into technician_qr_codes (id, technician_profile_id, qr_slug, status, created_at)
      values (?, ?, ?, 'active', ?)
      on conflict(technician_profile_id) do update set
        qr_slug = excluded.qr_slug,
        status = 'active'`,
    )
    .bind(rowId(), profileId, slug, timestamp)
    .run()

  const profile = await getProfileBySlug(env.DB, slug)

  return json({ profile })
}

async function createServiceRequest(input, env) {
  const technician = await getProfileBySlug(env.DB, input.technicianSlug)

  if (!technician?.profileId) {
    return error('Técnico não encontrado para este QR.', 404)
  }

  const id = rowId()
  const timestamp = nowIso()
  const payload = buildServiceRequestInsertPayload(input, {
    technicianProfileId: technician.profileId,
  })

  await env.DB
    .prepare(
      `insert into service_requests (
        id, technician_profile_id, technician_slug, customer_name, customer_phone,
        service_name, preferred_date, preferred_window, address_line, neighborhood,
        city, state, notes, status, created_at, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      payload.technician_profile_id,
      payload.technician_slug,
      payload.customer_name,
      payload.customer_phone,
      payload.service_name,
      payload.preferred_date,
      payload.preferred_window,
      payload.address_line,
      payload.neighborhood || null,
      payload.city,
      payload.state,
      payload.notes || null,
      payload.status,
      timestamp,
      timestamp,
    )
    .run()

  const row = await env.DB.prepare('select * from service_requests where id = ?').bind(id).first()

  return json({ request: mapServiceRequestRecord(row) }, { status: 201 })
}

async function listServiceRequests(url, env) {
  const technicianSlug = url.searchParams.get('technicianSlug') ?? ''
  const { results } = await env.DB
    .prepare('select * from service_requests where technician_slug = ? order by created_at desc')
    .bind(technicianSlug)
    .all()

  return json({ requests: (results ?? []).map(mapServiceRequestRecord) })
}

async function updateServiceRequestStatus(requestId, request, env) {
  const input = await readJson(request)
  const status = String(input.status ?? '').trim()

  await env.DB
    .prepare(
      `update service_requests
      set status = ?, updated_at = ?
      where id = ?`,
    )
    .bind(status, nowIso(), requestId)
    .run()

  const row = await env.DB.prepare('select * from service_requests where id = ?').bind(requestId).first()

  if (!row) {
    return error('Pedido não encontrado.', 404)
  }

  return json({ request: mapServiceRequestRecord(row) })
}

async function createConsultationThread(input, env) {
  const technician = await getProfileBySlug(env.DB, input.technicianSlug)

  if (!technician?.profileId) {
    return error('Técnico não encontrado para este QR.', 404)
  }

  const id = rowId()
  const token = rowId()
  const timestamp = nowIso()
  const payload = buildConsultationThreadInsertPayload(input, {
    technicianProfileId: technician.profileId,
  })

  await env.DB
    .prepare(
      `insert into consultation_threads (
        id, technician_profile_id, technician_slug, customer_access_token,
        customer_name, customer_phone, issue_summary, preferred_reply_channel,
        attachments, status, created_at, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      payload.technician_profile_id,
      payload.technician_slug,
      token,
      payload.customer_name,
      payload.customer_phone,
      payload.issue_summary,
      payload.preferred_reply_channel,
      payload.attachments,
      payload.status,
      timestamp,
      timestamp,
    )
    .run()

  const row = await env.DB.prepare('select * from consultation_threads where id = ?').bind(id).first()

  return json({
    thread: mapConsultationThreadRecord({ thread: row, messages: [] }),
  }, { status: 201 })
}

async function loadThreadWithMessages(db, threadId) {
  const thread = await db.prepare('select * from consultation_threads where id = ?').bind(threadId).first()

  if (!thread) {
    return null
  }

  const { results: messages } = await db
    .prepare('select * from consultation_messages where thread_id = ? order by created_at asc')
    .bind(threadId)
    .all()

  return mapConsultationThreadRecord({ thread, messages: messages ?? [] })
}

async function listConsultationThreads(url, env) {
  const technicianSlug = url.searchParams.get('technicianSlug') ?? ''
  const { results } = await env.DB
    .prepare('select * from consultation_threads where technician_slug = ? order by created_at desc')
    .bind(technicianSlug)
    .all()

  const threads = []

  for (const row of results ?? []) {
    threads.push(await loadThreadWithMessages(env.DB, row.id))
  }

  return json({ threads })
}

async function getConsultationThread(threadId, url, env) {
  const technicianSlug = url.searchParams.get('technicianSlug') ?? ''
  const token = url.searchParams.get('token') ?? ''
  const thread = await env.DB
    .prepare(
      `select * from consultation_threads
      where id = ?
        and technician_slug = ?
        and customer_access_token = ?`,
    )
    .bind(threadId, technicianSlug, token)
    .first()

  if (!thread) {
    return error('Conversa não encontrada.', 404)
  }

  const mapped = await loadThreadWithMessages(env.DB, thread.id)

  return json({ thread: mapped })
}

async function updateConsultationStatus(threadId, request, env) {
  const input = await readJson(request)
  const status = String(input.status ?? '').trim()

  await env.DB
    .prepare(
      `update consultation_threads
      set status = ?, updated_at = ?
      where id = ?`,
    )
    .bind(status, nowIso(), threadId)
    .run()

  const thread = await loadThreadWithMessages(env.DB, threadId)

  if (!thread) {
    return error('Conversa não encontrada.', 404)
  }

  return json({ thread })
}

async function appendConsultationMessage(threadId, request, env) {
  const input = await readJson(request)
  const body = String(input.body ?? '').trim()

  if (!body) {
    return error('Informe a resposta do técnico.')
  }

  await env.DB
    .prepare(
      `insert into consultation_messages (id, thread_id, sender, kind, body, created_at)
      values (?, ?, 'technician', 'text', ?, ?)`,
    )
    .bind(rowId(), threadId, body, nowIso())
    .run()

  await env.DB
    .prepare(
      `update consultation_threads
      set status = 'answered', updated_at = ?
      where id = ?`,
    )
    .bind(nowIso(), threadId)
    .run()

  const thread = await loadThreadWithMessages(env.DB, threadId)

  if (!thread) {
    return error('Conversa não encontrada.', 404)
  }

  return json({ thread }, { status: 201 })
}

async function createNotification(request, env) {
  const input = await readJson(request)
  const id = rowId()
  const timestamp = nowIso()

  await env.DB
    .prepare(
      `insert into notification_events (
        id, type, audience, technician_slug, title, message, related_id,
        status, created_at, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      String(input.type ?? '').trim(),
      String(input.audience ?? '').trim(),
      String(input.technicianSlug ?? '').trim(),
      String(input.title ?? '').trim(),
      String(input.message ?? '').trim(),
      String(input.relatedId ?? '').trim(),
      String(input.status ?? 'unread').trim() || 'unread',
      input.createdAt || timestamp,
      timestamp,
    )
    .run()

  const row = await env.DB.prepare('select * from notification_events where id = ?').bind(id).first()

  return json({ event: mapNotificationEvent(row) }, { status: 201 })
}

async function listNotifications(url, env) {
  const audience = url.searchParams.get('audience') ?? ''
  const technicianSlug = url.searchParams.get('technicianSlug') ?? ''
  const { results } = await env.DB
    .prepare(
      `select * from notification_events
      where (? = '' or audience = ?)
        and (? = '' or technician_slug = ?)
      order by created_at desc`,
    )
    .bind(audience, audience, technicianSlug, technicianSlug)
    .all()

  return json({ events: (results ?? []).map(mapNotificationEvent) })
}

async function updateNotificationStatus(eventId, request, env) {
  const input = await readJson(request)
  const status = String(input.status ?? '').trim()

  await env.DB
    .prepare(
      `update notification_events
      set status = ?, updated_at = ?
      where id = ?`,
    )
    .bind(status, nowIso(), eventId)
    .run()

  const row = await env.DB.prepare('select * from notification_events where id = ?').bind(eventId).first()

  if (!row) {
    return error('Alerta não encontrado.', 404)
  }

  return json({ event: mapNotificationEvent(row) })
}

async function handleApi(request, env) {
  const url = new URL(request.url)
  const path = url.pathname

  if (request.method === 'POST' && path === '/api/technicians') {
    return saveTechnician(request, env)
  }

  const technicianMatch = path.match(/^\/api\/technicians\/([^/]+)$/)
  if (request.method === 'GET' && technicianMatch) {
    return json({ profile: await getProfileBySlug(env.DB, decodeURIComponent(technicianMatch[1])) })
  }

  if (request.method === 'GET' && path === '/api/service-requests') {
    return listServiceRequests(url, env)
  }

  if (request.method === 'POST' && path === '/api/service-requests') {
    return createServiceRequest(await readJson(request), env)
  }

  const requestStatusMatch = path.match(/^\/api\/service-requests\/([^/]+)\/status$/)
  if (request.method === 'PATCH' && requestStatusMatch) {
    return updateServiceRequestStatus(decodeURIComponent(requestStatusMatch[1]), request, env)
  }

  if (request.method === 'GET' && path === '/api/consultation-threads') {
    return listConsultationThreads(url, env)
  }

  if (request.method === 'POST' && path === '/api/consultation-threads') {
    return createConsultationThread(await readJson(request), env)
  }

  const threadMatch = path.match(/^\/api\/consultation-threads\/([^/]+)$/)
  if (request.method === 'GET' && threadMatch) {
    return getConsultationThread(decodeURIComponent(threadMatch[1]), url, env)
  }

  const threadStatusMatch = path.match(/^\/api\/consultation-threads\/([^/]+)\/status$/)
  if (request.method === 'PATCH' && threadStatusMatch) {
    return updateConsultationStatus(decodeURIComponent(threadStatusMatch[1]), request, env)
  }

  const threadMessageMatch = path.match(/^\/api\/consultation-threads\/([^/]+)\/messages$/)
  if (request.method === 'POST' && threadMessageMatch) {
    return appendConsultationMessage(decodeURIComponent(threadMessageMatch[1]), request, env)
  }

  if (request.method === 'GET' && path === '/api/notifications') {
    return listNotifications(url, env)
  }

  if (request.method === 'POST' && path === '/api/notifications') {
    return createNotification(request, env)
  }

  const notificationStatusMatch = path.match(/^\/api\/notifications\/([^/]+)\/status$/)
  if (request.method === 'PATCH' && notificationStatusMatch) {
    return updateNotificationStatus(decodeURIComponent(notificationStatusMatch[1]), request, env)
  }

  return error('Rota de API não encontrada.', 404)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}
