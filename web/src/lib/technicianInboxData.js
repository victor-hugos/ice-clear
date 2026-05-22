function byNewestFirst(left, right) {
  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
}

export function buildTechnicianInboxFeed({ serviceRequests = [], consultationThreads = [] }) {
  const bookingItems = serviceRequests.map((request) => ({
    id: request.id,
    type: 'booking',
    customerName: request.customerName,
    title: request.serviceName,
    status: request.status,
    createdAt: request.createdAt,
    preferredDate: request.preferredDate,
  }))

  const consultationItems = consultationThreads.map((thread) => ({
    id: thread.id,
    type: 'consultation',
    customerName: thread.customerName,
    title: thread.issueSummary,
    status: thread.status,
    createdAt: thread.createdAt,
    attachmentCount: Array.isArray(thread.attachments) ? thread.attachments.length : 0,
  }))

  return [...bookingItems, ...consultationItems].sort(byNewestFirst)
}

export function summarizeTechnicianInbox(items = []) {
  return items.reduce(
    (summary, item) => ({
      total: summary.total + 1,
      bookings: summary.bookings + (item.type === 'booking' ? 1 : 0),
      consultations: summary.consultations + (item.type === 'consultation' ? 1 : 0),
      pending: summary.pending + (item.status === 'pending' ? 1 : 0),
      open: summary.open + (item.status === 'open' ? 1 : 0),
    }),
    {
      total: 0,
      bookings: 0,
      consultations: 0,
      pending: 0,
      open: 0,
    },
  )
}
