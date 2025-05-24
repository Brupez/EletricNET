import SidebarBase from './SidebarBase'
import {
  LayoutDashboard,
  Calendar,
  SmartphoneCharging
} from 'lucide-react'

const SidebarAdmin = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <SidebarBase
      sidebarBgColor="bg-blue-900"
      onLogout={onLogout}
      navigationItems={[
        { icon: <LayoutDashboard size={24} />, text: 'Overview', path: '/admin' },
        { icon: <SmartphoneCharging size={24} />, text: 'Chargers', path: '/admin/chargers' },
        { icon: <Calendar size={24} />, text: 'Bookings', path: '/admin/bookings' }
      ]}
    />
  )
}

export default SidebarAdmin
