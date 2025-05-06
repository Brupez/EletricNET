import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import BookingPage from './pages/BookingPage'

const AppContent = () => {
    const location = useLocation()
    const isHomePage = location.pathname === '/'

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar />
            {!isHomePage && <Header />}
            <main className={`ml-64 ${isHomePage ? 'h-screen flex items-center justify-center' : 'pt-16'} p-6`}>
                <div className={`${isHomePage ? 'w-full max-w-3xl' : 'max-w-7xl mx-auto'}`}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/bookings" element={<BookingPage />} />
                        <Route path="/map/find" element={<MapPage />} />
                        <Route path="/map/favorites" element={<MapPage />} />
                        <Route path="/bookings/current" element={<BookingPage />} />
                        <Route path="/bookings/history" element={<BookingPage />} />
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