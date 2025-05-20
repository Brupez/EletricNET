import { Battery, Plus, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import AdminChargerModal from '../../components/AdminChargerModal'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    ChartOptions,
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
)

interface Charger {
    id: string
    name: string
    location: string
    status: 'Active' | 'Inactive'
    type: string
    power: string
}

const AdminPage = () => {
    const [chargers, setChargers] = useState<Charger[]>([])
    const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null)
    const [modalMode, setModalMode] = useState<'edit' | 'delete'>('edit')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        fetch('/api/slots/chargers')
            .then(response => response.json())
            .then(slots => {
                const chargers = slots.map((slot: any) => ({
                    id: slot.id,
                    name: `Slot ${slot.id}`,
                    location: slot.station?.name || 'Unknown',
                    status: slot.reserved ? 'Inactive' : 'Active',
                    type: slot.chargingType,
                    power: slot.power,
                }))
                setChargers(chargers)
            })
            .catch(error => console.error('Error fetching chargers:', error))
    }, [])

    useEffect(() => {
        fetch('/api/users/total-users')
            .then(response => response.json())
            .then(data => setTotalUsers(data))
            .catch(error => console.error('Error fetching total users:', error));
    }, []);

    const handleEdit = (charger: Charger) => {
        setSelectedCharger(charger)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const handleDelete = (charger: Charger) => {
        setSelectedCharger(charger)
        setModalMode('delete')
        setIsModalOpen(true)
    }

    const handleModalConfirm = (updatedCharger?: Charger) => {
        if (modalMode === 'edit' && updatedCharger) {
            fetch('/api/slots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: updatedCharger.id,
                    chargingType: updatedCharger.type,
                    power: updatedCharger.power,
                    reserved: updatedCharger.status === 'Inactive',
                }),
            })
                .then(response => response.json())
                .then(data => {
                    setChargers(prev => prev.map(c => (c.id === updatedCharger.id ? data : c)))
                    console.log('Charger updated successfully')
                })
                .catch(error => console.error('Error updating charger:', error))
        } else if (modalMode === 'delete') {
            fetch(`/api/slots/${selectedCharger?.id}`, {
                method: 'DELETE',
            })
                .then(() => {
                    setChargers(prev => prev.filter(c => c.id !== selectedCharger?.id))
                    console.log('Charger deleted successfully')
                })
                .catch(error => console.error('Error deleting charger:', error))
        }
        setIsModalOpen(false)
    }

    const handleAdd = () => {
        setSelectedCharger(null)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const weeklyUsersData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'New Users',
                data: [30, 25, 35, 28, 22, 40, 32],
                backgroundColor: '#6366F1',
            },
            {
                label: 'Returning Users',
                data: [45, 38, 42, 50, 35, 55, 48],
                backgroundColor: '#A5B4FC',
            },
        ],
    }

    const weeklyUsersOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Weekly Users',
                align: 'start',
                font: {
                    size: 16,
                    weight: 'bold',
                },
                padding: {
                    bottom: 10,
                },
            },
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                },
                border: {
                    display: false,
                },
            },
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: true,
                },
            },
        },
    }

    const chargerTypeCounts = chargers.reduce(
        (acc, charger) => {
            acc[charger.type] = (acc[charger.type] || 0) + 1
            return acc
        },
        {} as Record<string, number>
    )

    const popularChargersData = {
        labels: Object.keys(chargerTypeCounts),
        datasets: [
            {
                label: 'Charger Types',
                data: Object.values(chargerTypeCounts),
                backgroundColor: ['#1E3A8A', '#60A5FA', '#E0E7FF'],
                borderColor: ['#1E3A8A', '#60A5FA', '#E0E7FF'],
                borderWidth: 1,
            },
        ],
    }

    const popularChargersOptions: ChartOptions<'pie'> = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Popular Chargers',
                align: 'start',
                font: {
                    size: 16,
                    weight: 'bold',
                },
                padding: {
                    bottom: 10,
                },
            },
            legend: {
                position: 'right',
                align: 'start',
                labels: {
                    usePointStyle: true,
                },
            },
        },
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-700">Total Chargers</h3>
                    <p className="text-3xl font-bold mt-2">{chargers.length}</p>
                </div>
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-700">Active Chargers</h3>
                    <p className="text-3xl font-bold mt-2">{chargers.filter(c => c.status === 'Active').length}</p>
                </div>
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
                    <p className="text-3xl font-bold mt-2">€1,500</p>
                    <p className="text-sm text-green-600 mt-1">+8% from last month</p>
                </div>
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">{totalUsers}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <Bar data={weeklyUsersData} options={weeklyUsersOptions} />
                </div>
                <div className="card">
                    {chargers.length > 0 ? (
                        <Pie data={popularChargersData} options={popularChargersOptions} />
                    ) : (
                        <p className="text-center text-gray-500">No data available for popular chargers.</p>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Battery size={24} className="text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">Charger Management</h2>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Charger
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Location</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Power</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {chargers.length > 0 ? (
                                chargers.map(charger => (
                                    <tr key={charger.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{charger.id}</td>
                                        <td className="px-6 py-4">{charger.name}</td>
                                        <td className="px-6 py-4">{charger.location}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${charger.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {charger.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{charger.type}</td>
                                        <td className="px-6 py-4">{charger.power}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleEdit(charger)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(charger)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        No chargers available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminChargerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                charger={selectedCharger}
                onConfirm={handleModalConfirm}
            />
        </div>
    )
}

export default AdminPage