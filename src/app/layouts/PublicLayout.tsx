import { Outlet } from 'react-router-dom'
import { Footer } from '@/components/footer/Footer'
import { Navbar } from '@/components/navbar/Navbar'

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
