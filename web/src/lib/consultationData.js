function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeAttachments(attachments = []) {
  return attachments
    .filter((attachment) => attachment && attachment.kind && attachment.name)
    .map((attachment) => ({
      kind: normalizeText(attachment.kind),
      name: normalizeText(attachment.name),
    }))
}

export function buildConsultationRequest(form) {
  return {
    customerName: normalizeText(form.customerName),
    customerPhone: normalizeText(form.customerPhone),
    issueSummary: normalizeText(form.issueSummary),
    preferredReplyChannel: normalizeText(form.preferredReplyChannel),
    technicianSlug: normalizeText(form.technicianSlug),
    attachments: normalizeAttachments(form.attachments),
    status: 'open',
    source: 'qr-consultation',
  }
}

export function validateConsultationForm(form) {
  const payload = buildConsultationRequest(form)
  const errors = {}

  if (!payload.customerName) {
    errors.customerName = 'Informe o nome do cliente.'
  }

  if (!payload.customerPhone) {
    errors.customerPhone = 'Informe o WhatsApp do cliente.'
  }

  if (!payload.issueSummary) {
    errors.issueSummary = 'Descreva o problema do equipamento.'
  }

  if (!payload.technicianSlug) {
    errors.technicianSlug = 'Técnico do QR não identificado.'
  }

  return errors
}
