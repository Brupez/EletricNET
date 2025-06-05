import SidebarBase from './SidebarBase'
import {
  LayoutDashboard,
  Calendar
} from 'lucide-react'

const SidebarAdmin = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <SidebarBase
      sidebarBgColor="bg-blue-900"
      onLogout={onLogout}
      label="Admin"
      navigationItems={[
        { icon: <LayoutDashboard size={24} />, text: 'Overview', path: '/admin' },
        { icon: <Calendar size={24} />, text: 'Bookings', path: '/admin/bookings' }
      ]}
    />
  )
}

export default SidebarAdmin
