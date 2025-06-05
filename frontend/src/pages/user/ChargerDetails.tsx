import { Battery, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import BookingModal from '../../components/BookingModal.tsx'
import { useParams, useLocation } from 'react-router-dom'
import { getAddressFromCoords } from '../../utils/geocodeUtils'

interface LocationState {
  name: string
  location: string
  latitude: number
  longitude: number
  isExternal?: boolean
  isOpen: boolean
  rating?: number
  businessStatus?: string
  openingHoursText?: string[]
}

const BASEURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const ChargerDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chargerDetails, setChargerDetails] = useState<any | null>(null)
  const [reservations, setReservations] = useState<any[]>([])

  useEffect(() => {
    const markerData = location.state as LocationState & { isExternal?: boolean }

    const loadExternalDetails = () => {
      setChargerDetails({
        id,
        name: markerData.name,
        location: markerData.location,
        type: 'Fast Charging Station',
        power: '150 kW',
        status: markerData?.businessStatus === 'OPERATIONAL' ? 'Available' : 'Unavailable',
        pricePerKwh: '$0.25',
        operatingHours: markerData?.openingHoursText?.join('\n'),
        coordinates: {
          lat: markerData.latitude,
          lng: markerData.longitude
        }
      });
    };

    const fetchInternalDetails = async () => {
      try {
        const res = await fetch(`${BASEURL}/api/slots/${id}`);
        if (!res.ok) throw new Error('Failed to fetch slot data');
        const data = await res.json();

        const address = await getAddressFromCoords(data.latitude, data.longitude);

        console.log("Charger ID:", id);

        setChargerDetails({
          id: data.id,
          name: data.name ?? 'Unnamed',
          location: address,
          type: data.chargingType?.charAt(0) + data.chargingType?.slice(1).toLowerCase(),
          power: data.power ? `${data.power} kW` : 'Unknown',
          status: data.reserved ? 'Occupied' : 'Available',
          pricePerKwh: data.pricePerKwh ? `€${data.pricePerKwh.toFixed(2)}` : '—',
          operatingHours: '24/7',
          connectorType: '—',
          lastMaintenance: '—',
          coordinates: {
            lat: data.latitude,
            lng: data.longitude
          }
        });

        const reservationsRes = await fetch(`${BASEURL}/api/reservations/slot/${id}/active`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
          }
        })

        if (reservationsRes.ok) {
          const resData = await reservationsRes.json()
          console.log("Fetched reservations:", resData);
          setReservations(resData)
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (markerData?.isExternal) {
      loadExternalDetails();
    } else {
      fetchInternalDetails();
    }
  }, [id, location.state]);

  if (!chargerDetails) return <div className="p-6">Loading charger details...</div>

  return (
    <div className="card w-full h-full mt-8 mb-8">
      <div className="flex justify-between">
        <div className="flex-1 pr-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Battery size={24} className="text-green-700" />
              <h2 className="text-2xl font-bold text-gray-800">
                {chargerDetails.name}
                <span className="ml-3 badge badge-success">{chargerDetails.status}</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={20} />
              <span>{chargerDetails.location}</span>
            </div>

            <div className="grid grid-cols-2 gap-6 p-4">
              <div>
                <table className="w-full text-lg">
                  <tbody className="space-y-2">
                    <tr>
                      <th className="py-2 text-gray-600 text-left">Type:</th>
                      <td className="py-2 font-medium">{chargerDetails.type}</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600 text-left">Power Output:</th>
                      <td className="py-2 font-medium">{chargerDetails.power}</td>
                    </tr>
                    {chargerDetails.pricePerKwh && chargerDetails.pricePerKwh !== '—' && (
                      <tr>
                        <th className="py-2 text-gray-600 text-left">Price per kWh:</th>
                        <td className="py-2 font-medium">{chargerDetails.pricePerKwh}</td>
                      </tr>
                    )}
                    <tr>
                      <th className="py-2 text-gray-600 text-left">Operating Hours:</th>
                      <td className="py-2 font-medium">{chargerDetails.operatingHours}</td>
                    </tr>
                    {chargerDetails.connectorType && chargerDetails.connectorType !== '—' && (
                      <tr>
                        <th className="py-2 text-gray-600 text-left">Connector Type:</th>
                        <td className="py-2 font-medium">{chargerDetails.connectorType}</td>
                      </tr>
                    )}
                    {chargerDetails.lastMaintenance && chargerDetails.lastMaintenance !== '—' && (
                      <tr>
                        <th className="py-2 text-gray-600 text-left">Last Maintenance:</th>
                        <td className="py-2 font-medium">{chargerDetails.lastMaintenance}</td>
                      </tr>
                    )}
                    <tr>
                      <th className="py-2 text-gray-600 text-left">Latitude:</th>
                      <td className="py-2 font-medium">{chargerDetails.coordinates.lat}</td>
                    </tr>
                    <tr>
                      <th className="py-2 text-gray-600 text-left">Longitude:</th>
                      <td className="py-2 font-medium">{chargerDetails.coordinates.lng}</td>
                    </tr>
                    {chargerDetails.pricePerKwh !== '—' && (
                      <tr>
                        <th className="py-2 text-gray-600 text-left">Promotions:</th>
                        <td className="py-2 font-medium">—</td>
                      </tr>
                    )}
                    <tr>
                      <th className="py-2 text-gray-600 text-left">Payment:</th>
                      <td className="py-2 font-medium">Card / App</td>
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
                <span className="text-gray-500">Type</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gray-300 relative z-10"></div>
                <span className="text-gray-500">Power</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gray-300 relative z-10"></div>
                <span className="text-gray-500">Price</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gray-300 relative z-10"></div>
                <span className="text-gray-500">Status</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {reservations.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Active Reservations</h3>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-center align-middle">User</th>
                <th className="border border-gray-300 px-4 py-2 text-center align-middle">Start Time</th>
                <th className="border border-gray-300 px-4 py-2 text-center align-middle">Duration</th>
                <th className="border border-gray-300 px-4 py-2 text-center align-middle">kWh</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td className="border border-gray-300 px-4 py-2 text-center align-middle">
                    {r.userName ?? `User #${r.userId}`}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center align-middle">
                    {new Date(r.startTime).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center align-middle">
                    {r.durationMinutes} min
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center align-middle">
                    {r.consumptionKWh} kWh
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn bg-[#243E16] hover:bg-green-700 text-white px-8 py-3 text-lg"
        >
          Book Now
        </button>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chargerDetails={{
          id: chargerDetails.id,
          name: chargerDetails.name,
          pricePerKwh: chargerDetails.pricePerKwh,
          type: chargerDetails.type
        }}
      />
    </div>
  )
}

export default ChargerDetails