import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import TabLayout from './components/layout/TabLayout'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { useSeedUserDefaults } from './hooks/use-seed'
import ItemDetailPage from './pages/ItemDetailPage'
import ItemFormPage from './pages/ItemFormPage'
import ItemsPage from './pages/ItemsPage'
import LoginPage from './pages/LoginPage'
import ManagePage from './pages/ManagePage'
import SearchPage from './pages/SearchPage'

const queryClient = new QueryClient()

function AuthenticatedApp() {
  useSeedUserDefaults()

  return (
    <Routes>
      <Route path="/items/new" element={<ItemFormPage />} />
      <Route path="/items/:id/edit" element={<ItemFormPage />} />
      <Route path="/items/:id" element={<ItemDetailPage />} />
      <Route element={<TabLayout />}>
        <Route index element={<ItemsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="manage" element={<ManagePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppContent() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-bg">
        <p className="text-sm text-text-secondary">加载中…</p>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return <AuthenticatedApp />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
