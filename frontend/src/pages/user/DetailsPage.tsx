import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ClientStats {
  totalEnergy: number
  totalCost: number
  reservationCount: number
  averageDuration: number
  mostUsedStation: string
  monthlyConsumption: { month: string, kWh: number }[]
}

const DetailsPage = () => {
  const [stats, setStats] = useState<ClientStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('jwt')
      const res = await fetch('http://localhost:8081/api/reservations/myStats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setStats(data)
    }

    fetchStats()
  }, [])

  if (!stats) return <div className="p-6">Loading stats...</div>

  return (
    <div className="card w-full h-full mt-8 mb-8 space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Your Charging Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white shadow p-6 rounded-xl">
          <h4 className="text-gray-600">Total Energy</h4>
          <p className="text-xl font-semibold">{stats.totalEnergy} kWh</p>
        </div>
        <div className="bg-white shadow p-6 rounded-xl">
          <h4 className="text-gray-600">Total Spent</h4>
          <p className="text-xl font-semibold">€{stats.totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-white shadow p-6 rounded-xl">
          <h4 className="text-gray-600">Reservations Made</h4>
          <p className="text-xl font-semibold">{stats.reservationCount}</p>
        </div>
        <div className="bg-white shadow p-6 rounded-xl">
          <h4 className="text-gray-600">Avg. Duration</h4>
          <p className="text-xl font-semibold">{stats.averageDuration.toFixed(1)} minutes</p>
        </div>
        <div className="bg-white shadow p-6 rounded-xl">
          <h4 className="text-gray-600">Most Used Station</h4>
          <p className="text-xl font-semibold">{stats.mostUsedStation}</p>
        </div>
      </div>

      <div className="bg-white p-6 shadow rounded-xl mt-6">
        <h3 className="text-xl font-bold mb-4">Monthly Energy Consumption</h3>
        <Bar
          data={{
            labels: stats.monthlyConsumption.map(m => m.month),
            datasets: [{
              label: 'kWh',
              data: stats.monthlyConsumption.map(m => m.kWh),
              backgroundColor: '#15803d'
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false }
            }
          }}
        />
      </div>
    </div>
  )
}

export default DetailsPage
