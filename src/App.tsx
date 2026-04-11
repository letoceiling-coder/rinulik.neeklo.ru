import { useEffect } from 'react'
import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/app/router/AppRouter'
import { useAuthStore } from '@/app/store/useAuthStore'

export default function App() {
  useEffect(() => {
    const finish = () => {
      void useAuthStore.getState().bootstrap()
    }
    const unsub = useAuthStore.persist.onFinishHydration(finish)
    if (useAuthStore.persist.hasHydrated()) finish()
    return unsub
  }, [])

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
