import { useEffect, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { format } from 'date-fns'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ClientStats {
  totalEnergy: number
  totalCost: number
  currentMonthCost: number
  reservationCount: number
  averageDuration: number
  mostUsedStation: string
  weeklyConsumption: { weekStart: string, kWh: number }[]
  chargingTypeCounts: { [type: string]: number }
  reservationsPerSlot: { [slotLabel: string]: number }
}

const DetailsPage = () => {
  const [stats, setStats] = useState<ClientStats | null>(null)

  const currentMonthName = format(new Date(), 'MMMM')

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('jwt')
      const res = await fetch('/api/reservations/myStats', {
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
          <h4 className="text-gray-600">{currentMonthName} Cost</h4>
          <p className="text-xl font-semibold">€{stats.currentMonthCost.toFixed(2)}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow rounded-xl">
          <h3 className="text-xl font-bold mb-4">Charging Types Used</h3>
          <Doughnut
            data={{
              labels: Object.keys(stats.chargingTypeCounts),
              datasets: [{
                data: Object.values(stats.chargingTypeCounts),
                backgroundColor: ['#4ade80', '#22d3ee', '#facc15']
              }]
            }}
            options={{
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>

        <div className="bg-white p-6 shadow rounded-xl">
          <h3 className="text-xl font-bold mb-4">Reservations per Station</h3>
          <Bar
            data={{
              labels: Object.keys(stats.reservationsPerSlot),
              datasets: [{
                label: 'Reservations',
                data: Object.values(stats.reservationsPerSlot),
                backgroundColor: '#6366f1'
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  ticks: {
                    stepSize: 1,
                    precision: 0,
                    callback: function (value) {
                      return Number(value).toString();
                    }
                  },
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>

      {/*
      <div className="bg-white p-6 shadow rounded-xl mt-6">
        <h3 className="text-xl font-bold mb-4">Weekly Energy Consumption</h3>
        <Bar
          data={{
            labels: stats.weeklyConsumption.map(w => w.weekStart),
            datasets: [{
              label: 'kWh',
              data: stats.weeklyConsumption.map(w => w.kWh),
              backgroundColor: '#4ade80',
              borderColor: '#166534',
              borderWidth: 1
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 5,
                  precision: 0
                }
              }
            }
          }}
        />
      </div>
      */}
    </div>
  )
}

export default DetailsPage
