// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import BookingPage from './pages/BookingPage'
import ChargerDetails from './pages/ChargerDetails'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

const AppContent = () => {
    const location = useLocation()
    const isHomePage = location.pathname === '/'
    const isAdminPage = location.pathname.startsWith('/admin')
    const is404Page = location.pathname === '/404'

    return (
        <div className={`min-h-screen 'bg-gray-100'}`}>
            <Sidebar sidebarBgColor={isAdminPage ? 'bg-blue-900' : 'bg-green-900'}/>
            {!isHomePage && !isAdminPage && !is404Page && <Header />}
            <main className={`ml-64 ${isHomePage ? 'h-screen flex items-center justify-center' : 'pt-16'} ${isAdminPage ? 'pt-6' : ''} ${is404Page ? 'p-0' : 'p-6'}`}>
                <div className={`${isHomePage ? 'w-full max-w-3xl' : 'max-w-7xl mx-auto'}`}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/bookings" element={<BookingPage />} />
                        <Route path="/map/find" element={<MapPage />} />
                        <Route path="/map/favorites" element={<MapPage />} />
                        <Route path="/bookings/current" element={<BookingPage />} />
                        <Route path="/bookings/history" element={<BookingPage />} />
                        <Route path="/charger/:id" element={<ChargerDetails />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </main>
        </div>
    )
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    )
}

export default App