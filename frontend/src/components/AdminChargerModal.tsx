import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import LocationModalPage from './LocationModalPage';


interface Charger {
    id: string
    name: string
    location: string
    status: 'Active' | 'Inactive'
    type: string
    power: string
    latitude?: number
    longitude?: number
}

interface AdminChargerModalProps {
    isOpen: boolean
    onClose: () => void
    mode: 'create' | 'edit' | 'delete'
    charger: Charger | null
    onConfirm: (charger?: Charger) => void
    errorMessage?: string
}

const AdminChargerModal = ({ isOpen, onClose, mode, charger, onConfirm, errorMessage }: AdminChargerModalProps) => {
    const [formData, setFormData] = useState<Charger>({
        id: '',
        name: '',
        location: '',
        status: 'Active',
        type: '',
        power: ''
    })

    const chargingTypes = ['NORMAL', 'FAST', 'ULTRA_FAST']
    const [showMap, setShowMap] = useState(false)

    useEffect(() => {
        if (mode == 'edit' && charger) {
            setFormData(charger)
        } else if (mode == 'create') {
            setFormData({
                id: '',
                name: '',
                location: '',
                status: 'Active',
                type: '',
                power: ''
            })
        }
    }, [mode, charger])

    if (!isOpen) return null

    const cleanForm = () => {
        setFormData({
            id: '',
            name: '',
            location: '',
            status: 'Active',
            type: '',
            power: ''
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const payload: Partial<Charger> = { ...formData }

        if (mode === 'create') {
            delete payload.id
        }

        onConfirm(payload as Charger)
        cleanForm()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-screen-md p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {mode === 'create' && 'Create Charger'}
                    {mode === 'edit' && 'Edit Charger'}
                    {mode === 'delete' && 'Delete Charger'}
                </h2>

                {mode === 'delete' ? (
                    <div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete charger "{charger?.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm()
                                    onClose()
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.location}
                                        readOnly
                                        placeholder="Escolhe no mapa"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowMap(true)}
                                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        title="Open Map"
                                    >
                                        📍 Map
                                    </button>
                                </div>
                                {formData.latitude && formData.longitude && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Selected coords: {formData.latitude.toFixed(5)},{" "}
                                        {formData.longitude.toFixed(5)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="" disabled>Select charging type</option>
                                    {chargingTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Power
                                </label>
                                <input
                                    type="text"
                                    value={formData.power}
                                    onChange={(e) => setFormData(prev => ({ ...prev, power: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="text-red-600 mt-4 font-semibold">{errorMessage}</p>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}

                {showMap && (
                    <LocationModalPage
                        onClose={() => setShowMap(false)}
                        onSelect={(lat, lng, placeName) => {
                            setFormData(prev => ({
                                ...prev,
                                latitude: lat,
                                longitude: lng,
                                location: placeName ?? prev.location,
                            }));
                            setShowMap(false);
                        }}
                    />
                )}

            </div>
        </div>
    )
}

export default AdminChargerModal