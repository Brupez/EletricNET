import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import BookingPage from './pages/BookingPage'

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <Header />
                <main className="ml-64 pt-16 p-6">
                    <div className="max-w-7xl mx-auto">
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
        </Router>
    )
}

export default App