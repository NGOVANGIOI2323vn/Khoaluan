import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Column } from '@ant-design/charts'
import { hotelService, ownerService } from '../services'
import { bookingService } from '../services/bookingService'
import type { Hotel, Room } from '../services/hotelService'
import type { BookingTransaction, WithdrawRequest, RevenueSummary } from '../services/ownerService'
import type { Booking } from '../services/bookingService'
import Header from '../components/Header'
import AppModal from '../components/AppModal'
import HotelForm, { type HotelFormData } from '../components/HotelForm'
import HotelCard from '../components/HotelCard'
import { useToast } from '../hooks/useToast'
import cloudinaryService from '../utils/cloudinaryService'
import FormattedNumberInput from '../components/FormattedNumberInput'
import WithdrawForm, { type WithdrawFormData } from '../components/WithdrawForm'
import RoomEditForm, { type RoomEditFormData } from '../components/RoomEditForm'

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'hotels' | 'rooms' | 'bookings' | 'transactions' | 'withdraws' | 'revenue'>('hotels')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [hotelSearchQuery, setHotelSearchQuery] = useState('')
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomBookings, setRoomBookings] = useState<Booking[]>([])
  const [allBookings, setAllBookings] = useState<(Booking & { transactionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' })[]>([])
  const [loadingAllBookings, setLoadingAllBookings] = useState(false)
  const [transactions, setTransactions] = useState<BookingTransaction[]>([])
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([])
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [showCreateHotel, setShowCreateHotel] = useState(false)
  const [showEditHotelModal, setShowEditHotelModal] = useState(false)
  const [hotelForm, setHotelForm] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    images: [] as File[],
  })
  type CreateHotelRoomForm = { number: string; price: string; image: File | null }
  const [createHotelRooms, setCreateHotelRooms] = useState<CreateHotelRoomForm[]>([
    { number: '', price: '', image: null },
  ])
  const [createHotelSubmitting, setCreateHotelSubmitting] = useState(false)
  const [deletingHotelId, setDeletingHotelId] = useState<number | null>(null)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [bulkDiscount, setBulkDiscount] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { showSuccess, showError } = useToast()

  const filterHotels = useCallback((hotelsList: Hotel[], query: string) => {
    if (!query.trim()) {
      setFilteredHotels(hotelsList)
      return
    }
    const lowerQuery = query.toLowerCase()
    const filtered = hotelsList.filter(
      (hotel) =>
        hotel.name?.toLowerCase().includes(lowerQuery) ||
        hotel.address?.toLowerCase().includes(lowerQuery) ||
        hotel.city?.toLowerCase().includes(lowerQuery) ||
        hotel.description?.toLowerCase().includes(lowerQuery)
    )
    setFilteredHotels(filtered)
  }, [])

  const fetchHotels = async (resetSelection = false) => {
    try {
      setLoading(true)
      const response = await ownerService.getMyHotels()
      if (response.data) {
        const hotelsList = Array.isArray(response.data) ? response.data : []
        setHotels(hotelsList)
        // Apply search filter
        filterHotels(hotelsList, hotelSearchQuery)
        if (hotelsList.length === 0) {
          setSelectedHotel(null)
          setRooms([])
          return
        }
        if (resetSelection || !selectedHotel) {
          setSelectedHotel(hotelsList[0])
          return
        }
        const updatedSelection = hotelsList.find((hotel) => hotel.id === selectedHotel.id)
        if (updatedSelection) {
          setSelectedHotel(updatedSelection)
        } else {
          setSelectedHotel(hotelsList[0])
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải danh sách khách sạn')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    filterHotels(hotels, hotelSearchQuery)
  }, [hotelSearchQuery, hotels, filterHotels])

  // Update selectedHotel when filteredHotels changes
  useEffect(() => {
    if (filteredHotels.length > 0) {
      if (selectedHotel) {
        const found = filteredHotels.find((h) => h.id === selectedHotel.id)
        if (!found && filteredHotels[0]) {
          setSelectedHotel(filteredHotels[0])
        }
      } else {
        setSelectedHotel(filteredHotels[0])
      }
    } else if (filteredHotels.length === 0 && hotelSearchQuery.trim()) {
      setSelectedHotel(null)
      setRooms([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredHotels])

  useEffect(() => {
    fetchHotels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedHotel) {
      fetchRooms(selectedHotel.id)
      setSelectedRoom(null)
      setRoomBookings([])
      setBulkDiscount('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHotel])

  const fetchRoomBookings = useCallback(async (roomId: number) => {
    try {
      setLoadingBookings(true)
      const response = await bookingService.getBookingsByRoom(roomId)
      if (response.data) {
        setRoomBookings(response.data)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải lịch đặt phòng')
    } finally {
      setLoadingBookings(false)
    }
  }, [showError])

  useEffect(() => {
    if (selectedRoom) {
      fetchRoomBookings(selectedRoom.id)
    } else {
      setRoomBookings([])
    }
  }, [selectedRoom, fetchRoomBookings])

  const fetchRevenue = useCallback(async () => {
    try {
      const response = await ownerService.getRevenue()
      if (response.data) {
        setRevenue(response.data)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải doanh thu')
    }
  }, [showError])

  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await ownerService.getWalletBalance()
      if (response.data) {
        setWalletBalance(response.data.balance)
      }
    } catch {
      // Silently fail
      setWalletBalance(null)
    }
  }, [])

  useEffect(() => {
    fetchWalletBalance()
  }, [fetchWalletBalance])

  // Lắng nghe event từ Header để chuyển tab
  useEffect(() => {
    const handleSwitchToWithdrawTab = () => {
      setActiveTab('withdraws')
    }
    window.addEventListener('switchToWithdrawTab', handleSwitchToWithdrawTab)
    return () => {
      window.removeEventListener('switchToWithdrawTab', handleSwitchToWithdrawTab)
    }
  }, [])

  // Kiểm tra URL params để chuyển tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab === 'withdraws') {
      setActiveTab('withdraws')
    }
  }, [])

  const fetchAllBookings = async () => {
    try {
      setLoadingAllBookings(true)
      // Lấy bookings từ transactions vì transactions có bookingEntity
      const response = await ownerService.getMyTransactions()
      if (response.data) {
        // Extract bookings from transactions
        const bookings = response.data
          .filter(t => t.bookingEntity)
          .map(t => {
            // Xử lý user - có thể là object hoặc number
            let user: Booking['user'] = undefined
            if (t.bookingEntity!.user) {
              if (typeof t.bookingEntity!.user === 'object') {
                user = {
                  id: t.bookingEntity!.user.id,
                  username: t.bookingEntity!.user.username,
                  email: t.bookingEntity!.user.email || '',
                  phone: t.bookingEntity!.user.phone || '',
                }
              } else {
                // Nếu user chỉ là id, không có thông tin chi tiết
                user = undefined
              }
            }

            return {
              id: t.bookingEntity!.id,
              status: (t.bookingEntity!.status as string) || 'PENDING', // Trạng thái thanh toán của booking (PAID/PENDING/FAILED/REFUNDED)
              transactionStatus: t.status, // Trạng thái duyệt của admin (APPROVED/PENDING/REJECTED)
              bookingDate: t.bookingEntity!.bookingDate || t.bookingEntity!.checkInDate,
              checkInDate: t.bookingEntity!.checkInDate,
              checkOutDate: t.bookingEntity!.checkOutDate,
              totalPrice: t.bookingEntity!.totalPrice,
              user,
              hotel: t.bookingEntity!.hotel ? {
                id: t.bookingEntity!.hotel.id,
                name: t.bookingEntity!.hotel.name,
                address: t.bookingEntity!.hotel.address || '',
              } : undefined,
              rooms: t.bookingEntity!.rooms ? {
                id: t.bookingEntity!.rooms.id,
                Number: t.bookingEntity!.rooms.Number,
                number: t.bookingEntity!.rooms.number || t.bookingEntity!.rooms.Number,
                type: t.bookingEntity!.rooms.type,
                price: t.bookingEntity!.rooms.price,
                capacity: t.bookingEntity!.rooms.capacity,
              } : undefined,
            }
          })
        // Sort by booking date descending
        bookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
        setAllBookings(bookings)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải danh sách đặt phòng')
    } finally {
      setLoadingAllBookings(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchAllBookings()
    } else if (activeTab === 'transactions') {
      fetchTransactions()
    } else if (activeTab === 'withdraws') {
      fetchWithdraws()
    } else if (activeTab === 'revenue') {
      fetchRevenue()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, fetchRevenue])

  const fetchRooms = useCallback(async (hotelId: number) => {
    try {
      const response = await hotelService.getRoomsByHotelId(hotelId)
      if (response.data) {
        setRooms(response.data)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải danh sách phòng')
    }
  }, [showError])


  const fetchTransactions = async () => {
    try {
      const response = await ownerService.getMyTransactions()
      if (response.data) {
        setTransactions(response.data)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải giao dịch')
    }
  }

  const fetchWithdraws = async () => {
    try {
      const response = await ownerService.getMyWithdraws()
      if (response.data) {
        // Handle both PageResponse and List
        if ('content' in response.data) {
          setWithdraws(response.data.content)
        } else {
          setWithdraws(response.data as WithdrawRequest[])
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải yêu cầu rút tiền')
    }
  }

  const handleCreateWithdraw = async (data: WithdrawFormData) => {
    try {
      const response = await ownerService.createWithdraw({
        amount: data.amount,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
      })
      if (response.data) {
        showSuccess('Yêu cầu rút tiền đã được gửi thành công! Tiền đã được tạm giữ chờ duyệt.')
        setShowWithdrawModal(false)
        // Refresh wallet balance và withdraws
        await Promise.all([fetchWalletBalance(), fetchWithdraws()])
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tạo yêu cầu rút tiền')
    }
  }

  const handleOpenEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel)
    setHotelForm({
      name: hotel.name || '',
      address: hotel.address || '',
      phone: hotel.phone || '',
      description: hotel.description || '',
      images: [],
    })
    setShowEditHotelModal(true)
  }

  const resetCreateHotelForm = () => {
    setCreateHotelRooms([{ number: '', price: '', image: null }])
  }

  const handleRoomFieldChange = (index: number, field: 'number' | 'price', value: string) => {
    setCreateHotelRooms((prev) =>
      prev.map((room, idx) => (idx === index ? { ...room, [field]: value } : room)),
    )
  }

  const handleRoomImageChange = (index: number, file: File | null) => {
    setCreateHotelRooms((prev) =>
      prev.map((room, idx) => (idx === index ? { ...room, image: file } : room)),
    )
  }

  const handleAddRoomField = () => {
    setCreateHotelRooms((prev) => [...prev, { number: '', price: '', image: null }])
  }

  const handleRemoveRoomField = (index: number) => {
    setCreateHotelRooms((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)))
  }


  const handleDeleteHotel = async (hotelId: number) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa khách sạn này?')
    if (!confirmDelete) return
    try {
      setDeletingHotelId(hotelId)
      await ownerService.deleteHotel(hotelId)
      showSuccess('Đã xóa khách sạn')
      if (selectedHotel?.id === hotelId) {
        setSelectedHotel(null)
        setSelectedRoom(null)
        setRooms([])
        setRoomBookings([])
      }
      fetchHotels(true)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể xóa khách sạn')
    } finally {
      setDeletingHotelId(null)
    }
  }

  const handleUpdateRoomPrice = async (roomId: number, newPrice: number) => {
    try {
      await ownerService.updateRoomPrice(roomId, newPrice)
      if (selectedHotel) fetchRooms(selectedHotel.id)
      showSuccess('Cập nhật giá phòng thành công!')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể cập nhật giá')
    }
  }

  const handleSaveRoomDetails = async (data: RoomEditFormData) => {
    if (!selectedRoom) return
    try {
      const promises: Promise<unknown>[] = []
      if (data.type && data.type !== selectedRoom.type) {
        promises.push(ownerService.updateRoomType(selectedRoom.id, data.type))
      }
      if (data.capacity && data.capacity !== selectedRoom.capacity) {
        promises.push(ownerService.updateRoomCapacity(selectedRoom.id, data.capacity))
      }
      if (
        data.discountPercent !== undefined &&
        selectedRoom.discountPercent !== data.discountPercent / 100
      ) {
        promises.push(ownerService.updateRoomDiscount(selectedRoom.id, data.discountPercent / 100))
      }
      if (data.image && data.image instanceof File) {
        // Upload image to Cloudinary first, then update
        showSuccess('Đang tải ảnh phòng lên Cloudinary...')
        const imageResult = await cloudinaryService.uploadImage(data.image)
        promises.push(ownerService.updateRoomImage(selectedRoom.id, imageResult.secure_url))
      }
      if (promises.length === 0) {
        showError('Không có thay đổi để cập nhật')
        return
      }
      await Promise.all(promises)
      showSuccess('Cập nhật thông tin phòng thành công')
      if (selectedHotel) fetchRooms(selectedHotel.id)
      fetchRoomBookings(selectedRoom.id)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      showError(error.response?.data?.message || (error as Error).message || 'Không thể cập nhật phòng')
    }
  }

  const handleSetAllDiscount = async () => {
    if (!selectedHotel || !bulkDiscount) return
    const discount = Number(bulkDiscount)
    if (Number.isNaN(discount) || discount < 0 || discount > 100) {
      showError('Giảm giá phải nằm trong khoảng 0-100%')
      return
    }
    try {
      await ownerService.setAllDiscountPercent(selectedHotel.id, discount / 100)
      showSuccess('Đã cập nhật giảm giá cho tất cả phòng')
      setBulkDiscount('')
      fetchRooms(selectedHotel.id)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể cập nhật giảm giá')
    }
  }

  const handleUpdateRoomStatus = async (roomId: number, status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE') => {
    try {
      await ownerService.updateRoomStatus(roomId, status)
      if (selectedHotel) fetchRooms(selectedHotel.id)
      showSuccess('Cập nhật trạng thái phòng thành công!')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể cập nhật trạng thái')
    }
  }


  // Helper function để kiểm tra ngày có bị booked không
  const isDateBooked = (date: Date, bookings: Booking[]): boolean => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.some(booking => {
      const checkIn = new Date(booking.checkInDate).toISOString().split('T')[0]
      const checkOut = new Date(booking.checkOutDate).toISOString().split('T')[0]
      return dateStr >= checkIn && dateStr < checkOut
    })
  }

  // Helper function để lấy booking cho một ngày
  const getBookingForDate = (date: Date, bookings: Booking[]): Booking | null => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.find(booking => {
      const checkIn = new Date(booking.checkInDate).toISOString().split('T')[0]
      const checkOut = new Date(booking.checkOutDate).toISOString().split('T')[0]
      return dateStr >= checkIn && dateStr < checkOut
    }) || null
  }

  // Generate calendar days
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Quản lý khách sạn
            </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Quản lý khách sạn và phòng của bạn</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateHotel(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
            >
              + Thêm khách sạn
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Tổng khách sạn', value: hotels.length, icon: '🏨', gradient: 'from-blue-500 to-blue-600' },
            { label: 'Tổng phòng', value: rooms.length, icon: '🛏️', gradient: 'from-green-500 to-emerald-600' },
            { label: 'Phòng trống', value: rooms.filter(r => r.status === 'AVAILABLE').length, icon: '✅', gradient: 'from-purple-500 to-indigo-600' },
            { 
              label: 'Số dư ví', 
              value: walletBalance !== null ? `${Number(walletBalance).toLocaleString('vi-VN')} VND` : 'Đang tải...', 
              icon: '💰', 
              gradient: 'from-yellow-500 to-orange-500' 
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`bg-gradient-to-br ${stat.gradient} rounded-3xl p-6 text-white shadow-xl`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">{stat.icon}</span>
              </div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-base opacity-95 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Left Sidebar - Hotels & Rooms List */}
          <div className="xl:col-span-1 space-y-4">
            {/* Hotels List */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <span className="text-2xl">🏨</span> Khách sạn
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredHotels.length}/{hotels.length}
                </span>
              </div>
              
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm khách sạn..."
                    value={hotelSearchQuery}
                    onChange={(e) => setHotelSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {hotelSearchQuery && (
                    <button
                      onClick={() => setHotelSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">Đang tải...</p>
                </div>
              ) : hotels.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">Chưa có khách sạn</p>
                </div>
              ) : filteredHotels.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">Không tìm thấy khách sạn nào</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                  {filteredHotels.map((hotel, index) => (
                    <div
                      key={hotel.id}
                      onClick={() => setSelectedHotel(hotel)}
                      className={`cursor-pointer transition-all rounded-xl ${
                        selectedHotel?.id === hotel.id
                          ? 'ring-2 ring-blue-500 ring-offset-2'
                          : 'hover:shadow-md'
                      }`}
                    >
                      <HotelCard
                        hotel={hotel}
                        index={index}
                        variant="dashboard"
                        onEdit={(h) => handleOpenEditHotel(h)}
                        onDelete={(id) => handleDeleteHotel(id)}
                        isDeleting={deletingHotelId === hotel.id}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rooms List */}
            {selectedHotel && (
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <span className="text-2xl">🛏️</span> Phòng
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{rooms.length} phòng</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Giảm giá (%)"
                      value={bulkDiscount}
                      onChange={(e) => setBulkDiscount(e.target.value)}
                      className="w-28 px-3 py-1 border border-gray-300 rounded text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleSetAllDiscount}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
                {rooms.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 text-sm">Chưa có phòng</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {rooms.map((room) => (
                      <motion.button
                        key={room.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRoom(room)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          selectedRoom?.id === room.id
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-sm">Phòng {room.Number}</div>
                            <div className="text-xs text-gray-600 mt-1">{room.type}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold text-blue-600">
                              {room.price?.toLocaleString('vi-VN')} VND
                            </div>
                            <div className={`text-xs mt-1 px-2 py-0.5 rounded ${
                              room.status === 'AVAILABLE' 
                                ? 'bg-green-100 text-green-700'
                                : room.status === 'BOOKED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {room.status === 'AVAILABLE' ? 'Trống' : room.status === 'BOOKED' ? 'Đã đặt' : 'Bảo trì'}
                            </div>
                          </div>
                        </div>
                        {room.image && (
                          <img
                            src={room.image}
                            alt={`Room ${room.Number}`}
                            className="w-full h-28 object-cover rounded-lg mt-2"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Content - Room Details & Calendar */}
          <div className="xl:col-span-2 space-y-4">
            {selectedHotel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-4 md:p-6"
              >
                {/* Hotel Images Section */}
                {selectedHotel.images && selectedHotel.images.length > 0 ? (
                  <div className="mb-4">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {selectedHotel.images.map((img) => (
                        <img
                          key={img.id}
                          src={img.imageUrl}
                          alt={selectedHotel.name}
                          className="w-full max-w-[200px] h-40 object-cover rounded-lg flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                ) : selectedHotel.image ? (
                  <div className="mb-4">
                    <img
                      src={selectedHotel.image}
                      alt={selectedHotel.name}
                      className="w-full max-w-md h-64 object-cover rounded-lg"
                    />
                  </div>
                ) : null}
                
                {/* Hotel Info Section */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
                      {selectedHotel.name}
                    </h3>
                    <div className="space-y-1.5">
                      <p className="text-sm sm:text-base text-gray-700 flex items-start gap-2">
                        <span className="text-gray-500 mt-0.5">📍</span>
                        <span className="break-words flex-1">{selectedHotel.address}</span>
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 flex items-center gap-2">
                        <span className="text-gray-500">☎</span>
                        <span>{selectedHotel.phone || 'Chưa cập nhật'}</span>
                      </p>
                      {selectedHotel.description && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed break-words">
                          {selectedHotel.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleOpenEditHotel(selectedHotel)}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition"
                    >
                      Chỉnh sửa thông tin khách sạn
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedRoom ? (
              <div className="space-y-4">
                {/* Room Details Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold mb-2 break-words">
                        Phòng {selectedRoom.Number} - {selectedRoom.type}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 break-words">{selectedHotel?.name}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {selectedRoom.price?.toLocaleString('vi-VN')} VND
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">/ đêm</div>
                    </div>
                  </div>
                  {selectedRoom.image && (
                    <img
                      src={selectedRoom.image}
                      alt={`Room ${selectedRoom.Number}`}
                      className="w-full h-64 object-cover rounded-2xl mb-6"
                    />
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600">Trạng thái</div>
                      <div className={`text-sm font-semibold mt-1 ${
                        selectedRoom.status === 'AVAILABLE' ? 'text-green-600' : 
                        selectedRoom.status === 'BOOKED' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {selectedRoom.status === 'AVAILABLE' ? 'Trống' : 
                         selectedRoom.status === 'BOOKED' ? 'Đã đặt' : 'Bảo trì'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600">Sức chứa</div>
                      <div className="text-sm font-semibold mt-1">{selectedRoom.capacity} người</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600">Giảm giá</div>
                      <div className="text-sm font-semibold mt-1 text-green-600">
                        {selectedRoom.discountPercent ? `${(selectedRoom.discountPercent * 100).toFixed(0)}%` : '0%'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600">Số booking</div>
                      <div className="text-sm font-semibold mt-1">{roomBookings.length}</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <FormattedNumberInput
                      value=""
                      onChange={(value) => {
                        if (value > 0) {
                          handleUpdateRoomPrice(selectedRoom.id, value)
                        }
                      }}
                      placeholder="Giá mới (VND)"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-0 sm:min-w-[150px]"
                      min={1}
                    />
                    <select
                      value={selectedRoom.status}
                      onChange={(e) => {
                        const status = e.target.value as 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE'
                        handleUpdateRoomStatus(selectedRoom.id, status)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
                    >
                      <option value="AVAILABLE">Trống</option>
                      <option value="BOOKED">Đã đặt</option>
                      <option value="MAINTENANCE">Bảo trì</option>
                    </select>
                  </div>
                </motion.div>

                {/* Room Edit Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <RoomEditForm
                    onSubmit={async (data: RoomEditFormData) => {
                      await handleSaveRoomDetails(data)
                    }}
                    defaultValues={{
                      type: selectedRoom.type,
                      capacity: selectedRoom.capacity,
                      discountPercent: selectedRoom.discountPercent,
                      imageUrl: selectedRoom.image || undefined,
                    }}
                  />
                </motion.div>

                {/* Calendar View */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg sm:text-xl font-bold">Lịch đặt phòng</h3>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() - 1)
                          setSelectedDate(newDate)
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex-shrink-0"
                      >
                        ←
                      </button>
                      <span className="text-xs sm:text-sm font-semibold flex-1 sm:min-w-[150px] text-center">
                        {selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() + 1)
                          setSelectedDate(newDate)
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex-shrink-0"
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
                  </div>

                  {loadingBookings ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Đang tải lịch đặt phòng...</p>
                    </div>
                  ) : (
                    <>
                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                            {day}
                          </div>
                        ))}
                        {generateCalendarDays().map((day, index) => {
                          if (!day) {
                            return <div key={`empty-${index}`} className="aspect-square" />
                          }
                          const isBooked = isDateBooked(day, roomBookings)
                          const booking = getBookingForDate(day, roomBookings)
                          const isToday = day.toDateString() === new Date().toDateString()
                          const isPast = day < new Date() && !isToday
                          
                          return (
                            <motion.div
                              key={day.toISOString()}
                              whileHover={{ scale: 1.1 }}
                              className={`aspect-square border-2 rounded-lg p-2 cursor-pointer transition ${
                                isBooked
                                  ? 'bg-red-50 border-red-300'
                                  : isPast
                                  ? 'bg-gray-100 border-gray-200 opacity-50'
                                  : 'bg-green-50 border-green-300 hover:bg-green-100'
                              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                              title={booking ? `Đã đặt: ${booking.user?.username || 'N/A'}` : isPast ? 'Quá khứ' : 'Trống'}
                            >
                              <div className={`text-xs font-semibold ${
                                isBooked ? 'text-red-700' : isPast ? 'text-gray-500' : 'text-green-700'
                              }`}>
                                {day.getDate()}
                              </div>
                              {booking && (
                                <div className="text-[10px] text-red-600 mt-1 truncate">
                                  {booking.user?.username || 'Đã đặt'}
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded"></div>
                          <span>Trống</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded"></div>
                          <span>Đã đặt</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded opacity-50"></div>
                          <span>Quá khứ</span>
                        </div>
                      </div>

                      {/* Bookings List */}
                      {roomBookings.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                          <h4 className="font-semibold mb-3">Chi tiết đặt phòng</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {roomBookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="bg-gray-50 p-3 rounded-lg text-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold">
                                      {new Date(booking.checkInDate).toLocaleDateString('vi-VN')} - {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-gray-600 text-xs mt-1">
                                      Khách: {booking.user?.username || 'N/A'} | {Number(booking.totalPrice).toLocaleString('vi-VN')} VND
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                    {booking.status === 'PAID' ? 'Đã thanh toán' : booking.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-lg p-12 text-center"
              >
                <div className="text-6xl mb-4">🛏️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chọn một phòng để xem chi tiết</h3>
                <p className="text-gray-600">
                  {selectedHotel ? 'Chọn phòng từ danh sách bên trái để xem lịch đặt phòng và quản lý' : 'Chọn khách sạn và phòng để bắt đầu'}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Tabs for Bookings, Transactions, Withdraws & Revenue */}
        <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            {[
              { id: 'bookings' as const, label: 'Đặt phòng', icon: '📋' },
              { id: 'transactions' as const, label: 'Giao dịch', icon: '💳' },
              { id: 'withdraws' as const, label: 'Rút tiền', icon: '💸' },
              { id: 'revenue' as const, label: 'Doanh thu', icon: '💰' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap transition flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="text-xs sm:text-sm md:text-base">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 md:p-6">
            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4">Danh sách đặt phòng</h2>
                {loadingAllBookings ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Đang tải danh sách đặt phòng...</p>
                  </div>
                ) : allBookings.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Chưa có đặt phòng nào</p>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Khách hàng</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Khách sạn</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Phòng</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Ngày nhận</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Ngày trả</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Tổng tiền</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Thanh toán</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Duyệt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allBookings.map((booking, index) => (
                          <motion.tr
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                              <div>
                                <div className="font-semibold break-words">{booking.user?.username || 'N/A'}</div>
                                {booking.user?.email && (
                                  <div className="text-gray-500 text-xs break-words">{booking.user.email}</div>
                                )}
                                {booking.user?.phone && (
                                  <div className="text-gray-500 text-xs break-words">📞 {booking.user.phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm break-words">
                              <div>
                                <div className="font-semibold">{booking.hotel?.name || 'N/A'}</div>
                                {booking.hotel?.address && (
                                  <div className="text-gray-500 text-xs">{booking.hotel.address}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                              {booking.rooms ? (
                                <div>
                                  <div className="font-semibold">
                                    Phòng {booking.rooms.Number || booking.rooms.number || 'N/A'}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    {booking.rooms.type} - {booking.rooms.capacity} người
                                  </div>
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                              {new Date(booking.checkInDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                              {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap">
                              {Number(booking.totalPrice).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(booking.status)}`}
                              >
                                {booking.status === 'PAID'
                                  ? '✅ Đã thanh toán'
                                  : booking.status === 'PENDING'
                                  ? '⏳ Chờ thanh toán'
                                  : booking.status === 'FAILED'
                                  ? '❌ Thất bại'
                                  : booking.status === 'REFUNDED'
                                  ? '↩️ Đã hoàn tiền'
                                  : '❓ Không xác định'}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                              {booking.transactionStatus && (
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    booking.transactionStatus === 'APPROVED'
                                      ? 'bg-green-100 text-green-700 border-green-300'
                                      : booking.transactionStatus === 'REJECTED'
                                      ? 'bg-red-100 text-red-700 border-red-300'
                                      : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                  }`}
                                >
                                  {booking.transactionStatus === 'APPROVED'
                                    ? '✅ Đã duyệt'
                                    : booking.transactionStatus === 'REJECTED'
                                    ? '❌ Từ chối'
                                    : '⏳ Chờ duyệt'}
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'transactions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4">Giao dịch của bạn</h2>
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Chưa có giao dịch nào</p>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">ID</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Khách sạn</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Tổng tiền</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Số tiền của bạn</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction, index) => (
                          <motion.tr
                            key={transaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">#{transaction.id}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm break-words">
                              {transaction.bookingEntity?.hotel?.name || 'N/A'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap">
                              {Number(transaction.amount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-green-600 whitespace-nowrap">
                              {(() => {
                                // Handle User_mount (PascalCase)
                                const userMount = transaction.User_mount
                                if (userMount == null || userMount === undefined) return '0'
                                const numValue = typeof userMount === 'string' ? parseFloat(userMount) : Number(userMount)
                                return isNaN(numValue) ? '0' : numValue.toLocaleString('vi-VN')
                              })()} VND
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  transaction.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-700'
                                    : transaction.status === 'REJECTED'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {transaction.status === 'APPROVED'
                                  ? 'Đã duyệt'
                                  : transaction.status === 'REJECTED'
                                  ? 'Từ chối'
                                  : 'Chờ duyệt'}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'withdraws' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Yêu cầu rút tiền</h2>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm whitespace-nowrap"
                  >
                    + Tạo yêu cầu
                  </button>
                </div>
                {withdraws.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Chưa có yêu cầu rút tiền nào</p>
                ) : (
                  <div className="space-y-3">
                    {withdraws.map((withdraw, index) => (
                      <motion.div
                        key={withdraw.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base break-words">
                              {Number(withdraw.amount).toLocaleString('vi-VN')} VND
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                              {withdraw.bankName} - {withdraw.accountNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(withdraw.create_AT).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded text-xs font-semibold ${
                              withdraw.status === 'resolved'
                                ? 'bg-green-100 text-green-700'
                                : withdraw.status === 'refuse'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {withdraw.status === 'resolved'
                              ? 'Đã duyệt'
                              : withdraw.status === 'refuse'
                              ? 'Từ chối'
                              : 'Chờ duyệt'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'revenue' && (
          <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 space-y-6"
          >
                <h2 className="text-xl md:text-2xl font-bold mb-4">Quản lý doanh thu</h2>
                {!revenue ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Đang tải dữ liệu doanh thu...</p>
                </div>
                ) : (
                  <>
                    {/* Revenue Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="text-xs sm:text-sm opacity-90 mb-2">Tổng doanh thu</div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
                          {Number(revenue.totalRevenue).toLocaleString('vi-VN')} VND
                </div>
              </div>
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                        <div className="text-xs sm:text-sm opacity-90 mb-2">Chờ duyệt</div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
                          {Number(revenue.pendingRevenue).toLocaleString('vi-VN')} VND
              </div>
              </div>
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="text-xs sm:text-sm opacity-90 mb-2">Giao dịch đã duyệt</div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                          {revenue.approvedTransactions} / {revenue.totalTransactions}
                        </div>
                      </div>
                    </div>

                    {/* Revenue by Hotel Chart */}
                    {revenue.hotelRevenues && revenue.hotelRevenues.length > 0 && (
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Doanh thu theo khách sạn</h3>
                        <Column
                          data={revenue.hotelRevenues.flatMap((hr) => [
                            { hotel: hr.hotelName, type: 'Đã duyệt', value: Number(hr.totalRevenue) },
                            { hotel: hr.hotelName, type: 'Chờ duyệt', value: Number(hr.pendingRevenue) },
                          ])}
                          xField="hotel"
                          yField="value"
                          seriesField="type"
                          isStack={true}
                          height={300}
                          legend={{
                            position: 'top' as const,
                          }}
                          label={{
                            position: 'middle' as const,
                            formatter: (datum: { value: number }) =>
                              datum.value > 0 ? `${Number(datum.value).toLocaleString('vi-VN')} VND` : '',
                          }}
                        />
                        </div>
                    )}

                    {/* Revenue by Hotel Table */}
                    {revenue.hotelRevenues && revenue.hotelRevenues.length > 0 && (
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Chi tiết doanh thu theo khách sạn</h3>
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                          <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Khách sạn</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Doanh thu đã duyệt</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Chờ duyệt</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Tổng booking</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Đã duyệt</th>
                              </tr>
                            </thead>
                            <tbody>
                              {revenue.hotelRevenues.map((hr, index) => (
                                <motion.tr
                                  key={hr.hotelId}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="border-b hover:bg-gray-50"
                                >
                                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold break-words">{hr.hotelName}</td>
                                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-green-600 font-semibold whitespace-nowrap">
                                    {Number(hr.totalRevenue).toLocaleString('vi-VN')} VND
                                  </td>
                                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-yellow-600 font-semibold whitespace-nowrap">
                                    {Number(hr.pendingRevenue).toLocaleString('vi-VN')} VND
                                  </td>
                                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{hr.totalBookings}</td>
                                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-green-600">{hr.approvedBookings}</td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                    </div>
                  </div>
                )}

                    {(!revenue.hotelRevenues || revenue.hotelRevenues.length === 0) && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-gray-600">Chưa có dữ liệu doanh thu</p>
              </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Create Hotel Modal */}
      <AppModal
        isOpen={showCreateHotel}
        onClose={() => {
          setShowCreateHotel(false)
          resetCreateHotelForm()
        }}
        title="Tạo khách sạn mới"
        size="xl"
      >
        <HotelForm
          onSubmit={async (data: HotelFormData, images: File[]) => {
            if (images.length === 0) {
              showError('Vui lòng chọn ít nhất một ảnh khách sạn')
              return
            }
            if (createHotelRooms.length === 0) {
              showError('Vui lòng thêm ít nhất một phòng')
              return
            }
            const invalidRoom = createHotelRooms.some(
              (room) =>
                !room.number.trim() ||
                !room.price ||
                Number(room.price) <= 0 ||
                Number.isNaN(Number(room.price)) ||
                !room.image,
            )
            if (invalidRoom) {
              showError('Vui lòng nhập đầy đủ thông tin và ảnh cho từng phòng')
              return
            }
            try {
              setCreateHotelSubmitting(true)
              showSuccess('Đang tải ảnh khách sạn lên Cloudinary...')
              const hotelImageUrls: string[] = []
              for (const imageFile of images) {
                const imageResult = await cloudinaryService.uploadImage(imageFile)
                hotelImageUrls.push(imageResult.secure_url)
              }
              showSuccess('Đang tải ảnh phòng lên Cloudinary...')
              const roomImageUrls: string[] = []
              for (const room of createHotelRooms) {
                if (room.image) {
                  const roomImageResult = await cloudinaryService.uploadImage(room.image)
                  roomImageUrls.push(roomImageResult.secure_url)
                }
              }
              await ownerService.createHotel(
                {
                  name: data.name.trim(),
                  address: data.address.trim(),
                  phone: data.phone.trim(),
                  description: data.description?.trim() || '',
                  rooms: createHotelRooms.map((room) => ({
                    number: room.number.trim(),
                    price: Number(room.price),
                  })),
                },
                hotelImageUrls,
                roomImageUrls,
              )
              showSuccess('Tạo khách sạn thành công!')
              resetCreateHotelForm()
              setShowCreateHotel(false)
              fetchHotels(true)
            } catch (err: unknown) {
              const error = err as { response?: { data?: { message?: string } }; message?: string }
              showError(error.response?.data?.message || (error as Error).message || 'Không thể tạo khách sạn')
            } finally {
              setCreateHotelSubmitting(false)
            }
          }}
          submitLabel="Tạo khách sạn"
          isSubmitting={createHotelSubmitting}
          onCancel={() => {
            setShowCreateHotel(false)
            resetCreateHotelForm()
          }}
        />
        {/* Room Form Section - Keep existing room form logic */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Danh sách phòng</h3>
                  <button
                    type="button"
                    onClick={handleAddRoomField}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
                  >
                    + Thêm phòng
                  </button>
                </div>
          <div className="space-y-4">
                {createHotelRooms.map((room, index) => (
              <div key={`room-${index}`} className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số phòng</label>
                        <input
                          type="text"
                          value={room.number}
                          onChange={(e) => handleRoomFieldChange(index, 'number', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                      <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Giá (VND)</label>
                        <FormattedNumberInput
                          value={room.price}
                          onChange={(value) => handleRoomFieldChange(index, 'price', value.toString())}
                          placeholder="Nhập giá phòng"
                          className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          min={1}
                          required
                        />
                      </div>
                      <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh phòng</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleRoomImageChange(index, e.target.files ? e.target.files[0] : null)}
                          className="w-full text-sm text-gray-600"
                          required
                        />
                        {room.image && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(room.image)}
                          alt="Preview"
                          className="w-full h-20 object-cover rounded-xl"
                        />
                          <p className="text-xs text-green-600 mt-1">Đã chọn: {room.image.name}</p>
                      </div>
                        )}
                      </div>
                    </div>
                    {createHotelRooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRoomField(index)}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Xóa phòng
                      </button>
                    )}
                  </div>
                ))}
              </div>
              </div>
      </AppModal>

      {/* Edit Hotel Modal */}
      <AppModal
        isOpen={showEditHotelModal}
        onClose={() => {
          setShowEditHotelModal(false)
          setHotelForm({ name: '', address: '', phone: '', description: '', images: [] })
        }}
        title={`Chỉnh sửa ${selectedHotel?.name || 'khách sạn'}`}
        size="lg"
      >
        {selectedHotel && (
          <HotelForm
            defaultValues={{
              name: hotelForm.name || selectedHotel.name || '',
              address: hotelForm.address || selectedHotel.address || '',
              phone: hotelForm.phone || selectedHotel.phone || '',
              description: hotelForm.description || selectedHotel.description || '',
            }}
            defaultImages={hotelForm.images}
            existingImages={selectedHotel.images || []}
            onSubmit={async (data: HotelFormData, images: File[]) => {
              if (!selectedHotel) return
              try {
                let hotelImageUrls: string[] | undefined
                if (images.length > 0) {
                  showSuccess('Đang tải ảnh lên Cloudinary...')
                  hotelImageUrls = []
                  for (const imageFile of images) {
                    const imageResult = await cloudinaryService.uploadImage(imageFile)
                    hotelImageUrls.push(imageResult.secure_url)
                  }
                }
                await ownerService.updateHotel(
                  selectedHotel.id,
                  {
                    name: data.name,
                    address: data.address,
                    phone: data.phone,
                    description: data.description || '',
                  },
                  hotelImageUrls,
                )
                showSuccess('Cập nhật khách sạn thành công!')
                  setShowEditHotelModal(false)
                  setHotelForm({ name: '', address: '', phone: '', description: '', images: [] })
                fetchHotels()
              } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } }; message?: string }
                showError(error.response?.data?.message || (error as Error).message || 'Không thể cập nhật khách sạn')
              }
            }}
            submitLabel="Lưu thay đổi"
            onCancel={() => {
              setShowEditHotelModal(false)
              setHotelForm({ name: '', address: '', phone: '', description: '', images: [] })
            }}
          />
        )}
      </AppModal>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Yêu cầu rút tiền</h2>
            <WithdrawForm
              onSubmit={handleCreateWithdraw}
              onCancel={() => setShowWithdrawModal(false)}
              maxAmount={walletBalance || undefined}
            />
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default OwnerDashboard
