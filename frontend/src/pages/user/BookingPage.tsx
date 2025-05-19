import { Calendar, Plus, ChevronUp, ChevronDown, History, Eye } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type SortDirection = 'asc' | 'desc' | null
type SortField = 'id' | 'station' | 'category' | 'price' | 'date' | 'status' | null

const BookingPage = () => {
    const navigate = useNavigate()
    const [sortField, setSortField] = useState<SortField>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5
    const totalPages = 5

    const handleAddBooking = () => {
        navigate('/')
    }

    const handleViewDetails = (id: string) => {
        navigate(`/charger/${id}`)
    }

    const Pagination = () => (
        <div className="mt-4 flex items-center justify-between px-4">
            <div className="text-sm text-gray-600">
                Showing {itemsPerPage} of {itemsPerPage * totalPages} results
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    )

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronUp className="opacity-0 group-hover:opacity-50" size={16} />
        return sortDirection === 'asc' ?
            <ChevronUp className="text-green-700" size={16} /> :
            <ChevronDown className="text-green-700" size={16} />
    }

    const BookingTable = () => {
        const bookings = [
            { id: '001', station: 'Station A', status: 'Active', category: 'Fast', price: '$25.00', date: '2024-03-20 14:30' },
            { id: '002', station: 'Station B', status: 'Pending', category: 'Ultra', price: '$35.00', date: '2024-03-21 10:15' },
            { id: '003', station: 'Station C', status: 'Completed', category: 'Fast', price: '$28.00', date: '2024-03-19 16:45' },
        ]

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer group" onClick={() => handleSort('id')}>
                            ID <SortIcon field="id" />
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer group" onClick={() => handleSort('station')}>
                            Charger Station <SortIcon field="station" />
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer group" onClick={() => handleSort('status')}>
                            Status <SortIcon field="status" />
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer group" onClick={() => handleSort('category')}>
                            Category <SortIcon field="category" />
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer group" onClick={() => handleSort('price')}>
                            Price <SortIcon field="price" />
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer group" onClick={() => handleSort('date')}>
                            Date <SortIcon field="date" />
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {bookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">{booking.id}</td>
                            <td className="px-6 py-4">{booking.station}</td>
                            <td className="px-6 py-4">
                                    <span className={`badge ${
                                        booking.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                        {booking.status}
                                    </span>
                            </td>
                            <td className="px-6 py-4">{booking.category}</td>
                            <td className="px-6 py-4">{booking.price}</td>
                            <td className="px-6 py-4">{booking.date}</td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => handleViewDetails(booking.id)}
                                    className="text-green-700 hover:text-green-800 flex items-center gap-1"
                                >
                                    <Eye size={16} />
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8 mt-8">
                <div className="card w-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Calendar size={24} className="text-green-700" />
                            <h2 className="text-2xl font-bold text-gray-800">
                                Current Bookings
                            </h2>
                            <button
                                onClick={handleAddBooking}
                                className="btn bg-[#243E16] hover:bg-green-700 text-white flex items-center gap-2 ml-4"
                            >
                                <Plus size={20} />
                                Add Booking
                            </button>
                        </div>
                    </div>
                    <BookingTable />
                </div>
            </div>

            <div className="card w-full mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <History size={24} className="text-green-700" />
                    <h2 className="text-2xl font-bold text-gray-800">
                        Booking History
                    </h2>
                </div>
                <BookingTable />
                <Pagination />
            </div>
        </>
    )
}

export default BookingPage