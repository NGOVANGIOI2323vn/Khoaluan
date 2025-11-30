import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { bookingService, type Booking } from '../services/bookingService'
import { vnpayService } from '../services/vnpayService'
import { ownerService } from '../services/ownerService'
import { userService } from '../services/userService'
import { authService } from '../services/authService'
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

// Payment methods
const paymentMethods = [
  {
    id: 'wallet',
    label: 'Ví điện tử (Wallet)',
    icon: '💰',
    description: 'Thanh toán bằng số dư ví của bạn',
  },
  {
    id: 'vnpay',
    label: 'VNPay',
    icon: '💳',
    description: 'Cổng thanh toán VNPay',
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
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
  })
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    phone?: string
  }>({})

  const validateEmail = (email: string) => {
    // Email validation: tên@domain.extension
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email.trim())
  }

  const validatePhone = (phone: string) => {
    // Phone validation: 9-10 chữ số (khớp với BE)
    const cleanedPhone = phone.replace(/\D/g, '')
    return /^[0-9]{9,10}$/.test(cleanedPhone)
  }
  const [roomBookings, setRoomBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
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
  const [accessDenied, setAccessDenied] = useState(false)
  const { showSuccess, showError } = useToast()
  
  // Kiểm tra quyền đặt phòng
  useEffect(() => {
    const userRole = authService.getUserRole()
    if (userRole === 'OWNER' || userRole === 'ADMIN') {
      setAccessDenied(true)
      showError('Bạn không có quyền đặt phòng. Vui lòng đăng nhập bằng tài khoản người dùng để đặt phòng.')
      setTimeout(() => navigate('/hotels'), 3000)
    }
  }, [navigate, showError])
  
  // Lấy dates từ query params hoặc localStorage
  const savedBooking = localStorage.getItem('bookingInfo')
  const savedBookingData = savedBooking ? JSON.parse(savedBooking) : null
  const initialCheckIn = searchParams.get('checkIn') || (savedBookingData?.checkIn || savedBookingData?.checkInDate || new Date().toISOString().split('T')[0])
  const initialCheckOut = searchParams.get('checkOut') || (savedBookingData?.checkOut || savedBookingData?.checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0])
  
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  
  // Lấy roomId từ searchParams hoặc localStorage
  const roomIdFromParams = searchParams.get('roomId')
  const roomIdFromStorage = savedBookingData?.roomId
  const roomId = roomIdFromParams ? Number(roomIdFromParams) : (roomIdFromStorage ? Number(roomIdFromStorage) : null)
  
  // Fetch user profile to auto-fill email and phone
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authService.isAuthenticated()) {
        return
      }
      
      try {
        const response = await userService.getProfile()
        if (response.data) {
          // Tự động điền thông tin user, nhưng user vẫn có thể chỉnh sửa
          setFormData({
            email: response.data.email || '',
            phone: response.data.phone || '',
          })
        }
      } catch (err) {
        // Silently fail - user might not be logged in or profile might not be available
        console.error('Error fetching user profile:', err)
      }
    }
    fetchUserProfile()
  }, [])
  
  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await ownerService.getWalletBalance()
        if (response.data) {
          setWalletBalance(Number(response.data.balance))
        }
      } catch (err) {
        // Silently fail - wallet might not be available
        console.error('Error fetching wallet balance:', err)
      }
    }
    fetchWalletBalance()
  }, [])
  
  // Fetch room bookings for calendar
  useEffect(() => {
    const fetchRoomBookings = async () => {
      if (!roomId) return
      try {
        setLoadingBookings(true)
        const response = await bookingService.getBookingsByRoom(roomId)
        if (response.data) {
          setRoomBookings(response.data)
        }
      } catch (err) {
        console.error('Error fetching room bookings:', err)
      } finally {
        setLoadingBookings(false)
      }
    }
    fetchRoomBookings()
  }, [roomId])
  
  // Helper functions for calendar
  const isDateBooked = (date: Date, bookings: Booking[]): boolean => {
    if (!bookings || bookings.length === 0) return false
    
    // Normalize date to YYYY-MM-DD format (local timezone, not UTC)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    return bookings.some(booking => {
      if (booking.status !== 'PAID' && booking.status !== 'PENDING') return false
      
      // Parse booking dates - handle both date strings and Date objects
      let checkInStr: string
      let checkOutStr: string
      
      if (typeof booking.checkInDate === 'string') {
        checkInStr = booking.checkInDate.split('T')[0] // Remove time part if present
      } else {
        const checkInDate = new Date(booking.checkInDate)
        checkInStr = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}-${String(checkInDate.getDate()).padStart(2, '0')}`
      }
      
      if (typeof booking.checkOutDate === 'string') {
        checkOutStr = booking.checkOutDate.split('T')[0] // Remove time part if present
      } else {
        const checkOutDate = new Date(booking.checkOutDate)
        checkOutStr = `${checkOutDate.getFullYear()}-${String(checkOutDate.getMonth() + 1).padStart(2, '0')}-${String(checkOutDate.getDate()).padStart(2, '0')}`
      }
      
      // Check if date is within booking range (checkIn inclusive, checkOut exclusive)
      return dateStr >= checkInStr && dateStr < checkOutStr
    })
  }
  
  const getBookingForDate = (date: Date, bookings: Booking[]): Booking | null => {
    if (!bookings || bookings.length === 0) return null
    
    // Normalize date to YYYY-MM-DD format (local timezone, not UTC)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    return bookings.find(booking => {
      if (booking.status !== 'PAID' && booking.status !== 'PENDING') return false
      
      // Parse booking dates - handle both date strings and Date objects
      let checkInStr: string
      let checkOutStr: string
      
      if (typeof booking.checkInDate === 'string') {
        checkInStr = booking.checkInDate.split('T')[0] // Remove time part if present
      } else {
        const checkInDate = new Date(booking.checkInDate)
        checkInStr = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}-${String(checkInDate.getDate()).padStart(2, '0')}`
      }
      
      if (typeof booking.checkOutDate === 'string') {
        checkOutStr = booking.checkOutDate.split('T')[0] // Remove time part if present
      } else {
        const checkOutDate = new Date(booking.checkOutDate)
        checkOutStr = `${checkOutDate.getFullYear()}-${String(checkOutDate.getMonth() + 1).padStart(2, '0')}-${String(checkOutDate.getDate()).padStart(2, '0')}`
      }
      
      // Check if date is within booking range (checkIn inclusive, checkOut exclusive)
      return dateStr >= checkInStr && dateStr < checkOutStr
    }) || null
  }
  
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }
  
  // Check if selected date range conflicts with bookings
  const isSelectedRangeBooked = () => {
    if (!checkIn || !checkOut || !roomId) return false
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    return roomBookings.some((booking) => {
      if (booking.status !== 'PAID' && booking.status !== 'PENDING') return false
      const bookingCheckIn = new Date(booking.checkInDate)
      const bookingCheckOut = new Date(booking.checkOutDate)
      
      return (
        (bookingCheckIn <= checkInDate && bookingCheckOut > checkInDate) ||
        (bookingCheckIn < checkOutDate && bookingCheckOut >= checkOutDate) ||
        (bookingCheckIn >= checkInDate && bookingCheckOut <= checkOutDate)
      )
    })
  }
  
  // Handle date click from calendar
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Không cho phép chọn ngày quá khứ
    if (date < today) {
      showError('Không thể chọn ngày trong quá khứ')
      return
    }
    
    // Không cho phép chọn ngày đã được đặt
    if (isDateBooked(date, roomBookings)) {
      showError('Ngày này đã được đặt. Vui lòng chọn ngày khác.')
      return
    }
    
    // Logic chọn ngày:
    // 1. Nếu chưa có checkIn hoặc ngày click < checkIn hiện tại: set checkIn
    // 2. Nếu đã có checkIn và ngày click > checkIn: set checkOut
    // 3. Nếu click vào ngày giữa checkIn và checkOut: không làm gì
    // 4. Nếu click vào checkIn hoặc checkOut hiện tại: reset
    
    if (!checkIn) {
      // Chưa có checkIn, set checkIn
      setCheckIn(dateStr)
    } else if (!checkOut) {
      // Có checkIn nhưng chưa có checkOut
      const checkInDate = new Date(checkIn)
      if (date > checkInDate) {
        setCheckOut(dateStr)
      } else if (date < checkInDate) {
        // Nếu click vào ngày trước checkIn, set làm checkIn mới
        setCheckIn(dateStr)
        setCheckOut('')
      } else {
        // Click vào chính checkIn, reset
        setCheckIn('')
      }
    } else {
      // Đã có cả checkIn và checkOut
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      
      if (dateStr === checkIn) {
        // Click vào checkIn, reset checkIn
        setCheckIn('')
        setCheckOut('')
      } else if (dateStr === checkOut) {
        // Click vào checkOut, chỉ reset checkOut
        setCheckOut('')
      } else if (date < checkInDate) {
        // Click vào ngày trước checkIn, set làm checkIn mới
        setCheckIn(dateStr)
        setCheckOut('')
      } else if (date > checkOutDate) {
        // Click vào ngày sau checkOut, set làm checkOut mới
        setCheckOut(dateStr)
      } else {
        // Click vào ngày giữa checkIn và checkOut, set làm checkOut mới
        setCheckOut(dateStr)
      }
    }
  }
  
  // Tính toán lại số đêm và giá khi dates thay đổi
  const calculateNights = () => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }
  
  const nights = calculateNights()
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
    
    // Validate form data
    const errors: { email?: string; phone?: string } = {}
    
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email không hợp lệ'
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc'
    } else if (!validatePhone(formData.phone)) {
      const cleanedPhone = formData.phone.replace(/\D/g, '')
      if (cleanedPhone.length < 9 || cleanedPhone.length > 10) {
        errors.phone = 'Số điện thoại phải có 9 hoặc 10 chữ số'
      } else {
        errors.phone = 'Số điện thoại chỉ được chứa số (0-9)'
      }
    }
    
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    
    // Set loading ngay khi bắt đầu xử lý (để button hiển thị trạng thái ngay)
    // Đặc biệt quan trọng với VNPay để user thấy button đang loading
    setLoading(true)
    
    // Sử dụng setTimeout để đảm bảo state update được render trước khi tiếp tục
    // Điều này giúp button hiển thị loading state ngay lập tức
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Lấy thông tin từ localStorage hoặc query params
    const savedBooking = localStorage.getItem('bookingInfo')
    const roomId = searchParams.get('roomId')
    
    if (!savedBooking && !roomId) {
      setLoading(false)
      showError('Thiếu thông tin đặt phòng. Vui lòng quay lại trang trước.')
      return
    }
    
    try {
      
      let bookingId: number | null = null
      
      // Nếu có roomId, tạo booking mới
      if (roomId) {
        // Validate dates
        const checkInDate = new Date(checkIn)
        const checkOutDate = new Date(checkOut)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (checkInDate < today) {
          showError('Ngày check-in phải từ hôm nay trở đi')
          setLoading(false)
          return
        }
        
        if (checkOutDate <= checkInDate) {
          showError('Ngày check-out phải sau ngày check-in')
          setLoading(false)
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
          showError(bookingResponse.message || 'Không thể tạo đặt phòng. Vui lòng thử lại sau.')
          setLoading(false)
          return
        }
      } else if (savedBooking) {
        // Nếu đã có bookingId trong localStorage
        const bookingInfo = JSON.parse(savedBooking)
        bookingId = bookingInfo.bookingId
      }
      
      if (!bookingId) {
        showError('Không tìm thấy thông tin đặt phòng. Vui lòng quay lại và thử lại.')
        setLoading(false)
        return
      }
      
      // Xử lý thanh toán dựa trên payment method
      if (paymentMethod === 'wallet') {
        // Thanh toán bằng wallet
        const paymentResponse = await bookingService.payBooking(bookingId)
        
        if (paymentResponse.data) {
          showSuccess('Thanh toán thành công! Bạn sẽ nhận được email xác nhận trong vài phút.')
          localStorage.removeItem('bookingInfo')
          setLoading(false) // Tắt loading trước khi navigate
          setTimeout(() => navigate('/booking-history'), 1500)
        } else {
          setLoading(false) // Tắt loading nếu thanh toán thất bại
          showError(paymentResponse.message || 'Thanh toán không thành công. Vui lòng kiểm tra lại số dư ví hoặc thử lại sau.')
        }
      } else if (paymentMethod === 'vnpay') {
        // Thanh toán qua VNPay
        const userId = localStorage.getItem('userId')
        if (!userId) {
          showError('Không tìm thấy thông tin người dùng')
          setLoading(false)
          return
        }

        const finalAmount = calculateFinalTotal()
        const orderInfo = `Thanh toan dat phong|bookingId:${bookingId}|userId:${userId}`
        
        try {
          // Loading sẽ tiếp tục hiển thị trong lúc chờ API response
          const vnpayResponse = await vnpayService.createPayment(
            finalAmount,
            orderInfo,
            'other'
          )
          
          if (vnpayResponse?.url) {
            // Lưu bookingId vào localStorage để xử lý sau khi callback
            localStorage.setItem('pendingBookingId', bookingId.toString())
            // Loading overlay vẫn hiển thị, message đã được cập nhật ở trên
            // Redirect đến VNPay - loading sẽ tự động ẩn khi trang redirect
            window.location.href = vnpayResponse.url
            // Return ngay sau khi redirect để không chạy code phía dưới
            return
          } else {
            setLoading(false) // Chỉ tắt loading nếu không redirect được
            showError('Không thể tạo liên kết thanh toán. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.')
            return
          }
        } catch (err: unknown) {
          setLoading(false) // Tắt loading nếu có lỗi
          const error = err as { response?: { data?: { message?: string } } }
          showError(error.response?.data?.message || 'Không thể tạo liên kết thanh toán. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.')
          return
        }
      } else {
        setLoading(false)
        showError('Vui lòng chọn phương thức thanh toán')
        return
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.'
      showError(errorMessage)
      setLoading(false) // Tắt loading nếu có lỗi
    }
    // Không dùng finally vì nếu redirect đến VNPay thành công thì không cần tắt loading
    // Loading sẽ tự động ẩn khi trang redirect
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền đặt phòng</h1>
            <p className="text-gray-600 mb-6">
              Bạn không có quyền đặt phòng. Vui lòng đăng nhập bằng tài khoản người dùng để đặt phòng.
            </p>
            <button
              onClick={() => navigate('/hotels')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Quay lại danh sách khách sạn
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      <Header />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center"
          >
            <div className="mb-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {paymentMethod === 'vnpay' ? 'Đang chuyển đến cổng thanh toán VNPay...' : 'Đang xử lý thanh toán...'}
            </h3>
            <p className="text-gray-600 mb-4">
              {paymentMethod === 'vnpay' 
                ? 'Vui lòng đợi trong giây lát, bạn sẽ được chuyển đến trang thanh toán VNPay'
                : 'Vui lòng đợi trong giây lát, không đóng trang này'}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Thanh toán
          </h1>
          <p className="text-gray-600 text-sm md:text-base">Hoàn tất đặt phòng của bạn</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4 md:space-y-6"
          >
            {/* Booking Details */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-5 text-gray-900">Chi tiết đặt phòng</h2>
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
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>
                
                {/* Room Availability Calendar */}
                {roomId && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="text-base font-bold text-gray-900 mb-4">Lịch đặt phòng</h4>
                    
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() - 1)
                          setSelectedDate(newDate)
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        ←
                      </button>
                      <span className="text-sm font-semibold flex-1 text-center">
                        {selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() + 1)
                          setSelectedDate(newDate)
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        →
                      </button>
                      <button
                        onClick={() => setSelectedDate(new Date())}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm whitespace-nowrap"
                      >
                        Hôm nay
                      </button>
                    </div>
                    
                    {loadingBookings ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 text-sm">Đang tải lịch đặt phòng...</p>
                      </div>
                    ) : (
                      <>
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2">
                              {day}
                            </div>
                          ))}
                          {generateCalendarDays().map((day, index) => {
                            if (!day) {
                              return <div key={`empty-${index}`} className="aspect-square" />
                            }
                            
                            // Normalize dates for comparison (set to midnight local time)
                            const dayNormalized = new Date(day.getFullYear(), day.getMonth(), day.getDate())
                            const todayNormalized = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
                            
                            const isBooked = isDateBooked(dayNormalized, roomBookings)
                            const booking = getBookingForDate(dayNormalized, roomBookings)
                            
                            const isToday = dayNormalized.getTime() === todayNormalized.getTime()
                            const isPast = dayNormalized < todayNormalized
                            
                            // Check if day is in selected range
                            let isInSelectedRange = false
                            if (checkIn && checkOut) {
                              const checkInNormalized = new Date(checkIn + 'T00:00:00')
                              const checkOutNormalized = new Date(checkOut + 'T00:00:00')
                              isInSelectedRange = dayNormalized >= checkInNormalized && dayNormalized < checkOutNormalized
                            }
                            
                            // Check if this date is checkIn or checkOut
                            const isCheckIn = checkIn && dayNormalized.toISOString().split('T')[0] === checkIn
                            const isCheckOut = checkOut && dayNormalized.toISOString().split('T')[0] === checkOut
                            
                            return (
                              <motion.div
                                key={day.toISOString()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => !isBooked && !isPast && handleDateClick(dayNormalized)}
                                className={`aspect-square border-2 rounded-lg p-1 sm:p-2 transition text-xs ${
                                  isBooked
                                    ? 'bg-red-50 border-red-300 cursor-not-allowed opacity-60'
                                    : isPast
                                    ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                                    : isInSelectedRange
                                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 cursor-pointer hover:bg-blue-100'
                                    : 'bg-green-50 border-green-300 hover:bg-green-100 cursor-pointer'
                                } ${isToday ? 'ring-2 ring-blue-500' : ''} ${isCheckIn || isCheckOut ? 'ring-2 ring-purple-400 border-purple-500 font-bold' : ''}`}
                                title={
                                  isBooked 
                                    ? `Đã đặt: ${booking?.user?.username || 'N/A'}` 
                                    : isPast 
                                    ? 'Quá khứ' 
                                    : isCheckIn
                                    ? 'Ngày nhận phòng - Click để thay đổi'
                                    : isCheckOut
                                    ? 'Ngày trả phòng - Click để thay đổi'
                                    : isInSelectedRange 
                                    ? 'Khoảng thời gian bạn chọn - Click để thay đổi' 
                                    : 'Click để chọn ngày'
                                }
                              >
                                <div className={`text-xs font-semibold ${
                                  isBooked ? 'text-red-700' : isPast ? 'text-gray-500' : isInSelectedRange ? 'text-blue-700' : 'text-green-700'
                                }`}>
                                  {day.getDate()}
                                </div>
                                {booking && (
                                  <div className="text-[10px] text-red-600 mt-0.5 truncate">
                                    {booking.user?.username || 'Đã đặt'}
                                  </div>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>
                        
                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded"></div>
                            <span>Trống</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded"></div>
                            <span>Đã đặt</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-50 border-2 border-blue-400 rounded"></div>
                            <span>Bạn đã chọn</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded opacity-50"></div>
                            <span>Quá khứ</span>
                          </div>
                        </div>
                        
                        {/* Warning if selected range is booked */}
                        {isSelectedRangeBooked() && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-semibold">
                              ⚠️ Khoảng thời gian bạn chọn đã có người đặt. Vui lòng chọn khoảng thời gian khác.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
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
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-5 text-gray-900">Phương thức thanh toán</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={loading ? {} : { scale: 1.02 }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                    onClick={() => setPaymentMethod(method.id)}
                    disabled={loading}
                    className={`w-full p-4 rounded-lg border-2 transition text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                      paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{method.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base break-words">{method.label}</div>
                        <div className="text-xs sm:text-sm text-gray-600 break-words">
                          {method.description}
                          {method.id === 'wallet' && walletBalance !== null && (
                            <span className="block mt-1 font-semibold text-blue-600">
                              Số dư: {walletBalance.toLocaleString('vi-VN')} VND
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              {paymentMethod === 'wallet' && walletBalance !== null && calculateFinalTotal() > walletBalance && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Số dư ví không đủ. Bạn cần thêm{' '}
                    {(calculateFinalTotal() - walletBalance).toLocaleString('vi-VN')} VND để thanh toán.
                  </p>
                </div>
              )}
            </div>


            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-5 text-gray-900">Thông tin liên hệ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: undefined })
                      }
                    }}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại (9-10 số)"
                    value={formData.phone}
                    onChange={(e) => {
                      // Chỉ cho phép nhập số
                      const value = e.target.value.replace(/\D/g, '')
                      setFormData({ ...formData, phone: value })
                      if (validationErrors.phone) {
                        setValidationErrors({ ...validationErrors, phone: undefined })
                      }
                    }}
                    maxLength={10}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.phone}</p>
                  )}
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
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6 md:p-8 sticky top-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-5 text-gray-900">Tóm tắt đơn hàng</h2>
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
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <label className="block text-sm font-semibold mb-3 text-gray-700">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mã"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyPromo}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-md"
                  >
                    Áp dụng
                  </motion.button>
                </div>
                {appliedPromo && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-2 bg-green-100 border border-green-300 rounded-lg"
                  >
                    <p className="text-xs text-green-700 font-semibold">
                    ✓ Đã áp dụng mã {appliedPromo.code} - Giảm {appliedPromo.discount}%
                  </p>
                  </motion.div>
                )}
              </div>

              <motion.button
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg mb-4 text-base flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/50'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {paymentMethod === 'vnpay' 
                        ? 'Đang chuyển đến VNPay...' 
                        : 'Đang xử lý thanh toán...'}
                    </span>
                  </>
                ) : (
                  'Xác nhận thanh toán'
                )}
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

