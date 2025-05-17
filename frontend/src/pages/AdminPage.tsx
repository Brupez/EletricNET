import { Battery, Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
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
    id: string;
    name: string;
    location: string;
    status: 'Active' | 'Inactive';
    type: string;
    power: string;
}

const AdminPage = () => {
    const [chargers] = useState<Charger[]>([
        { id: '001', name: 'Charger A', location: 'EDP Comercial', status: 'Active', type: 'Fast', power: '150 kW' },
        { id: '002', name: 'Charger B', location: 'Shell Station', status: 'Inactive', type: 'Ultra', power: '350 kW' },
        { id: '003', name: 'Charger C', location: 'Parking Lot X', status: 'Active', type: 'Normal', power: '50 kW' },
        { id: '004', name: 'Charger D', location: 'Shopping Mall Y', status: 'Active', type: 'SuperFast', power: '250 kW' },
        { id: '005', name: 'Charger E', location: 'Highway Rest Area Z', status: 'Inactive', type: 'Fast', power: '180 kW' },
        { id: '006', name: 'Charger F', location: 'City Center Plaza', status: 'Active', type: 'Ultra', power: '300 kW' },
        { id: '007', name: 'Charger G', location: 'Residential Area W', status: 'Active', type: 'Normal', power: '60 kW' },
    ])

    // Dummy data for Weekly Users chart
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

    const weeklyUsersOptions = {
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
                    drawBorder: false,
                },
            },
            x: {
                grid: {
                    display: false,
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

    const popularChargersOptions = {
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
            {/* Stats Cards */}
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
                    <h3 className="text-lg font-semibold text-gray-700">Active Users</h3>
                    <p className="text-3xl font-bold mt-2">320</p>
                    <p className="text-sm text-green-600 mt-1">+5% from last month</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <Bar data={weeklyUsersData} options={weeklyUsersOptions} />
                </div>
                <div className="card">
                    <Pie data={popularChargersData} options={popularChargersOptions} />
                </div>
            </div>

            {/* Chargers Table */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Battery size={24} className="text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">Charger Management</h2>
                    </div>
                    <button
                        className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled"
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
                        {chargers.map(charger => (
                            <tr key={charger.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{charger.id}</td>
                                <td className="px-6 py-4">{charger.name}</td>
                                <td className="px-6 py-4">{charger.location}</td>
                                <td className="px-6 py-4">
                                        <span className={`badge ${
                                            charger.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {charger.status}
                                        </span>
                                </td>
                                <td className="px-6 py-4">{charger.type}</td>
                                <td className="px-6 py-4">{charger.power}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            className="text-blue-600 hover:text-blue-800 disabled"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-800 disabled"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AdminPage