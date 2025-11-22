import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header'
import { bookingService } from '../services/bookingService'
import { useToast } from '../hooks/useToast'
// BookingData interface
interface BookingData {
  hotelName: string
  roomType: string
  checkIn: string
  checkOut: string
  guests: string
  nights: number
  pricePerNight: number
  total: number
  tax: number
  finalTotal: number
  hotelImage: string
  amenities: string[]
}

// Payment methods (static, no need for BE)
const paymentMethods = [
  {
    id: 'wallet',
    label: 'Ví điện tử (Wallet)',
    icon: '💰',
    description: 'Thanh toán bằng số dư ví của bạn',
  },
  {
    id: 'credit',
    label: 'Thẻ tín dụng/Ghi nợ',
    icon: '💳',
    description: 'Visa, Mastercard, JCB, Amex',
  },
  {
    id: 'vnpay',
    label: 'VNPay',
    icon: '💳',
    description: 'Cổng thanh toán VNPay',
  },
  {
    id: 'bank',
    label: 'Chuyển khoản ngân hàng',
    icon: '🏦',
    description: 'Vietcombank, BIDV, Techcombank, Vietinbank',
  },
]

// Promo codes (static, no need for BE)
const promoCodes = [
  {
    code: 'WELCOME10',
    discount: 10,
    description: 'Giảm 10% cho khách hàng mới',
  },
  {
    code: 'SUMMER2025',
    discount: 15,
    description: 'Giảm 15% cho mùa hè 2025',
  },
  {
    code: 'VIP20',
    discount: 20,
    description: 'Giảm 20% cho thành viên VIP',
  },
]

// Default booking data (fallback only)
const defaultBookingData: BookingData = {
  hotelName: '',
  roomType: '',
  checkIn: '',
  checkOut: '',
  guests: '',
  nights: 1,
  pricePerNight: 0,
  total: 0,
  tax: 0,
  finalTotal: 0,
  hotelImage: '',
  amenities: [],
}

const Checkout = () => {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('credit')
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: '',
    phone: '',
  })
  // Đọc dữ liệu từ localStorage (từ trang Booking)
  const getBookingData = (): BookingData => {
    const savedBooking = localStorage.getItem('bookingInfo')
    if (savedBooking) {
      try {
        const bookingInfo = JSON.parse(savedBooking)
        // Chuyển đổi dữ liệu từ Booking page sang format của Checkout
        return {
          hotelName: bookingInfo.hotelName || defaultBookingData.hotelName,
          roomType: bookingInfo.roomTypeName || defaultBookingData.roomType,
          checkIn: new Date(bookingInfo.checkIn).toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          checkOut: new Date(bookingInfo.checkOut).toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          guests: `${bookingInfo.adults} người lớn${bookingInfo.children > 0 ? `, ${bookingInfo.children} trẻ em` : ''}`,
          nights: bookingInfo.nights || defaultBookingData.nights,
          pricePerNight: bookingInfo.roomPrice || defaultBookingData.pricePerNight,
          total: bookingInfo.subtotal || defaultBookingData.total,
          tax: 0,
          finalTotal: bookingInfo.total || defaultBookingData.finalTotal,
          hotelImage: bookingInfo.hotelImage || defaultBookingData.hotelImage,
          amenities: defaultBookingData.amenities,
        }
      } catch (error) {
        console.error('Failed to parse saved booking info', error)
        return defaultBookingData
      }
    }
    return defaultBookingData
  }

  const [bookingData] = useState<BookingData>(getBookingData)

  const handleApplyPromo = () => {
    const promo = promoCodes.find((p) => p.code === promoCode.toUpperCase())
    if (promo) {
      setAppliedPromo({ code: promo.code, discount: promo.discount })
      showSuccess(`Áp dụng mã giảm giá ${promo.discount}% thành công!`)
    } else {
      showError('Mã giảm giá không hợp lệ')
    }
  }

  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { showSuccess, showError, showInfo } = useToast()
  
  // Lấy dates từ query params hoặc localStorage
  const savedBooking = localStorage.getItem('bookingInfo')
  const initialCheckIn = searchParams.get('checkIn') || (savedBooking ? JSON.parse(savedBooking).checkIn || JSON.parse(savedBooking).checkInDate : new Date().toISOString().split('T')[0])
  const initialCheckOut = searchParams.get('checkOut') || (savedBooking ? JSON.parse(savedBooking).checkOut || JSON.parse(savedBooking).checkOutDate : new Date(Date.now() + 86400000).toISOString().split('T')[0])
  
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  
  // Tính toán lại số đêm và giá khi dates thay đổi
  const calculateNights = () => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }
  
  const nights = calculateNights()
  const savedBookingData = savedBooking ? JSON.parse(savedBooking) : null
  const pricePerNight = savedBookingData?.roomPrice || bookingData.pricePerNight
  const subtotal = pricePerNight * nights
  const total = subtotal
  
  // Cập nhật bookingData khi dates thay đổi
  const updatedBookingData: BookingData = {
    ...bookingData,
    checkIn: new Date(checkIn).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    checkOut: new Date(checkOut).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    nights,
    pricePerNight,
    total: subtotal,
    tax: 0,
    finalTotal: total,
  }
  
  const calculateFinalTotal = () => {
    let finalTotal = total
    if (appliedPromo) {
      finalTotal = finalTotal * (1 - appliedPromo.discount / 100)
    }
    return Math.round(finalTotal)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Lấy thông tin từ localStorage hoặc query params
    const savedBooking = localStorage.getItem('bookingInfo')
    const roomId = searchParams.get('roomId')
    
    if (!savedBooking && !roomId) {
      setErrorMessage('Thiếu thông tin đặt phòng. Vui lòng quay lại trang trước.')
      return
    }
    
    try {
      setLoading(true)
      setErrorMessage('')
      
      let bookingId: number | null = null
      
      // Nếu có roomId, tạo booking mới
      if (roomId) {
        // Validate dates
        const checkInDate = new Date(checkIn)
        const checkOutDate = new Date(checkOut)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (checkInDate < today) {
          setErrorMessage('Ngày check-in phải từ hôm nay trở đi')
          return
        }
        
        if (checkOutDate <= checkInDate) {
          setErrorMessage('Ngày check-out phải sau ngày check-in')
          return
        }
        
        // Tạo booking với dates đã chọn
        const bookingResponse = await bookingService.createBooking(Number(roomId), {
          checkInDate: checkIn,
          checkOutDate: checkOut,
        })
        
        if (bookingResponse.data) {
          bookingId = bookingResponse.data.id
          // Lưu bookingId vào localStorage để có thể thanh toán sau
          const bookingInfo = savedBooking ? JSON.parse(savedBooking) : {}
          bookingInfo.bookingId = bookingId
          localStorage.setItem('bookingInfo', JSON.stringify(bookingInfo))
        } else {
          setErrorMessage(bookingResponse.message || 'Không thể tạo booking')
          return
        }
      } else if (savedBooking) {
        // Nếu đã có bookingId trong localStorage
        const bookingInfo = JSON.parse(savedBooking)
        bookingId = bookingInfo.bookingId
      }
      
      if (!bookingId) {
        setErrorMessage('Không tìm thấy thông tin booking')
        return
      }
      
      // Xử lý thanh toán dựa trên payment method
      if (paymentMethod === 'wallet') {
        // Thanh toán bằng wallet
        const paymentResponse = await bookingService.payBooking(bookingId)
        
        if (paymentResponse.data) {
          showSuccess('Thanh toán thành công! Bạn sẽ nhận được email xác nhận trong vài phút.')
          localStorage.removeItem('bookingInfo')
          setTimeout(() => navigate('/booking-history'), 1500)
        } else {
          setErrorMessage(paymentResponse.message || 'Thanh toán thất bại')
        }
      } else if (paymentMethod === 'vnpay') {
        // TODO: Tích hợp VNPay nếu cần
        showInfo('Tính năng thanh toán VNPay đang được phát triển. Vui lòng chọn phương thức thanh toán khác.')
      } else {
        // Credit card - tạm thời tạo booking và chuyển đến booking history để thanh toán sau
        showSuccess('Đặt phòng thành công! Vui lòng thanh toán trong lịch sử đặt phòng.')
        localStorage.removeItem('bookingInfo')
        setTimeout(() => navigate('/booking-history'), 1500)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setErrorMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đặt phòng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8"
        >
          Thanh toán
        </motion.h1>
        
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            <p className="font-semibold">Lỗi:</p>
            <p>{errorMessage}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4 md:space-y-6"
          >
            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Chi tiết đặt phòng</h2>
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <img
                  src={updatedBookingData.hotelImage}
                  alt={updatedBookingData.hotelName}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg break-words">{updatedBookingData.hotelName}</h3>
                  <p className="text-sm sm:text-base text-gray-600 break-words">{updatedBookingData.roomType}</p>
                </div>
              </div>
              
              {/* Date Selection */}
              <div className="space-y-4 border-t pt-4 mb-4">
                <h3 className="font-semibold text-lg">Chọn ngày</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Ngày nhận phòng</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value)
                        // Nếu check-out nhỏ hơn hoặc bằng check-in mới, tự động cập nhật
                        if (e.target.value >= checkOut) {
                          const newCheckOut = new Date(e.target.value)
                          newCheckOut.setDate(newCheckOut.getDate() + 1)
                          setCheckOut(newCheckOut.toISOString().split('T')[0])
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Ngày trả phòng</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nhận phòng:</span>
                  <span className="font-semibold">{updatedBookingData.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trả phòng:</span>
                  <span className="font-semibold">{updatedBookingData.checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khách:</span>
                  <span className="font-semibold">{updatedBookingData.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số đêm:</span>
                  <span className="font-semibold">{updatedBookingData.nights} đêm</span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-2">Tiện ích bao gồm:</p>
                  <div className="flex flex-wrap gap-2">
                    {updatedBookingData.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition text-left ${
                      paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{method.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base break-words">{method.label}</div>
                        <div className="text-xs sm:text-sm text-gray-600 break-words">{method.description}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            {paymentMethod === 'credit' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Thông tin thanh toán</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-2">Số thẻ</label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
                        setFormData({ ...formData, cardNumber: value })
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-2">Tên chủ thẻ</label>
                    <input
                      type="text"
                      value={formData.cardName}
                      onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      placeholder="NGUYEN VAN A"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-2">Ngày hết hạn</label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
                          setFormData({ ...formData, expiryDate: value })
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-2">CVV</label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          setFormData({ ...formData, cvv: value })
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                        placeholder="123"
                        maxLength={3}
                      />
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Thông tin liên hệ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    placeholder="+84 123 456 789"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-4">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giá phòng ({updatedBookingData.nights} đêm):</span>
                  <span>{updatedBookingData.total.toLocaleString('vi-VN')} VND</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá ({appliedPromo.code}):</span>
                    <span>
                      -{Math.round(updatedBookingData.finalTotal * (appliedPromo.discount / 100)).toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-base sm:text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600 break-words">
                      {calculateFinalTotal().toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-semibold mb-2">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600"
                    placeholder="Nhập mã"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyPromo}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Áp dụng
                  </motion.button>
                </div>
                {appliedPromo && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Đã áp dụng mã {appliedPromo.code} - Giảm {appliedPromo.discount}%
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition shadow-lg mb-4 ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </motion.button>

              <p className="text-xs text-gray-500 text-center">
                Bằng cách xác nhận, bạn đồng ý với các điều khoản và điều kiện của chúng tôi
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

