import {
  User,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import logo from '../assets/logo.svg'

interface SubItem {
  text: string
  path: string
}

interface NavigationItem {
  icon: JSX.Element
  text: string
  path: string
  subItems?: SubItem[]
}

interface SidebarBaseProps {
  sidebarBgColor: string
  onLogout: () => void
  navigationItems: NavigationItem[]
  label: string
}

const SidebarBase: React.FC<SidebarBaseProps> = ({ sidebarBgColor, onLogout, navigationItems, label }) => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const toggleMenu = (path: string) => {
    setOpenMenus(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    )
  }

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  const handleLogoClick = () => {
    navigate(user?.role === 'admin' ? '/admin' : '/')
  }

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 text-white flex flex-col ${sidebarBgColor}`}>
      <button
        onClick={handleLogoClick}
        className="p-4 border-b border-white/20 flex justify-center items-center w-full gap-3"
      >
        <img src={logo} alt="logo" className="h-[5rem] w-[11rem]" />
        <span className="text-lg font-semibold text-white tracking-wide">{label}</span>
      </button>

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
                    className={`transition-transform duration-200 ${openMenus.includes(item.path) ? 'rotate-180' : ''}`}
                  />
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`nav-link hover:bg-white/10 w-full flex items-center ${location.pathname === item.path ? 'bg-white/10' : ''}`}
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
                        className={`block py-2 px-3 text-sm hover:text-green-200 transition-colors ${location.pathname === subItem.path ? 'text-green-200' : ''}`}
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
        <div className="flex items-center gap-3 pl-4 border-l border-white">
          <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
            <p className="text-xs text-green-100">{user?.email || 'No email'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="mt-4 nav-link hover:bg-white/10 w-full flex items-center">
          <LogOut size={24} />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default SidebarBase
