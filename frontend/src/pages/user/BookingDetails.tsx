import { Battery, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

interface ReservationDetails {
  id: number
  userName: string
  userEmail: string
  stationName: string
  state: 'ACTIVE' | 'CANCELED' | 'COMPLETED'
  chargingType: string
  totalCost: number
  consumptionKWh: number
  startDate: string
  startTime: string
  durationMinutes: number
  createdAt: string
}

const BookingDetails = () => {
  const { id } = useParams()
  const [booking, setBooking] = useState<ReservationDetails | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      const token = localStorage.getItem('jwt')
      const res = await fetch(`http://localhost:8081/api/reservations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      setBooking(data)
    }

    fetchBooking()
  }, [id])

  if (!booking) return <div className="p-6">A carregar detalhes da reserva...</div>

  return (
    <div className="card w-full h-full mt-8 mb-8">
      <div className="flex justify-between">
        <div className="flex-1 pr-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Battery size={24} className="text-green-700" />
              <h2 className="text-2xl font-bold text-gray-800">
                {booking.stationName}
                <span className={`ml-3 badge ${
                  booking.state === 'ACTIVE'
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
              <span>ID da Reserva: {booking.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-6 p-4">
              <div>
                <table className="w-full text-lg">
                  <tbody className="space-y-2">
                    <tr>
                      <th className="py-2 text-gray-600">Cliente:</th>
                      <td className="py-2 font-medium">{booking.userName} ({booking.userEmail})</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Tipo de Carregamento:</th>
                      <td className="py-2 font-medium">{booking.chargingType}</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">KWh Consumidos:</th>
                      <td className="py-2 font-medium">{booking.consumptionKWh} kWh</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Preço Total:</th>
                      <td className="py-2 font-medium">€{booking.totalCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Data de Início:</th>
                      <td className="py-2 font-medium">{booking.startDate}</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Hora de Início:</th>
                      <td className="py-2 font-medium">{booking.startTime}</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Duração:</th>
                      <td className="py-2 font-medium">{booking.durationMinutes} minutos</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600">Criado em:</th>
                      <td className="py-2 font-medium">{new Date(booking.createdAt).toLocaleString('pt-PT')}</td>
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
                <span className="text-gray-500">Cliente</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gray-300 relative z-10"></div>
                <span className="text-gray-500">Carregamento</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gray-300 relative z-10"></div>
                <span className="text-gray-500">Preço</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gray-300 relative z-10"></div>
                <span className="text-gray-500">Início</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails
