import { Battery, MapPin } from 'lucide-react'
import { useState } from 'react'
import BookingModal from '../../components/BookingModal.tsx'
import { useParams, useLocation } from 'react-router-dom'

interface LocationState {
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    isOpen: boolean;
    rating?: number;
    businessStatus?: string;
    openingHoursText?: string[];
}

const ChargerDetails = () => {
    const { id } = useParams()
    const location = useLocation()
    const markerData = location.state as LocationState

    const [isModalOpen, setIsModalOpen] = useState(false)


    const chargerDetails = {
        id: id,
        name: markerData?.name,
        location: markerData?.location,
        rating: markerData?.rating,
        type: 'Fast Charging Station',
        power: '150 kW',
        status: markerData?.businessStatus === 'OPERATIONAL' ? 'Available' : 'Unavailable',
        pricePerKwh: '$0.25',
        operatingHours: markerData?.openingHoursText?.join('\n'),
        coordinates: {
            lat: markerData?.latitude,
            lng: markerData?.longitude
        }
    }

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
                                        <th className="py-2 text-gray-600">Type:</th>
                                        <td className="py-2 font-medium">{chargerDetails.type}</td>
                                    </tr>
                                    <tr>
                                        <th className="py-2 text-gray-600">Power Output:</th>
                                        <td className="py-2 font-medium">{chargerDetails.power}</td>
                                    </tr>
                                    <tr>
                                        <th className="py-2 text-gray-600">Price per kWh:</th>
                                        <td className="py-2 font-medium">{chargerDetails.pricePerKwh}</td>
                                    </tr>
                                    <tr>
                                        <th className="py-2 text-gray-600">Operating Hours:</th>
                                        <td className="py-2 font-medium">{chargerDetails.operatingHours}</td>
                                    </tr>
                                    {chargerDetails.rating && (
                                        <tr>
                                            <th className="py-2 text-gray-600">Rating:</th>
                                            <td className="py-2 font-medium">{chargerDetails.rating.toFixed(1)}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="py-2 text-gray-600">Latitude:</td>
                                        <td className="py-2 font-medium">{chargerDetails.coordinates.lat}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 text-gray-600">Longitude:</td>
                                        <td className="py-2 font-medium">{chargerDetails.coordinates.lng}</td>
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