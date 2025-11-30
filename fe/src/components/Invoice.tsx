import { motion } from 'framer-motion'
import type { Booking } from '../services/bookingService'

interface InvoiceProps {
  booking: Booking
  onClose?: () => void
  onPrint?: () => void
}

const Invoice = ({ booking, onClose, onPrint }: InvoiceProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate)
    const checkOut = new Date(booking.checkOutDate)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const nights = calculateNights()
  // Tính giá phòng/đêm đã discount từ totalPrice
  // Backend tính: price * (1 - discountPercent) * nights = totalPrice
  const pricePerNightAfterDiscount = nights > 0 ? Number(booking.totalPrice) / nights : 0
  
  // Nếu có discountPercent, tính giá gốc để hiển thị
  const discountPercent = booking.rooms?.discountPercent || 0
  const originalPricePerNight = discountPercent > 0 && discountPercent < 1
    ? pricePerNightAfterDiscount / (1 - discountPercent)
    : pricePerNightAfterDiscount
  
  const total = Number(booking.totalPrice)

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán'
      case 'PENDING':
        return 'Chờ thanh toán'
      case 'FAILED':
        return 'Thanh toán thất bại'
      case 'REFUNDED':
        return 'Đã hoàn tiền'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">HÓA ĐƠN ĐẶT PHÒNG</h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Mã đặt phòng: <span className="font-semibold">#{booking.id}</span>
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm sm:text-base ${getStatusColor(booking.status)} bg-white`}>
                {getStatusText(booking.status)}
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Company Info & Booking Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b-2 border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Thông tin công ty</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">Khách sạn Online</p>
                  <p>Email: support@hotelonline.com</p>
                  <p>Hotline: 1900-xxxx</p>
                  <p>Website: www.hotelonline.com</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Thông tin đặt phòng</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-900">Ngày đặt:</span>{' '}
                    {formatDateTime(booking.bookingDate)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Check-in:</span>{' '}
                    {formatDate(booking.checkInDate)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Check-out:</span>{' '}
                    {formatDate(booking.checkOutDate)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Số đêm:</span> {nights} đêm
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="pb-6 border-b-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Thông tin khách hàng</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Họ tên</p>
                    <p className="font-semibold text-gray-900">
                      {booking.user?.username || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">
                      {booking.user?.email || 'N/A'}
                    </p>
                  </div>
                  {booking.user?.phone && (
                    <div>
                      <p className="text-gray-600 mb-1">Số điện thoại</p>
                      <p className="font-semibold text-gray-900">{booking.user.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hotel & Room Info */}
            <div className="pb-6 border-b-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Thông tin khách sạn & phòng</h3>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tên khách sạn</p>
                    <p className="text-lg font-bold text-gray-900">
                      {booking.hotel?.name || 'N/A'}
                    </p>
                  </div>
                  {booking.hotel?.address && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                      <p className="text-base text-gray-900">{booking.hotel.address}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Số phòng</p>
                      <p className="text-base font-semibold text-gray-900">
                        {booking.rooms?.number || booking.rooms?.Number || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Loại phòng</p>
                      <p className="text-base font-semibold text-gray-900">
                        {booking.rooms?.type || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Sức chứa</p>
                      <p className="text-base font-semibold text-gray-900">
                        {booking.rooms?.capacity || 'N/A'} người
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="pb-6 border-b-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Chi tiết thanh toán</h3>
              <div className="space-y-3">
                {discountPercent > 0 && discountPercent < 1 && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Giá phòng/đêm (gốc)</span>
                      <span className="font-semibold text-gray-900 line-through text-gray-500">
                        {formatCurrency(originalPricePerNight)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        Giảm giá ({Math.round(discountPercent * 100)}%)
                      </span>
                      <span className="font-semibold text-green-600">
                        -{formatCurrency(originalPricePerNight - pricePerNightAfterDiscount)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Giá phòng/đêm {discountPercent > 0 ? '(sau giảm giá)' : ''}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(pricePerNightAfterDiscount)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">
                    Số đêm ({nights} đêm × {formatCurrency(pricePerNightAfterDiscount)})
                  </span>
                  <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg px-4 mt-4">
                  <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {booking.qrUrl && (
              <div className="pb-6 border-b-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Mã QR đặt phòng</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}${booking.qrUrl}`}
                      alt="QR Code"
                      className="w-32 h-32 sm:w-40 sm:h-40"
                    />
                  </div>
                  <div className="flex-1 text-sm text-gray-600">
                    <p className="font-semibold text-gray-900 mb-2">Hướng dẫn sử dụng:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Vui lòng xuất trình mã QR này khi check-in</li>
                      <li>Mã QR chứa toàn bộ thông tin đặt phòng của bạn</li>
                      <li>Lưu lại mã QR để tiện sử dụng</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Notes */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Lưu ý:</span> Vui lòng kiểm tra lại thông tin đặt
                phòng. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline 1900-xxxx hoặc email
                support@hotelonline.com
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 sm:px-8 py-6 flex flex-col sm:flex-row gap-3 justify-end">
            {onPrint && (
              <button
                onClick={onPrint}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                🖨️ In hóa đơn
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition shadow-md hover:shadow-lg"
              >
                Đóng
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md hover:shadow-lg"
            >
              📄 Lưu PDF
            </button>
          </div>
        </motion.div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white, .bg-white * {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Invoice

