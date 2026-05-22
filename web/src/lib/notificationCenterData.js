const notificationEventsStorageKey = 'ice-clear-notification-events'

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

function readStoredNotificationEvents() {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(notificationEventsStorageKey)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    window.localStorage.removeItem(notificationEventsStorageKey)
    return []
  }
}

function writeStoredNotificationEvents(events) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(notificationEventsStorageKey, JSON.stringify(events))
}

export function createLocalNotificationEvent(input) {
  const event = {
    id: crypto.randomUUID(),
    ...buildNotificationEvent(input),
  }

  const currentEvents = readStoredNotificationEvents()
  writeStoredNotificationEvents(sortNotificationEventsByNewest([event, ...currentEvents]))

  return event
}

export function listLocalNotificationEvents({ audience, technicianSlug = '' } = {}) {
  const events = readStoredNotificationEvents()

  return sortNotificationEventsByNewest(
    events.filter((event) => {
      if (audience && event.audience !== audience) {
        return false
      }

      if (technicianSlug && event.technicianSlug && event.technicianSlug !== technicianSlug) {
        return false
      }

      return true
    }),
  )
}
