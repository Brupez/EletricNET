import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ReservationResponseDTO {
    id: number
    stationName: string
    chargingType: string
    totalCost: number
    state: string
    createdAt: string
    userName: string
    userEmail: string
}

const ReservationModalAdmin = ({ reservation, onClose }: { reservation: ReservationResponseDTO, onClose: () => void }) => {
    return createPortal(
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-[400px] shadow-xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Reservation #{reservation.id}</h2>
                <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Station:</strong> {reservation.stationName}</p>
                    <p><strong>Type:</strong> {reservation.chargingType}</p>
                    <p><strong>Cost:</strong> €{reservation.totalCost.toFixed(2)}</p>
                    <p><strong>Status:</strong> {reservation.state}</p>
                    <p><strong>Created At:</strong> {new Date(reservation.createdAt).toLocaleString('pt-PT')}</p>
                    <p><strong>User Name:</strong> {reservation.userName}</p>
                    <p><strong>User Email:</strong> {reservation.userEmail}</p>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default ReservationModalAdmin
