import { Calendar, Plus, History, Eye, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import {useLocation, useNavigate} from 'react-router-dom'

interface ReservationResponseDTO {
    id: number
    slotId: number
    stationLocation: string
    slotLabel?: string
    chargingType: string
    state: 'ACTIVE' | 'CANCELED' | 'COMPLETED'
    totalCost: number
    consumptionKWh: number
    startTime: string
  }  

const itemsPerPage = 5

const BASEURL = 'http://localhost:8081'

const BookingPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [bookings, setBookings] = useState<ReservationResponseDTO[]>([])
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [cancelId, setCancelId] = useState<number | null>(null)
    const [tooLateModalOpen, setTooLateModalOpen] = useState(false)

    const openCancelModal = (id: number, startTime: string) => {
        const now = new Date()
        const reservationTime = new Date(startTime)
        const diffInMs = reservationTime.getTime() - now.getTime()
        const diffInHours = diffInMs / (1000 * 60 * 60)

        if (diffInHours < 1) {
            setTooLateModalOpen(true)
            return
        }

        setCancelId(id)
        setCancelModalOpen(true)
    }

    const closeCancelModal = () => {
        setCancelModalOpen(false)
        setCancelId(null)
    }

    const confirmCancel = async () => {
        if (!cancelId) return
        const token = localStorage.getItem('jwt')
        const res = await fetch(`${BASEURL}/api/reservations/${cancelId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (res.ok) {
            closeCancelModal()
            await fetchBookings()
        } else {
            alert('Erro ao cancelar reserva')
        }
    }

    const fetchBookings = async () => {
        const token = localStorage.getItem('jwt')
        if (!token) {
            alert('Please login to view your bookings.')
            navigate('/login')
            return
        }

        const res = await fetch(`${BASEURL}/api/reservations/myReservations`, {
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

    useEffect(() => {
        fetchBookings()

        if (location.state?.newBooking) {
            setBookings(prev => [location.state.newBooking, ...prev])
        }
    }, [navigate])

    const handleAddBooking = () => {
        navigate('/')
    }

    const handleViewDetails = (reservationId: number) => {
        navigate(`/booking/${reservationId}`)
    }

    const BookingTable = ({
        title,
        data
    }: {
        title: string
        data: ReservationResponseDTO[]
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
                                {/*<th className="px-6 py-4">ID</th>*/}
                                <th className="px-6 py-4">Slot Name</th>
                                <th className="px-6 py-4">Slot Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Charging Type</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">KWh</th>
                                <th className="px-6 py-4">Start Time</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center text-gray-500 py-6">
                                        {title === 'Current Bookings'
                                            ? 'No current bookings found.'
                                            : 'No booking history found.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((res) => (
                                    <tr key={res.id} className="hover:bg-gray-50">
                                        {/*<td className="px-6 py-4">{res.id}</td>*/}
                                        <td className="px-6 py-4 font-medium text-gray-800">{res.slotLabel ?? '—'}</td>
                                        <td className="px-6 py-4">{res.stationLocation}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${res.state === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : res.state === 'CANCELED'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {res.state}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{res.chargingType}</td>
                                        <td className="px-6 py-4">€{res.totalCost.toFixed(2)}</td>
                                        <td className="px-6 py-4">{res.consumptionKWh} kWh</td>
                                        <td className="px-6 py-4">
                                            {new Date(res.startTime).toLocaleDateString('pt-PT')}
                                        </td>
                                        <td
                                            className={`px-6 py-4 ${res.state === 'ACTIVE' ? 'flex gap-3' : 'flex justify-center items-center'
                                                }`}
                                        >
                                            <button
                                                onClick={() => handleViewDetails(res.id)}
                                                className="text-green-700 hover:text-green-800"
                                                title="Ver detalhes da reserva"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {res.state === 'ACTIVE' && (
                                                <button
                                                    onClick={() => openCancelModal(res.id, res.startTime)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Cancelar reserva"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
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

                {cancelModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded shadow max-w-sm">
                            <h2 className="text-lg font-semibold mb-4">Confirm Cancellation</h2>
                            <p className="mb-4">Are you sure you want to cancel this booking?</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeCancelModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {tooLateModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded shadow max-w-sm">
                            <h2 className="text-lg font-semibold mb-4 text-red-600">Cancellation Not Allowed</h2>
                            <p className="mb-4 text-gray-700">
                                You can only cancel a reservation up to <strong>1 hour before</strong> the start time.
                            </p>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setTooLateModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
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