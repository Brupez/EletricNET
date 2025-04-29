import { LayoutDashboard, Calendar, User, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '/src/assets/logo.svg'

const Sidebar = () => {
    const location = useLocation()
    const [openMenus, setOpenMenus] = useState<string[]>([])

    const toggleMenu = (path: string) => {
        setOpenMenus(prev =>
            prev.includes(path)
                ? prev.filter(p => p !== path)
                : [...prev, path]
        )
    }


    const navigationItems = [
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

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#243E16] text-white flex flex-col">
            <div className="p-4 border-b border-[#243E16] flex justify-center items-center">
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
                                    className="nav-link hover:bg-green-700 w-full flex justify-between items-center"
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
                                    className="nav-link hover:bg-green-700 w-full flex items-center"
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

            <div className="border-t border-[#243E16] p-4">
                <ul className="space-y-2">
                    <div className="flex items-center gap-3 pl-4 border-l border-white">
                        <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white">
                            <User size={24} />
                        </div>
                        <div className="block">
                            <p className="text-sm font-medium text-white">Carlos</p>
                            <p className="text-xs text-green-100">carlos@gmail.com</p>
                        </div>
                    </div>
                    <li>
                        <button
                            onClick={() => {/* Add logout logic */}}
                            className="nav-link hover:bg-green-700 w-full flex items-center"
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