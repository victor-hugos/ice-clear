function normalizeAttachments(attachments = []) {
  const parsed =
    typeof attachments === 'string'
      ? JSON.parse(attachments || '[]')
      : attachments

  return Array.isArray(parsed)
    ? parsed
        .filter((attachment) => attachment && typeof attachment === 'object')
        .map((attachment) => ({
          kind: String(attachment.kind ?? '').trim(),
          name: String(attachment.name ?? '').trim(),
        }))
        .filter((attachment) => attachment.kind && attachment.name)
    : []
}

export function buildServiceRequestInsertPayload(payload, { technicianProfileId }) {
  return {
    technician_profile_id: technicianProfileId,
    technician_slug: payload.technicianSlug,
    customer_name: payload.customerName,
    customer_phone: payload.customerPhone,
    service_name: payload.serviceName,
    preferred_date: payload.preferredDate,
    preferred_window: payload.preferredWindow,
    address_line: payload.addressLine,
    neighborhood: payload.neighborhood,
    city: payload.city,
    state: payload.state,
    notes: payload.notes,
    status: payload.status,
  }
}

export function mapServiceRequestRecord(record) {
  return {
    id: record.id,
    technicianSlug: record.technician_slug,
    customerName: record.customer_name,
    customerPhone: record.customer_phone,
    serviceName: record.service_name,
    preferredDate: record.preferred_date,
    preferredWindow: record.preferred_window,
    addressLine: record.address_line,
    neighborhood: record.neighborhood,
    city: record.city,
    state: record.state,
    notes: record.notes,
    status: record.status,
    createdAt: record.created_at,
  }
}

export function buildConsultationThreadInsertPayload(payload, { technicianProfileId }) {
  return {
    technician_profile_id: technicianProfileId,
    technician_slug: payload.technicianSlug,
    customer_name: payload.customerName,
    customer_phone: payload.customerPhone,
    issue_summary: payload.issueSummary,
    preferred_reply_channel: payload.preferredReplyChannel,
    attachments: JSON.stringify(normalizeAttachments(payload.attachments)),
    status: payload.status,
  }
}

export function mapConsultationThreadRecord({ thread, messages = [] }) {
  const createdAt = thread.created_at

  return {
    id: thread.id,
    technicianSlug: thread.technician_slug,
    customerAccessToken: thread.customer_access_token ?? '',
    customerName: thread.customer_name,
    customerPhone: thread.customer_phone,
    issueSummary: thread.issue_summary,
    preferredReplyChannel: thread.preferred_reply_channel,
    attachments: normalizeAttachments(thread.attachments),
    status: thread.status,
    createdAt,
    messages: [
      {
        id: `${thread.id}-customer-1`,
        sender: 'customer',
        kind: 'text',
        body: thread.issue_summary,
        createdAt,
      },
      ...messages.map((message) => ({
        id: message.id,
        sender: message.sender,
        kind: message.kind,
        body: message.body,
        createdAt: message.created_at,
      })),
    ],
  }
}
