import { Map as MapIcon } from 'lucide-react'

const MapPage = () => {
    return (
        <div className="card">
            <div className="flex items-center gap-3 mb-6">
                <MapIcon size={24} className="text-green-700" />
                <h2 className="text-2xl font-bold text-gray-800">
                    Charging Stations Map
                </h2>
            </div>

            <div className="bg-gray-100 rounded-lg h-[600px] flex items-center justify-center">
                {/* Map component will be added here */}
                <p className="text-gray-500">Map will be displayed here</p>
            </div>

            <div className="mt-4 flex gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-700 mb-2">Nearby Stations</h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-gray-500">List of nearby stations will appear here</p>
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-gray-700 mb-2">Filters</h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-gray-500">Filter options will appear here</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MapPage