import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import HomePage from './pages/user/HomePage.tsx'
import MapPage from './pages/user/MapPage.tsx'
import BookingPage from './pages/user/BookingPage.tsx'
import ChargerDetails from './pages/user/ChargerDetails.tsx'
import AdminPage from './pages/admin/AdminPage.tsx'
import AdminChargersPage from './pages/admin/AdminChargersPage.tsx'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import { jwtDecode } from 'jwt-decode'

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
    const navigate = useNavigate()
    const location = useLocation()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState<UserRole>(null)

    const isLoginPage = location.pathname === '/login'
    const isHomePage = location.pathname === '/'
    const isAdminPage = location.pathname.startsWith('/admin')

    useEffect(() => {
        const token = localStorage.getItem('jwt')
        if (token) {
            try {
                const decoded: any = jwtDecode(token)
                const now = Date.now() / 1000
                if (decoded.exp && decoded.exp < now) {
                    localStorage.removeItem('jwt')
                    return
                }
    
                const role = decoded.role?.toLowerCase().includes('admin') ? 'admin' : 'user'
                setIsAuthenticated(true)
                setUserRole(role)
            } catch {
                localStorage.removeItem('jwt')
            }
        }
    }, [])    
    

    const handleLogin = async (email: string, password: string): Promise<string | null> => {
        try {
            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                body: JSON.stringify({ email, password })
            })
    
            if (!response.ok) return null
    
            const data = await response.json()
            localStorage.setItem('jwt', data.token)
    
            const payload: any = jwtDecode(data.token)
            const role = payload.role?.toLowerCase().includes('admin') ? 'admin' : 'user'
    
            setIsAuthenticated(true)
            setUserRole(role)
    
            return role === 'admin' ? '/admin' : '/'
        } catch (err) {
            console.error('Erro ao fazer login:', err)
            return null
        }
    }    
    

    const handleLogout = () => {
        setIsAuthenticated(false)
        setUserRole(null)
        localStorage.removeItem('jwt')
        navigate('/')
    }

    if (isLoginPage && isAuthenticated) {
        return <Navigate to={userRole === 'admin' ? '/admin' : '/'} replace />
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
                userRole={userRole}
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
                        <Route path="/admin/chargers" element={
                            <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="admin">
                                <AdminChargersPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/map" element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <MapPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/bookings" element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <BookingPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/chargerDetails" element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <ChargerDetails />
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