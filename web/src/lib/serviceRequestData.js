import { buildBookingRequest } from './bookingData.js'

const serviceRequestsStorageKey = 'ice-clear-service-requests'

function readStoredServiceRequests() {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(serviceRequestsStorageKey)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    window.localStorage.removeItem(serviceRequestsStorageKey)
    return []
  }
}

function writeStoredServiceRequests(requests) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(serviceRequestsStorageKey, JSON.stringify(requests))
}

export function updateServiceRequestStatusInList(requests, requestId, nextStatus) {
  return requests.map((request) =>
    request.id === requestId ? { ...request, status: nextStatus } : request,
  )
}

export function createLocalServiceRequest(form) {
  const payload = buildBookingRequest(form)
  const request = {
    id: crypto.randomUUID(),
    ...payload,
    createdAt: new Date().toISOString(),
  }

  const currentRequests = readStoredServiceRequests()
  writeStoredServiceRequests([request, ...currentRequests])

  return request
}

export function listLocalServiceRequestsByTechnician(technicianSlug) {
  return readStoredServiceRequests().filter(
    (request) => request.technicianSlug === technicianSlug,
  )
}

export function updateLocalServiceRequestStatus(requestId, nextStatus) {
  const currentRequests = readStoredServiceRequests()
  const nextRequests = updateServiceRequestStatusInList(
    currentRequests,
    requestId,
    nextStatus,
  )

  writeStoredServiceRequests(nextRequests)

  return nextRequests.find((request) => request.id === requestId) ?? null
}
