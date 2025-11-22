import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { bookingService } from '../services/bookingService'
import { useToast } from '../hooks/useToast'
import type { Booking } from '../services/bookingService'

const BookingHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await bookingService.getBookingHistory()
        if (response.data) {
          setBookings(response.data)
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        setError(error.response?.data?.message || 'Không thể tải lịch sử đặt phòng')
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBookingForm={true} />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8">Lịch sử đặt phòng</h1>

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải lịch sử đặt phòng...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Bạn chưa có đặt phòng nào</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3 md:space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-300 p-4 md:p-6 shadow-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <span className="font-semibold text-sm md:text-base">Tên khách sạn:</span>{' '}
                      <span className="text-sm md:text-base">{booking.hotel?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Phòng:</span>{' '}
                      <span className="text-sm md:text-base">
                        {booking.rooms?.Number || booking.rooms?.number || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Tổng tiền:</span>{' '}
                      <span className="text-blue-600 font-bold text-sm md:text-base">
                        {Number(booking.totalPrice).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Sức chứa:</span>{' '}
                      <span className="text-sm md:text-base">{booking.rooms?.capacity || 'N/A'} người</span>
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <span className="font-semibold text-sm md:text-base">Check-in:</span>{' '}
                      <span className="text-sm md:text-base">{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Check-out:</span>{' '}
                      <span className="text-sm md:text-base">{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Trạng thái:</span>{' '}
                      <span className={`text-sm md:text-base font-semibold ${
                        booking.status === 'PAID' ? 'text-green-600' :
                        booking.status === 'PENDING' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {booking.status === 'PAID' ? 'Đã thanh toán' :
                         booking.status === 'PENDING' ? 'Chờ thanh toán' :
                         booking.status === 'FAILED' ? 'Thất bại' : booking.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Ngày đặt:</span>{' '}
                      <span className="text-sm md:text-base">
                        {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
                {booking.status === 'PENDING' && (
                  <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await bookingService.payBooking(booking.id)
                          showSuccess('Thanh toán thành công!')
                          setTimeout(() => window.location.reload(), 1500)
                        } catch (err: unknown) {
                          const error = err as { response?: { data?: { message?: string } } }
                          showError(error.response?.data?.message || 'Thanh toán thất bại')
                        }
                      }}
                      className="w-full sm:w-auto bg-green-600 text-white px-4 md:px-6 py-1.5 md:py-2 rounded hover:bg-green-700 transition text-sm md:text-base whitespace-nowrap"
                    >
                      Thanh toán
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingHistory
