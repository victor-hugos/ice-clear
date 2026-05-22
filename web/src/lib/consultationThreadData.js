import { buildConsultationRequest } from './consultationData.js'

const consultationThreadsStorageKey = 'ice-clear-consultation-threads'

function readStoredConsultations() {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(consultationThreadsStorageKey)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    window.localStorage.removeItem(consultationThreadsStorageKey)
    return []
  }
}

function writeStoredConsultations(threads) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(consultationThreadsStorageKey, JSON.stringify(threads))
}

export function findConsultationThreadByIdAndSlug(threads, threadId, technicianSlug) {
  return (
    threads.find(
      (thread) => thread.id === threadId && thread.technicianSlug === technicianSlug,
    ) ?? null
  )
}

export function updateConsultationStatusInList(threads, threadId, nextStatus) {
  return threads.map((thread) =>
    thread.id === threadId ? { ...thread, status: nextStatus } : thread,
  )
}

export function appendTechnicianReplyInList(
  threads,
  threadId,
  replyBody,
  createdAt = new Date().toISOString(),
) {
  return threads.map((thread) => {
    if (thread.id !== threadId) {
      return thread
    }

    const nextMessageIndex = (thread.messages?.length ?? 0) + 1

    return {
      ...thread,
      status: 'answered',
      messages: [
        ...(thread.messages ?? []),
        {
          id: `${threadId}-technician-${nextMessageIndex}`,
          sender: 'technician',
          kind: 'text',
          body: String(replyBody ?? '').trim(),
          createdAt,
        },
      ],
    }
  })
}

export function createLocalConsultationThread(form) {
  const payload = buildConsultationRequest(form)
  const thread = {
    id: crypto.randomUUID(),
    ...payload,
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: crypto.randomUUID(),
        sender: 'customer',
        kind: 'text',
        body: payload.issueSummary,
        createdAt: new Date().toISOString(),
      },
    ],
  }

  const currentThreads = readStoredConsultations()
  writeStoredConsultations([thread, ...currentThreads])

  return thread
}

export function listLocalConsultationThreadsByTechnician(technicianSlug) {
  return readStoredConsultations().filter(
    (thread) => thread.technicianSlug === technicianSlug,
  )
}

export function getLocalConsultationThreadByIdAndSlug(threadId, technicianSlug) {
  return findConsultationThreadByIdAndSlug(
    readStoredConsultations(),
    threadId,
    technicianSlug,
  )
}

export function updateLocalConsultationStatus(threadId, nextStatus) {
  const currentThreads = readStoredConsultations()
  const nextThreads = updateConsultationStatusInList(
    currentThreads,
    threadId,
    nextStatus,
  )

  writeStoredConsultations(nextThreads)

  return nextThreads.find((thread) => thread.id === threadId) ?? null
}

export function appendLocalTechnicianReply(threadId, replyBody) {
  const currentThreads = readStoredConsultations()
  const nextThreads = appendTechnicianReplyInList(currentThreads, threadId, replyBody)

  writeStoredConsultations(nextThreads)

  return nextThreads.find((thread) => thread.id === threadId) ?? null
}
