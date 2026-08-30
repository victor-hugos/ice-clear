import { cloudflareApiRequest } from './cloudflareApiClient.js'

function normalizeText(value) {
  return String(value ?? '').trim()
}

export function buildNotificationEvent({
  type,
  audience,
  technicianSlug = '',
  title,
  message,
  relatedId = '',
  createdAt = new Date().toISOString(),
}) {
  return {
    type: normalizeText(type),
    audience: normalizeText(audience),
    technicianSlug: normalizeText(technicianSlug),
    title: normalizeText(title),
    message: normalizeText(message),
    relatedId: normalizeText(relatedId),
    createdAt,
    status: 'unread',
  }
}

export function sortNotificationEventsByNewest(events) {
  return [...events].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

export async function createNotificationEvent(input, { apiRequest = cloudflareApiRequest } = {}) {
  const { event } = await apiRequest('/api/notifications', {
    method: 'POST',
    body: buildNotificationEvent(input),
  })

  return event
}

export async function listNotificationEvents(
  { audience, technicianSlug = '' } = {},
  { apiRequest = cloudflareApiRequest } = {},
) {
  const query = new URLSearchParams()

  if (audience) {
    query.set('audience', audience)
  }

  if (technicianSlug) {
    query.set('technicianSlug', technicianSlug)
  }

  const { events } = await apiRequest(`/api/notifications?${query}`)

  return sortNotificationEventsByNewest(events ?? [])
}

export async function updateNotificationEventStatus(
  eventId,
  status,
  { apiRequest = cloudflareApiRequest } = {},
) {
  const { event } = await apiRequest(
    `/api/notifications/${encodeURIComponent(eventId)}/status`,
    {
      method: 'PATCH',
      body: { status },
    },
  )

  return event
}
