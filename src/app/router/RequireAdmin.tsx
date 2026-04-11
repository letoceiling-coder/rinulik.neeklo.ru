import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/useAuthStore'
import { ROUTES } from '@/shared/config/routes'
import { Skeleton } from '@/shared/ui/skeleton'

export function RequireAdmin() {
  const { user, bootstrapped } = useAuthStore()
  const location = useLocation()

  if (!bootstrapped) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950 p-8">
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
