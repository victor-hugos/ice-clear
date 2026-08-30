import { cloudflareApiRequest } from './cloudflareApiClient.js'

const localPublishedProfilesKey = 'ice-clear-technician-published-profiles'

function normalizeServices(services = []) {
  return Array.from(new Set(services.map((service) => service.trim()).filter(Boolean)))
}

export function formToProfilePayload(form) {
  return {
    full_name: form.fullName.trim(),
    business_name: form.businessName.trim() || null,
    whatsapp: form.whatsapp.trim(),
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
    slug: form.slug.trim(),
    service_radius_km: Number(form.serviceRadiusKm) || 15,
    onboarding_completed: true,
  }
}

function readLocalPublishedProfiles() {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(localPublishedProfilesKey)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    window.localStorage.removeItem(localPublishedProfilesKey)
    return []
  }
}

function writeLocalPublishedProfiles(profiles) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(localPublishedProfilesKey, JSON.stringify(profiles))
}

function saveLocalPublishedProfile(form) {
  const profiles = readLocalPublishedProfiles()
  const nextProfile = {
    slug: form.slug,
    fullName: form.fullName,
    businessName: form.businessName,
    whatsapp: form.whatsapp,
    city: form.city,
    state: form.state,
    serviceRadiusKm: Number(form.serviceRadiusKm) || 15,
    services: normalizeServices(form.services),
    updatedAt: new Date().toISOString(),
  }

  const nextProfiles = [
    nextProfile,
    ...profiles.filter((profile) => profile.slug !== form.slug),
  ]

  writeLocalPublishedProfiles(nextProfiles)

  return nextProfile
}

export async function getCurrentTechnicianSession() {
  return { mode: 'cloudflare', user: null }
}

export async function loadTechnicianOnboardingData() {
  return { mode: 'cloudflare', form: null }
}

export async function saveTechnicianOnboardingData(form) {
  const { profile } = await cloudflareApiRequest('/api/technicians', {
    method: 'POST',
    body: {
      ...formToProfilePayload(form),
      services: normalizeServices(form.services),
    },
  })
  saveLocalPublishedProfile(form)

  return {
    mode: 'cloudflare',
    profile,
    publicPath: `/t/${form.slug}`,
  }
}

export async function getPublicTechnicianBySlug(slug) {
  const { profile } = await cloudflareApiRequest(
    `/api/technicians/${encodeURIComponent(slug)}`,
  )

  if (!profile) {
    return null
  }

  return profile
}
