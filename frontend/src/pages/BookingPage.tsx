import { Calendar } from 'lucide-react'

const BookingPage = () => {
    return (
        <div className="card">
            <div className="flex items-center gap-3 mb-6">
                <Calendar size={24} className="text-green-700" />
                <h2 className="text-2xl font-bold text-gray-800">
                    Bookings
                </h2>
            </div>

            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Your bookings will appear here</p>
                </div>
            </div>
        </div>
    )
}


export default BookingPage
