import { hasSupabaseEnv, supabase } from './supabase.js'

const localPublishedProfilesKey = 'ice-clear-technician-published-profiles'

function normalizeServices(services = []) {
  return Array.from(new Set(services.map((service) => service.trim()).filter(Boolean)))
}

function formToProfilePayload(form) {
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

function profileRowsToForm(profile, services = []) {
  return {
    fullName: profile.full_name ?? '',
    businessName: profile.business_name ?? '',
    whatsapp: profile.whatsapp ?? '',
    city: profile.city ?? '',
    state: profile.state ?? '',
    slug: profile.slug ?? '',
    serviceRadiusKm: String(profile.service_radius_km ?? 15),
    services: normalizeServices(services.map((service) => service.service_name)),
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

function getLocalPublishedProfileBySlug(slug) {
  return readLocalPublishedProfiles().find((profile) => profile.slug === slug) ?? null
}

export async function getCurrentTechnicianSession() {
  if (!hasSupabaseEnv || !supabase) {
    return { mode: 'local', user: null }
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return {
    mode: data.session?.user ? 'supabase' : 'local',
    user: data.session?.user ?? null,
  }
}

export async function loadTechnicianOnboardingData() {
  const session = await getCurrentTechnicianSession()

  if (!session.user || !supabase) {
    return { mode: 'local', form: null }
  }

  const { data: profile, error: profileError } = await supabase
    .from('technician_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (profileError) {
    throw profileError
  }

  if (!profile) {
    return { mode: 'supabase', form: null, user: session.user }
  }

  const { data: services, error: servicesError } = await supabase
    .from('technician_services')
    .select('service_name')
    .eq('technician_profile_id', profile.id)
    .eq('active', true)

  if (servicesError) {
    throw servicesError
  }

  return {
    mode: 'supabase',
    user: session.user,
    form: profileRowsToForm(profile, services ?? []),
  }
}

export async function saveTechnicianOnboardingData(form) {
  const session = await getCurrentTechnicianSession()
  const normalizedServices = normalizeServices(form.services)

  if (!session.user || !supabase) {
    const localProfile = saveLocalPublishedProfile(form)

    return {
      mode: 'local',
      profile: localProfile,
      publicPath: `/t/${localProfile.slug}`,
    }
  }

  const profilePayload = {
    user_id: session.user.id,
    ...formToProfilePayload(form),
  }

  const { data: profile, error: profileError } = await supabase
    .from('technician_profiles')
    .upsert(profilePayload, { onConflict: 'user_id' })
    .select('id, slug, full_name, business_name, city, state, service_radius_km, whatsapp')
    .single()

  if (profileError) {
    throw profileError
  }

  const { error: deleteServicesError } = await supabase
    .from('technician_services')
    .delete()
    .eq('technician_profile_id', profile.id)

  if (deleteServicesError) {
    throw deleteServicesError
  }

  if (normalizedServices.length > 0) {
    const { error: insertServicesError } = await supabase
      .from('technician_services')
      .insert(
        normalizedServices.map((serviceName) => ({
          technician_profile_id: profile.id,
          service_name: serviceName,
        })),
      )

    if (insertServicesError) {
      throw insertServicesError
    }
  }

  const { error: qrError } = await supabase
    .from('technician_qr_codes')
    .upsert(
      {
        technician_profile_id: profile.id,
        qr_slug: form.slug,
        status: 'active',
      },
      { onConflict: 'technician_profile_id' },
    )

  if (qrError) {
    throw qrError
  }

  saveLocalPublishedProfile(form)

  return {
    mode: 'supabase',
    profile: {
      ...profile,
      services: normalizedServices,
    },
    publicPath: `/t/${form.slug}`,
  }
}

export async function getPublicTechnicianBySlug(slug) {
  if (hasSupabaseEnv && supabase) {
    const { data, error } = await supabase
      .from('public_technician_profiles')
      .select('*')
      .eq('qr_slug', slug)

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      const first = data[0]

      return {
        mode: 'supabase',
        slug,
        displayName: first.business_name || first.full_name || 'Técnico Ice Clear',
        fullName: first.full_name || '',
        businessName: first.business_name || '',
        city: first.city || '',
        state: first.state || '',
        serviceRadiusKm: first.service_radius_km ?? null,
        services: normalizeServices(data.map((row) => row.service_name ?? '').filter(Boolean)),
      }
    }
  }

  const localProfile = getLocalPublishedProfileBySlug(slug)

  if (!localProfile) {
    return null
  }

  return {
    mode: 'local',
    slug,
    displayName: localProfile.businessName || localProfile.fullName || 'Técnico Ice Clear',
    fullName: localProfile.fullName,
    businessName: localProfile.businessName,
    city: localProfile.city,
    state: localProfile.state,
    serviceRadiusKm: localProfile.serviceRadiusKm,
    services: normalizeServices(localProfile.services),
  }
}
