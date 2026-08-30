const technicianAppTabs = [
  { id: 'profile', label: 'Perfil', path: '/tecnico/app/perfil' },
  { id: 'messages', label: 'Mensagens', path: '/tecnico/app/mensagens' },
  { id: 'agenda', label: 'Agenda', path: '/tecnico/app/agenda' },
]

const pathToTab = new Map(technicianAppTabs.map((tab) => [tab.path, tab.id]))

export function getTechnicianAppTabs() {
  return technicianAppTabs
}

export function resolveTechnicianAppTab(pathname) {
  return pathToTab.get(pathname) ?? 'profile'
}

export function buildTechnicianAgendaItems(requests = []) {
  return [...requests]
    .sort((left, right) => {
      const leftDate = `${left.preferredDate ?? ''} ${left.preferredWindow ?? ''}`
      const rightDate = `${right.preferredDate ?? ''} ${right.preferredWindow ?? ''}`

      return leftDate.localeCompare(rightDate)
    })
    .map((request) => ({
      id: request.id,
      title: request.serviceName,
      customerName: request.customerName,
      date: request.preferredDate,
      window: request.preferredWindow,
      status: request.status,
      location: `${request.addressLine}, ${request.city} - ${request.state}`,
      createdAt: request.createdAt,
    }))
}
