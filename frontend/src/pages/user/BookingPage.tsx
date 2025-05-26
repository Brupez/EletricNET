import { Calendar, Plus, History, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const itemsPerPage = 5

const BookingPage = () => {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState<any[]>([])

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem('jwt')
            if (!token) {
                alert('Please login to view your bookings.')
                navigate('/login')
                return
            }
    
            const res = await fetch('http://localhost:8081/api/reservations/myReservations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setBookings(data)
            } else {
                console.error('Failed to fetch bookings')
            }
        }
        fetchBookings()
    }, [navigate])    

    const handleAddBooking = () => {
        navigate('/')
    }

    const handleViewDetails = (id: string) => {
        navigate(`/charger/${id}`)
    }

    const BookingTable = ({
        title,
        data
    }: {
        title: string
        data: any[]
    }) => {
        const [currentPage, setCurrentPage] = useState(1)

        const paginatedData = data.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )

        const totalPages = Math.ceil(data.length / itemsPerPage)

        return (
            <div className="card w-full mt-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {title === 'Current Bookings' ? (
                            <Calendar size={24} className="text-green-700" />
                        ) : (
                            <History size={24} className="text-green-700" />
                        )}
                        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                        {title === 'Current Bookings' && (
                            <button
                                onClick={handleAddBooking}
                                className="btn bg-[#243E16] hover:bg-green-700 text-white flex items-center gap-2 ml-4"
                            >
                                <Plus size={20} /> Add Booking
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Charger Station</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Charging Type</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">KWh</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-gray-500 py-6">
                                        {title === 'Current Bookings'
                                            ? 'No current bookings found.'
                                            : 'No booking history found.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((res) => (
                                    <tr key={res.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{res.id}</td>
                                        <td className="px-6 py-4">{res.slotId}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${
                                                res.state === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-800'
                                                    : res.state === 'CANCELED'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {res.state}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{res.chargingType || '-'}</td>
                                        <td className="px-6 py-4">{res.totalCost?.toFixed(2)} €</td>
                                        <td className="px-6 py-4">{res.consumptionKWh} kWh</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleViewDetails(res.slotId)}
                                                className="text-green-700 hover:text-green-800 flex items-center gap-1"
                                            >
                                                <Eye size={16} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {data.length > itemsPerPage && (
                    <div className="mt-4 flex items-center justify-between px-4 text-sm text-gray-600">
                        <div>
                            Showing {paginatedData.length} of {data.length} results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const currentBookings = bookings.filter((b) => b.state === 'ACTIVE')
    const bookingHistory = bookings.filter((b) => b.state !== 'ACTIVE')

    return (
        <>
            <BookingTable title="Current Bookings" data={currentBookings} />
            <BookingTable title="Booking History" data={bookingHistory} />
        </>
    )
}

export default BookingPage
