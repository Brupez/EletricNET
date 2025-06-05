import SidebarBase from './SidebarBase'
import {
    LayoutDashboard,
    Calendar
} from 'lucide-react'

const SidebarUser = ({ onLogout }: { onLogout: () => void }) => {
    return (
        <SidebarBase
            sidebarBgColor="bg-green-900"
            onLogout={onLogout}
            label="Client"
            navigationItems={[
                {
                    icon: <LayoutDashboard size={24} />,
                    text: 'Charging Stations',
                    path: '/',
                    subItems: [{ text: 'Search chargers', path: '/' }, { text: 'Your stats', path: '/details' }]
                },
                {
                    icon: <Calendar size={24} />,
                    text: 'Bookings',
                    path: '/bookings'
                }
            ]}
        />
    )
}

export default SidebarUser
