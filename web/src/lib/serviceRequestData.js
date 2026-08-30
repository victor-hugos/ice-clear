import { buildBookingRequest } from './bookingData.js'
import { cloudflareApiRequest } from './cloudflareApiClient.js'

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

function saveLocalServiceRequestRecord(request) {
  const currentRequests = readStoredServiceRequests()
  const nextRequests = [
    request,
    ...currentRequests.filter((currentRequest) => currentRequest.id !== request.id),
  ]

  writeStoredServiceRequests(nextRequests)
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

  saveLocalServiceRequestRecord(request)

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

export async function createServiceRequest(form) {
  const payload = buildBookingRequest(form)
  const { request } = await cloudflareApiRequest('/api/service-requests', {
    method: 'POST',
    body: payload,
  })

  saveLocalServiceRequestRecord(request)

  return { mode: 'cloudflare', request }
}

export async function listServiceRequestsByTechnician(technicianSlug) {
  const query = new URLSearchParams({ technicianSlug })
  const { requests } = await cloudflareApiRequest(`/api/service-requests?${query}`)

  requests.forEach(saveLocalServiceRequestRecord)

  return {
    mode: 'cloudflare',
    requests,
  }
}

export async function updateServiceRequestStatus(requestId, nextStatus) {
  const { request } = await cloudflareApiRequest(
    `/api/service-requests/${encodeURIComponent(requestId)}/status`,
    {
      method: 'PATCH',
      body: { status: nextStatus },
    },
  )

  saveLocalServiceRequestRecord(request)

  return {
    mode: 'cloudflare',
    request,
  }
}
