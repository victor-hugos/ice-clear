function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeState(value) {
  return normalizeText(value).toUpperCase()
}

export function buildBookingRequest(form) {
  return {
    customerName: normalizeText(form.customerName),
    customerPhone: normalizeText(form.customerPhone),
    serviceName: normalizeText(form.serviceName),
    preferredDate: normalizeText(form.preferredDate),
    preferredWindow: normalizeText(form.preferredWindow),
    addressLine: normalizeText(form.addressLine),
    neighborhood: normalizeText(form.neighborhood),
    city: normalizeText(form.city),
    state: normalizeState(form.state),
    notes: normalizeText(form.notes),
    technicianSlug: normalizeText(form.technicianSlug),
    status: 'pending',
    source: 'qr-direct-booking',
  }
}

export function validateBookingForm(form) {
  const payload = buildBookingRequest(form)
  const errors = {}

  if (!payload.customerName) {
    errors.customerName = 'Informe o nome do cliente.'
  }

  if (!payload.customerPhone) {
    errors.customerPhone = 'Informe o WhatsApp do cliente.'
  }

  if (!payload.preferredDate) {
    errors.preferredDate = 'Selecione a data desejada.'
  }

  if (!payload.addressLine) {
    errors.addressLine = 'Informe o endereço do atendimento.'
  }

  if (!payload.city) {
    errors.city = 'Informe a cidade do atendimento.'
  }

  if (!payload.technicianSlug) {
    errors.technicianSlug = 'Técnico do QR não identificado.'
  }

  return errors
}
