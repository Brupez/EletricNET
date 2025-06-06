import { Battery, Plus, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import AdminChargerModal from '../../components/AdminChargerModal'
import { PlaceResult } from "../../utils/types";
import { loadGoogleMapsApi } from '../../utils/loadGoogleMapsApi'

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
    latitude?: number
    longitude?: number
}

interface Place extends PlaceResult {
    geometry: {
        location: google.maps.LatLng;
    };
    place_id: string;
    types?: string[];
    name: string;
    vicinity?: string;
}

// const BASEURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const AdminPage = () => {
    const [chargers, setChargers] = useState<Charger[]>([])
    const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [totalUsers, setTotalUsers] = useState(0);

    const [errorMessage, setErrorMessage] = useState('')

    const [searchQuery, setSearchQuery] = useState('');
    const [externalChargers, setExternalChargers] = useState<Place[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [currentMonthRevenue, setCurrentMonthRevenue] = useState<number | null>(null);

    const [loadingRevenue, setLoadingRevenue] = useState(true);

    useEffect(() => {
        fetch(`/api/slots/chargers`, {
            credentials: "include",
        })
            .then(response => response.json())
            .then(slots => {
                const chargers = slots.map((slot: any) => ({
                    id: slot.id,
                    name: slot.name ?? `Slot ${slot.id}`,
                    location: slot.station?.name ?? 'Unknown',
                    status: slot.station?.status === 'UNAVAILABLE' ? 'Inactive' : 'Active',
                    type: slot.chargingType,
                    power: slot.power,
                }))
                setChargers(chargers)
            })
            .catch(error => console.error('Error fetching chargers:', error))
    }, [])

    useEffect(() => {
        fetch(`/api/users/total-users`, {
            credentials: "include",
        })
            .then(response => response.json())
            .then(data => setTotalUsers(data))
            .catch(error => console.error('Error fetching total users:', error));
    }, []);

    useEffect(() => {
        fetch(`/api/reservations/admin/stats`, {
            credentials: "include",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => setCurrentMonthRevenue(data.currentMonthRevenue))
            .catch(error => console.error('Error fetching revenue:', error));
    }, []);

    useEffect(() => {
        fetch(`/api/reservations/admin/stats`, {
            credentials: "include",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => setCurrentMonthRevenue(data.currentMonthRevenue))
            .catch(() => setCurrentMonthRevenue(null))
            .finally(() => setLoadingRevenue(false));
    }, []);

    const formatExternalToCharger = (place: Place): Charger => ({
        id: place.place_id,
        name: place.name,
        location: place.vicinity ?? 'Unknown',
        status: 'Active',
        type: 'EXTERNAL',
        power: '-',
    });

    const searchNearbyChargers = async (address: string): Promise<Place[]> => {
        await loadGoogleMapsApi();
        const { google } = window as any;

        const map = new google.maps.Map(document.createElement('div'));

        const geocoder = new google.maps.Geocoder();

        return new Promise((resolve, reject) => {
            geocoder.geocode({ address }, (results: any, status: string) => {
                if (status !== 'OK' || !results[0]) {
                    reject(new Error('Geocode failed: ' + status));
                    return;
                }

                const location = results[0].geometry.location;

                const service = new google.maps.places.PlacesService(map);
                service.nearbySearch(
                    {
                        location,
                        radius: 5000,
                        type: 'charging_station',
                    },
                    (places: Place[], status: string) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            resolve(places);
                        } else {
                            reject(new Error('NearbySearch failed: ' + status));
                        }
                    }
                );
            });
        });
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setExternalChargers([]);
            return;
        }
        setIsSearching(true);
        setSearchError('');
        try {
            const results = await searchNearbyChargers(searchQuery.trim());
            setExternalChargers(results);
        } catch (error) {
            setSearchError((error as Error).message);
        } finally {
            setIsSearching(false);
        }
    };

    const filteredChargers = searchQuery.trim()
        ? [
            ...chargers.filter(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.location.toLowerCase().includes(searchQuery.toLowerCase())
            ),
            ...externalChargers
                .filter(ext =>
                    ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (ext.vicinity ?? '').toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(formatExternalToCharger)
        ]
        : chargers;

    const totalPages = Math.max(1, Math.ceil(filteredChargers.length / itemsPerPage));

    const paginatedChargers = filteredChargers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (charger: Charger) => {
        if (!charger) return;
        setSelectedCharger(charger);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = (charger: Charger) => {
        setSelectedCharger(charger)
        setModalMode('delete')
        setIsModalOpen(true)
    }

    const handleModalConfirm = (updatedCharger?: Charger) => {
        setErrorMessage('')

        if (modalMode === 'delete' && selectedCharger) {
            fetch(`/api/slots/delete/${selectedCharger.id}`, {
                method: 'DELETE',
                credentials: "include"
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao apagar charger');
                    }
                    setChargers(prev => prev.filter(c => c.id !== selectedCharger.id));
                    setIsModalOpen(false);
                    setSelectedCharger(null);
                })
                .catch(error => {
                    console.error(error);
                    setErrorMessage(error.message);
                });

            return;
        }

        if (!updatedCharger) return;

        const payload = {
            id: updatedCharger.id && updatedCharger.id !== '' ? updatedCharger.id : null,
            name: updatedCharger.name,
            stationName: updatedCharger.location,
            reserved: updatedCharger.status === 'Inactive',
            chargingType: updatedCharger.type,
            power: updatedCharger.power,
            latitude: updatedCharger.latitude,
            longitude: updatedCharger.longitude
        };

        const url = updatedCharger.id
            ? `/api/slots/dto/${updatedCharger.id}`
            : `/api/slots/dto`;

        const method = updatedCharger.id ? 'PUT' : 'POST';

        fetch(url, {
            credentials: "include",
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(async response => {
                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || `Erro ${response.status}`);
                }
                return response.json();
            })
            .then(newSlot => {
                const formattedCharger: Charger = {
                    id: newSlot.id,
                    name: newSlot.name || `Slot ${newSlot.id}`,
                    location: newSlot.station?.name || 'Unknown',
                    status: newSlot.station?.status === 'UNAVAILABLE' ? 'Inactive' : 'Active',
                    type: newSlot.chargingType,
                    power: newSlot.power
                };

                setChargers(prev => {
                    const existing = prev.find(c => c.id === formattedCharger.id);
                    return existing
                        ? prev.map(c => c.id === formattedCharger.id ? formattedCharger : c)
                        : [...prev, formattedCharger];
                });

                setIsModalOpen(false);
                setErrorMessage('');
            })
            .catch(error => {
                console.error('Error saving charger:', error);
                setErrorMessage(error.message);
            });
    };

    const handleAdd = () => {
        setSelectedCharger(null)
        setModalMode('create')
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
                    <p className={currentMonthRevenue === null ? "text-sm text-gray-500 mt-2" : "text-3xl font-bold mt-2"}>
                        {currentMonthRevenue === null
                            ? 'No revenue data available'
                            : `€${currentMonthRevenue.toFixed(2)}`}
                    </p>
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

                <div className="mb-4 flex gap-2 items-center">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search charging stations..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border rounded pr-10"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setExternalChargers([]);
                                    setCurrentPage(1);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                                &#x2715;
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </div>
                {searchError && (
                    <p className="text-red-600 mb-2">{searchError}</p>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Location</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Power</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedChargers.length > 0 ? (
                                paginatedChargers.map(charger => (
                                    <tr key={charger.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{charger.name}</td>
                                        <td className="px-6 py-4">
                                            {charger.type === 'EXTERNAL' ? (
                                                <a
                                                    href={`https://www.google.com/maps/place/?q=place_id:${charger.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline text-blue-600 hover:text-blue-800"
                                                >
                                                    {charger.location}
                                                </a>
                                            ) : (
                                                charger.location
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${charger.type === 'EXTERNAL' ? 'bg-yellow-100 text-yellow-800' :
                                                charger.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {charger.type === 'EXTERNAL' ? 'External' : charger.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{charger.type}</td>
                                        <td className="px-6 py-4">{charger.power}</td>
                                        <td className="px-6 py-4 text-right">
                                            {charger.type !== 'EXTERNAL' && (
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
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        No chargers available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center items-center mt-4 gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>

                <AdminChargerModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setErrorMessage('');
                        setIsModalOpen(false);
                    }}
                    mode={modalMode}
                    charger={selectedCharger}
                    onConfirm={handleModalConfirm}
                    errorMessage={errorMessage}
                />
            </div>
        </div>
    )
}

export default AdminPage