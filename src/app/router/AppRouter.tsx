import { Route, Routes } from 'react-router-dom'
import { DashboardOutlet } from '@/app/layouts/DashboardOutlet'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import { DashboardAssistantsPage } from '@/pages/dashboard/DashboardAssistantsPage'
import { DashboardChatsPage } from '@/pages/dashboard/DashboardChatsPage'
import { DashboardHomePage } from '@/pages/dashboard/DashboardHomePage'
import { DashboardLeadsPage } from '@/pages/dashboard/DashboardLeadsPage'
import { DashboardSettingsPage } from '@/pages/dashboard/DashboardSettingsPage'
import { DashboardVideosPage } from '@/pages/dashboard/DashboardVideosPage'
import { LandingPage } from '@/pages/landing/LandingPage'
import { VideosPage } from '@/pages/videos/VideosPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/videos" element={<VideosPage />} />
      </Route>
      <Route path="/dashboard" element={<DashboardOutlet />}>
        <Route index element={<DashboardHomePage />} />
        <Route path="videos" element={<DashboardVideosPage />} />
        <Route path="chats" element={<DashboardChatsPage />} />
        <Route path="leads" element={<DashboardLeadsPage />} />
        <Route path="assistants" element={<DashboardAssistantsPage />} />
        <Route path="settings" element={<DashboardSettingsPage />} />
      </Route>
    </Routes>
  )
}
