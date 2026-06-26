import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import TabLayout from './components/layout/TabLayout'
import { useSeedUserDefaults } from './hooks/use-seed'
import ItemDetailPage from './pages/ItemDetailPage'
import ItemFormPage from './pages/ItemFormPage'
import ItemsPage from './pages/ItemsPage'
import ManagePage from './pages/ManagePage'
import SearchPage from './pages/SearchPage'

const queryClient = new QueryClient()

function AppRoutes() {
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  )
}

export default App
