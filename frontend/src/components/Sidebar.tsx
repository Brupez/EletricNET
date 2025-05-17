import { LayoutDashboard, Calendar, User, LogOut, ChevronDown, SmartphoneCharging } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '/src/assets/logo.svg'

interface SidebarProps {
    sidebarBgColor: string
    onLogout: () => void
    userRole?: 'admin' | 'user' | null
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarBgColor, onLogout, userRole }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [openMenus, setOpenMenus] = useState<string[]>([])

    const handleLogout = () => {
        onLogout()
        navigate('/login')
    }

    const handleLogoClick = () => {
        navigate('/')
    }

    const toggleMenu = (path: string) => {
        setOpenMenus(prev =>
            prev.includes(path)
                ? prev.filter(p => p !== path)
                : [...prev, path]
        )
    }

    const adminNavigationItems = [
        {
            icon: <LayoutDashboard size={24} />,
            text: 'Overview',
            path: '/admin',
        },
        {
            icon: <SmartphoneCharging size={24} />,
            text: 'Chargers',
            path: '/admin/chargers',
        },
    ]

    const userNavigationItems = [
        {
            icon: <LayoutDashboard size={24} />,
            text: 'Overview',
            path: '/',
            subItems: [
                { text: 'Chargers', path: '/map' },
            ]
        },
        {
            icon: <Calendar size={24} />,
            text: 'Bookings',
            path: '/bookings',
        },
    ]

    const navigationItems = userRole === 'admin' ? adminNavigationItems : userNavigationItems

    return (
        <aside className={`fixed left-0 top-0 h-screen w-64 text-white flex flex-col ${sidebarBgColor}`}>
            <div
                onClick={handleLogoClick}
                className="p-4 border-b border-white/20 flex justify-center items-center cursor-pointer"
            >
                <img
                    src={logo}
                    alt="logo"
                    className="h-20 w-auto"
                />
            </div>

            <nav className="p-4 flex-1">
                <ul className="space-y-2">
                    {navigationItems.map((item) => (
                        <li key={item.path}>
                            {item.subItems ? (
                                <button
                                    onClick={() => toggleMenu(item.path)}
                                    className="nav-link hover:bg-white/10 w-full flex justify-between items-center"
                                >
                                    <div className="flex items-center">
                                        {item.icon}
                                        <span className="ml-3">{item.text}</span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform duration-200 ${
                                            openMenus.includes(item.path) ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`nav-link hover:bg-white/10 w-full flex items-center ${
                                        location.pathname === item.path ? 'bg-white/10' : ''
                                    }`}
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.text}</span>
                                </Link>
                            )}
                            {item.subItems && openMenus.includes(item.path) && (
                                <ul className="ml-12 mt-2 space-y-2">
                                    {item.subItems.map((subItem) => (
                                        <li key={subItem.path}>
                                            <Link
                                                to={subItem.path}
                                                className={`block py-2 px-3 text-sm hover:text-green-200 transition-colors
                                                    ${location.pathname === subItem.path ? 'text-green-200' : ''}`}
                                            >
                                                {subItem.text}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="border-t border-white/20 p-4">
                <ul className="space-y-2">
                    <div className="flex items-center gap-3 pl-4 border-l border-white">
                        <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white">
                            <User size={24} />
                        </div>
                        <div className="block">
                            <p className="text-sm font-medium text-white">
                                {userRole === 'admin' ? 'Admin' : 'Carlos'}
                            </p>
                            <p className="text-xs text-green-100">
                                {userRole === 'admin' ? 'admin@gmail.com' : 'carlos@gmail.com'}
                            </p>
                        </div>
                    </div>
                    <li>
                        <button
                            onClick={handleLogout}
                            className="nav-link hover:bg-white/10 w-full flex items-center"
                        >
                            <LogOut size={24} />
                            <span className="ml-3">Logout</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    )
}

export default Sidebar