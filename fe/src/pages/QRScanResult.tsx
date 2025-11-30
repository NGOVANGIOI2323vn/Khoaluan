import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { bookingService } from '../services/bookingService'
import type { Booking } from '../services/bookingService'
import { useToast } from '../hooks/useToast'

const QRScanResult = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showError } = useToast()

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Không tìm thấy mã đặt phòng')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await bookingService.getBookingById(Number(bookingId))
        if (response.data) {
          setBooking(response.data as Booking)
        } else {
          setError('Không tìm thấy thông tin đặt phòng')
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        const errorMessage = error.response?.data?.message || 'Không thể tải thông tin đặt phòng. Vui lòng thử lại sau.'
        setError(errorMessage)
        showError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, showError])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const calculateNights = () => {
    if (!booking) return 0
    const checkIn = new Date(booking.checkInDate)
    const checkOut = new Date(booking.checkOutDate)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; color: string; bgColor: string }> = {
      PAID: { text: 'Đã thanh toán', color: 'text-green-800', bgColor: 'bg-green-100 border-green-300' },
      PENDING: { text: 'Chờ thanh toán', color: 'text-yellow-800', bgColor: 'bg-yellow-100 border-yellow-300' },
      FAILED: { text: 'Thanh toán thất bại', color: 'text-red-800', bgColor: 'bg-red-100 border-red-300' },
      REFUNDED: { text: 'Đã hoàn tiền', color: 'text-blue-800', bgColor: 'bg-blue-100 border-blue-300' },
    }
    const config = statusConfig[status] || { text: status, color: 'text-gray-800', bgColor: 'bg-gray-100 border-gray-300' }
    return (
      <span className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${config.bgColor} ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <p className="text-gray-600 text-lg">Đang tải thông tin đặt phòng...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy thông tin</h1>
            <p className="text-gray-600 mb-6">{error || 'Không tìm thấy thông tin đặt phòng'}</p>
            <button
              onClick={() => navigate('/hotels')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Quay lại trang chủ
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  const nights = calculateNights()
  const pricePerNight = nights > 0 ? Number(booking.totalPrice) / nights : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header với gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">THÔNG TIN ĐẶT PHÒNG</h1>
              <p className="text-blue-100 text-lg">Mã đặt phòng: #{booking.id}</p>
              <div className="mt-4">{getStatusBadge(booking.status)}</div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Customer Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Thông tin khách hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Họ tên</p>
                  <p className="font-semibold text-gray-900 text-lg">{booking.user?.username || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900 text-lg">{booking.user?.email || 'N/A'}</p>
                </div>
                {booking.user?.phone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                    <p className="font-semibold text-gray-900 text-lg">{booking.user.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hotel & Room Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🏨</span>
                Thông tin khách sạn & phòng
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tên khách sạn</p>
                  <p className="font-bold text-gray-900 text-xl">{booking.hotel?.name || 'N/A'}</p>
                </div>
                {booking.hotel?.address && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                    <p className="font-semibold text-gray-900">{booking.hotel.address}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Số phòng</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {booking.rooms?.Number || booking.rooms?.number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Loại phòng</p>
                    <p className="font-bold text-gray-900 text-lg">{booking.rooms?.type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Sức chứa</p>
                    <p className="font-bold text-gray-900 text-lg">{booking.rooms?.capacity || 0} người</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                Thông tin đặt phòng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Ngày nhận phòng</p>
                  <p className="font-bold text-blue-600 text-xl">{formatDate(booking.checkInDate)}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Ngày trả phòng</p>
                  <p className="font-bold text-purple-600 text-xl">{formatDate(booking.checkOutDate)}</p>
                </div>
                <div className="md:col-span-2 text-center p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Số đêm</p>
                  <p className="font-bold text-gray-900 text-2xl">{nights} đêm</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Thông tin thanh toán
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-pink-200">
                  <span className="text-gray-600">Giá phòng/đêm</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(pricePerNight)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-pink-200">
                  <span className="text-gray-600">Số đêm ({nights} đêm)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(Number(booking.totalPrice))}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4 mt-4">
                  <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-pink-600">{formatCurrency(Number(booking.totalPrice))}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {booking.qrUrl && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  Mã QR đặt phòng
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}${booking.qrUrl}`}
                      alt="QR Code"
                      className="w-48 h-48 sm:w-56 sm:h-56"
                    />
                  </div>
                  <div className="flex-1 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900 mb-3 text-base">Hướng dẫn sử dụng:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Vui lòng xuất trình mã QR này khi check-in tại khách sạn</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Mã QR chứa toàn bộ thông tin đặt phòng của bạn</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Lưu lại mã QR để tiện sử dụng</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate('/hotels')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
              >
                Tìm khách sạn khác
              </button>
              {booking.status === 'PAID' && (
                <button
                  onClick={() => navigate(`/invoice/${booking.id}`)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                >
                  Xem hóa đơn
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default QRScanResult

