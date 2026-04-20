import { Route, Routes } from 'react-router-dom'
import { DashboardOutlet } from '@/app/layouts/DashboardOutlet'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import { RequireAdmin } from '@/app/router/RequireAdmin'
import { RequireUser } from '@/app/router/RequireUser'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardAdvantagesPage } from '@/pages/dashboard/DashboardAdvantagesPage'
import { DashboardBannerPage } from '@/pages/dashboard/DashboardBannerPage'
import { DashboardChatDemoPage } from '@/pages/dashboard/DashboardChatDemoPage'
import { DashboardHomePage } from '@/pages/dashboard/DashboardHomePage'
import { DashboardLeadsPage } from '@/pages/dashboard/DashboardLeadsPage'
import { DashboardProductsPage } from '@/pages/dashboard/DashboardProductsPage'
import { DashboardServicesPage } from '@/pages/dashboard/DashboardServicesPage'
import { DashboardSettingsPage } from '@/pages/dashboard/DashboardSettingsPage'
import { DashboardTariffsPage } from '@/pages/dashboard/DashboardTariffsPage'
import { DashboardUsersPage } from '@/pages/dashboard/DashboardUsersPage'
import { DashboardVideosPage } from '@/pages/dashboard/DashboardVideosPage'
import { LandingPage } from '@/pages/landing/LandingPage'
import { StudioPage } from '@/pages/studio/StudioPage'
import { VideosPage } from '@/pages/videos/VideosPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/videos" element={<VideosPage />} />
      </Route>
      <Route element={<RequireUser />}>
        <Route path="/studio" element={<StudioPage />} />
      </Route>
      <Route element={<RequireAdmin />}>
        <Route path="/dashboard" element={<DashboardOutlet />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="videos" element={<DashboardVideosPage />} />
          <Route path="services" element={<DashboardServicesPage />} />
          <Route path="tariffs" element={<DashboardTariffsPage />} />
          <Route path="advantages" element={<DashboardAdvantagesPage />} />
          <Route path="banner" element={<DashboardBannerPage />} />
          <Route path="products" element={<DashboardProductsPage />} />
          <Route path="chat-demo" element={<DashboardChatDemoPage />} />
          <Route path="leads" element={<DashboardLeadsPage />} />
          <Route path="users" element={<DashboardUsersPage />} />
          <Route path="settings" element={<DashboardSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
