import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Invoice from '../components/Invoice'
import { bookingService } from '../services/bookingService'
import type { Booking } from '../services/bookingService'
import { useToast } from '../hooks/useToast'

const InvoicePage = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showError } = useToast()

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Không tìm thấy mã đặt phòng. Vui lòng kiểm tra lại đường dẫn.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await bookingService.getBookingById(Number(bookingId))
        if (response.data) {
          setBooking(response.data as Booking)
        } else {
          setError('Không tìm thấy thông tin đặt phòng. Vui lòng kiểm tra lại mã đặt phòng.')
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        const errorMessage = error.response?.data?.message || 'Không thể tải thông tin hóa đơn. Vui lòng thử lại sau.'
        setError(errorMessage)
        showError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, showError])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <p className="text-gray-600">Đang tải hóa đơn...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy hóa đơn</h1>
            <p className="text-gray-600 mb-6">{error || 'Không tìm thấy thông tin đặt phòng'}</p>
            <button
              onClick={() => navigate('/booking-history')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Quay lại lịch sử đặt phòng
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Invoice
        booking={booking}
        onClose={() => navigate('/booking-history')}
        onPrint={() => window.print()}
      />
    </div>
  )
}

export default InvoicePage

