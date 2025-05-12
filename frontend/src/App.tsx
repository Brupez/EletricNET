import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import BookingPage from './pages/BookingPage'
import ChargerDetails from './pages/ChargerDetails'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

type UserRole = 'admin' | 'user' | null

interface ProtectedRouteProps {
    children: React.ReactElement
    isAuthenticated: boolean
    userRole?: UserRole
    requiredRole?: UserRole
}

const ProtectedRoute = ({ children, isAuthenticated, userRole, requiredRole }: ProtectedRouteProps) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/" replace />
    }

    return children
}

const AppContent = () => {
    const location = useLocation()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState<UserRole>(null)

    const isLoginPage = location.pathname === '/login'
    const isHomePage = location.pathname === '/'
    const isAdminPage = location.pathname.startsWith('/admin')

    const handleLogin = (email: string, password: string) => {
        // Mock authentication
        if (email === 'admin@gmail.com' && password === 'admin') {
            setIsAuthenticated(true)
            setUserRole('admin')
            return '/admin'
        } else if (email === 'user@gmail.com' && password === 'user') {
            setIsAuthenticated(true)
            setUserRole('user')
            return '/'
        }
        return null
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
        setUserRole(null)
    }

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/login" element={
                        <LoginPage onLogin={handleLogin} />
                    } />
                </Routes>
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-gray-100`}>
            <Sidebar
                sidebarBgColor={isAdminPage ? 'bg-blue-900' : 'bg-green-900'}
                onLogout={handleLogout}
            />
            {!isHomePage && !isAdminPage && <Header />}
            <main className={`ml-64 ${isHomePage ? 'h-screen flex items-center justify-center' : 'pt-16'} ${isAdminPage ? 'pt-6' : ''}`}>
                <div className={`${isHomePage ? 'w-full max-w-3xl' : 'max-w-7xl mx-auto'}`}>
                    <Routes>
                        <Route path="/" element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <HomePage />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="admin">
                                <AdminPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/map" element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <MapPage />
                            </ProtectedRoute>
                        } />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </main>
        </div>
    )
}

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    )
}

export default App