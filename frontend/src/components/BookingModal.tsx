import { X, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  chargerDetails: {
    id: string
    name: string
    pricePerKwh: string
    type: string
  }
}

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

const BASEURL = import.meta.env.VITE_API_BASE_URL;

const BookingModal = ({ isOpen, onClose, chargerDetails }: BookingModalProps) => {
  const navigate = useNavigate()
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    duration: '30',
    notes: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })

  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const jwt = localStorage.getItem('jwt')
      const uid = localStorage.getItem('userId')
      console.log('JWT:', jwt)
      console.log('UserID:', uid)
      setToken(jwt)
      setUserId(uid)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !userId || isNaN(parseInt(userId))) {
      alert('User not authenticated!')
      return
    }

    const decoded = parseJwt(token)
    if (!decoded || !decoded.sub) {
      alert('Invalid token!')
      return
    }

    const startTime = `${bookingData.date}T${bookingData.startTime}:00`;
    const startTimeObj = new Date(startTime);
    const now = new Date();
    if (startTimeObj < now) {
      setErrorMessage("You cannot make a reservation for a past date/time.");
      return;
    }

    const slotId = parseInt(chargerDetails.id)
    const pricePerKWh = parseFloat(chargerDetails.pricePerKwh.replace(/[^\d.]/g, ''))
    const durationMinutes = parseInt(bookingData.duration)

    const payload = {
      userId: parseInt(userId),
      slotId,
      pricePerKWh,
      consumptionKWh: 15.0,
      startTime,
      durationMinutes,
    }

    try {
      const res = await fetch(`${BASEURL}/api/reservations/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        throw new Error('Reservation failed')
      }

      const data = await res.json()
      console.log('Reservation successful:', data)
      onClose()
      navigate('/bookings')
    } catch (err) {
      console.error(err)
      setErrorMessage('This slot is already reserved for the selected time. Please choose another time.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-screen-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Charger</h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700">{chargerDetails.name}</h3>
          <p className="text-sm text-gray-600">Type: {chargerDetails.type}</p>
          <p className="text-sm text-gray-600">Price: {chargerDetails.pricePerKwh}/kWh</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date{' '}
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={bookingData.date}
              onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time{' '}
            </label>
            <input
              type="time"
              required
              value={bookingData.startTime}
              onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes){' '}
            </label>
            <select
              value={bookingData.duration}
              onChange={(e) => setBookingData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-green-700" size={20} />
              <h3 className="font-medium text-gray-700">Payment Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method{' '}
                  <select
                    value={bookingData.paymentMethod}
                    onChange={(e) => setBookingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="credit-card">Credit Card</option>
                    <option value="debit-card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </label>
              </div>

              {bookingData.paymentMethod.includes('card') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number{' '}
                      <input
                        type="text"
                        required
                        maxLength={16}
                        placeholder="1234 5678 9012 3456"
                        value={bookingData.cardNumber}
                        onChange={(e) => setBookingData(prev => ({ ...prev, cardNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date{' '}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        maxLength={5}
                        value={bookingData.expiryDate}
                        onChange={(e) => setBookingData(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV{' '}
                        <input
                          type="password"
                          required
                          maxLength={3}
                          placeholder="123"
                          value={bookingData.cvv}
                          onChange={(e) => setBookingData(prev => ({ ...prev, cvv: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes{' '}
              <textarea
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            </label>
          </div>

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
              className="px-4 py-2 bg-[#243E16] hover:bg-green-700 text-white rounded-lg"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>

      {errorMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            <h2 className="text-lg font-bold text-red-600 mb-4">Reservation Error</h2>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setErrorMessage(null)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingModal