import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'))
const TechnicianAuthPage = lazy(() => import('./pages/TechnicianAuthPage.jsx'))
const TechnicianOnboardingPage = lazy(
  () => import('./pages/TechnicianOnboardingPage.jsx'),
)
const TechnicianDashboardPage = lazy(
  () => import('./pages/TechnicianDashboardPage.jsx'),
)
const NotificationCenterPage = lazy(
  () => import('./pages/NotificationCenterPage.jsx'),
)
const TechnicianPublicPage = lazy(() => import('./pages/TechnicianPublicPage.jsx'))
const CustomerBookingPage = lazy(() => import('./pages/CustomerBookingPage.jsx'))
const CustomerConsultationPage = lazy(
  () => import('./pages/CustomerConsultationPage.jsx'),
)
const CustomerConsultationThreadPage = lazy(
  () => import('./pages/CustomerConsultationThreadPage.jsx'),
)

function App() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-slate-950 px-6 text-sm text-slate-200">
          Carregando Ice Clear...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tecnico/entrar" element={<TechnicianAuthPage />} />
        <Route
          path="/tecnico/onboarding"
          element={<TechnicianOnboardingPage />}
        />
        <Route path="/tecnico/painel" element={<TechnicianDashboardPage />} />
        <Route path="/tecnico/alertas" element={<NotificationCenterPage />} />
        <Route path="/t/:slug" element={<TechnicianPublicPage />} />
        <Route path="/t/:slug/agendar" element={<CustomerBookingPage />} />
        <Route
          path="/t/:slug/conversar"
          element={<CustomerConsultationPage />}
        />
        <Route
          path="/t/:slug/conversar/:threadId"
          element={<CustomerConsultationThreadPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
