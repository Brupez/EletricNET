// src/pages/NotFoundPage.tsx
import { AlertTriangle } from 'lucide-react'

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <AlertTriangle size={64} className="text-green-800 mb-6" />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">Page not found</p>
            <p className="text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
        </div>
    )
}

export default NotFoundPage