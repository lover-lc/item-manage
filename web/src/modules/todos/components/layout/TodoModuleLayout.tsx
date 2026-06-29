import { Outlet } from 'react-router-dom'
import { useRealtimeTodos } from '../../../../shared/hooks/use-realtime'

export default function TodoModuleLayout() {
  useRealtimeTodos()

  return <Outlet />
}
