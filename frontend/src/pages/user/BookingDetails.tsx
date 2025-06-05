import { Battery, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

interface ReservationDetails {
  id: number
  userName: string
  userEmail: string
  stationLocation: string
  slotLabel: string
  state: 'ACTIVE' | 'CANCELED' | 'COMPLETED'
  chargingType: string
  totalCost: number
  consumptionKWh: number
  startTime: string
  durationMinutes: number
  createdAt: string
}

// const BASEURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const BookingDetails = () => {
  const { id } = useParams()
  const [booking, setBooking] = useState<ReservationDetails | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      const token = localStorage.getItem('jwt')
      const res = await fetch(`/api/reservations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      setBooking(data)
    }

    fetchBooking()
  }, [id])

  if (!booking) return <div className="p-6">Loading reservation details...</div>

  return (
    <div className="card w-full h-full mt-8 mb-8">
      <div className="flex justify-between">
        <div className="flex-1 pr-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Battery size={24} className="text-green-700" />
              <h2 className="text-2xl font-bold text-gray-800">
                {booking.slotLabel}
                <span className={`ml-3 badge ${booking.state === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : booking.state === 'CANCELED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {booking.state}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={20} />
              <span>{booking.stationLocation}</span>
            </div>

            <div className="grid grid-cols-2 gap-6 p-4">
              <div>
                <table className="w-full text-lg">
                  <tbody className="space-y-2">
                    <tr>
                      <th className="py-2 text-gray-600">Client:</th>
                      <td className="py-2 font-medium">{booking.userName} ({booking.userEmail})</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Charging Type:</th>
                      <td className="py-2 font-medium">{booking.chargingType}</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Energy Consumed:</th>
                      <td className="py-2 font-medium">{booking.consumptionKWh} kWh</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Total Cost:</th>
                      <td className="py-2 font-medium">€{booking.totalCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Start Date:</th>
                      <td className="py-2 font-medium">
                        {new Date(booking.startTime).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Start Time:</th>
                      <td className="py-2 font-medium">
                        {new Date(booking.startTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Duration:</th>
                      <td className="py-2 font-medium">{booking.durationMinutes} minutes</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Created At:</th>
                      <td className="py-2 font-medium">{new Date(booking.createdAt).toLocaleString('en-GB')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="w-64 flex flex-col mt-32">
          <div className="relative">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-300"></div>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gray-300 relative z-10"></div>
                <span className="text-gray-500">Client</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gray-300 relative z-10"></div>
                <span className="text-gray-500">Charging</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gray-300 relative z-10"></div>
                <span className="text-gray-500">Pricing</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gray-300 relative z-10"></div>
                <span className="text-gray-500">Start</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails
