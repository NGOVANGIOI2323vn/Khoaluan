import { useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { hotelService, ownerService } from '../services'
import { bookingService } from '../services/bookingService'
import type { Hotel, Room } from '../services/hotelService'
import type { BookingTransaction, WithdrawRequest } from '../services/ownerService'
import type { Booking } from '../services/bookingService'
import Header from '../components/Header'
import { useToast } from '../hooks/useToast'

const roomTypes = ['STANDARD', 'DELUXE', 'SUITE', 'SUPERIOR', 'EXECUTIVE', 'FAMILY', 'STUDIO']

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'hotels' | 'rooms' | 'transactions' | 'withdraws'>('hotels')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomBookings, setRoomBookings] = useState<Booking[]>([])
  const [transactions, setTransactions] = useState<BookingTransaction[]>([])
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [showCreateHotel, setShowCreateHotel] = useState(false)
  const [showEditHotelModal, setShowEditHotelModal] = useState(false)
  const [hotelForm, setHotelForm] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    image: null as File | null,
  })
  type CreateHotelRoomForm = { number: string; price: string; image: File | null }
  const [createHotelForm, setCreateHotelForm] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    image: null as File | null,
  })
  const [createHotelRooms, setCreateHotelRooms] = useState<CreateHotelRoomForm[]>([
    { number: '', price: '', image: null },
  ])
  const [createHotelSubmitting, setCreateHotelSubmitting] = useState(false)
  const [deletingHotelId, setDeletingHotelId] = useState<number | null>(null)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    accountNumber: '',
    bankName: '',
    accountHolderName: '',
  })
  const [roomEditForm, setRoomEditForm] = useState({
    type: '',
    capacity: '',
    discountPercent: '',
    image: null as File | null,
  })
  const [bulkDiscount, setBulkDiscount] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { showSuccess, showError } = useToast()

  const fetchHotels = async (resetSelection = false) => {
    try {
      setLoading(true)
      const response = await ownerService.getMyHotels()
      if (response.data) {
        const hotelsList = Array.isArray(response.data) ? response.data : []
        setHotels(hotelsList)
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
      setRoomEditForm({
        type: selectedRoom.type || '',
        capacity: selectedRoom.capacity ? String(selectedRoom.capacity) : '',
        discountPercent: selectedRoom.discountPercent
          ? String(Math.round(selectedRoom.discountPercent * 100))
          : '0',
        image: null,
      })
    } else {
      setRoomBookings([])
      setRoomEditForm({
        type: '',
        capacity: '',
        discountPercent: '',
        image: null,
      })
    }
  }, [selectedRoom, fetchRoomBookings])

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions()
    } else if (activeTab === 'withdraws') {
      fetchWithdraws()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

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
        setWithdraws(response.data)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải yêu cầu rút tiền')
    }
  }

  const handleCreateWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const amount = parseFloat(withdrawForm.amount)
      if (amount <= 0) {
        showError('Số tiền phải lớn hơn 0')
        return
      }
      const response = await ownerService.createWithdraw({
        amount,
        accountNumber: withdrawForm.accountNumber,
        bankName: withdrawForm.bankName,
        accountHolderName: withdrawForm.accountHolderName,
      })
      if (response.data) {
        showSuccess('Yêu cầu rút tiền đã được gửi thành công!')
        setWithdrawForm({ amount: '', accountNumber: '', bankName: '', accountHolderName: '' })
        setShowWithdrawModal(false)
        fetchWithdraws()
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
      image: null,
    })
    setShowEditHotelModal(true)
  }

  type HotelFormField = 'name' | 'address' | 'phone' | 'description' | 'image'
  const handleHotelInputChange = (field: HotelFormField, value: string | File | null) => {
    setHotelForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleUpdateHotel = async () => {
    if (!selectedHotel) return
    try {
      await ownerService.updateHotel(
        selectedHotel.id,
        {
          name: hotelForm.name,
          address: hotelForm.address,
          phone: hotelForm.phone,
          description: hotelForm.description,
        },
        hotelForm.image || undefined,
      )
      showSuccess('Cập nhật khách sạn thành công!')
      setShowEditHotelModal(false)
      setHotelForm({ name: '', address: '', phone: '', description: '', image: null })
      fetchHotels()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể cập nhật khách sạn')
    }
  }

  const resetCreateHotelForm = () => {
    setCreateHotelForm({ name: '', address: '', phone: '', description: '', image: null })
    setCreateHotelRooms([{ number: '', price: '', image: null }])
  }

  const handleCreateHotelTextChange = (field: 'name' | 'address' | 'phone' | 'description', value: string) => {
    setCreateHotelForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreateHotelImageChange = (file: File | null) => {
    setCreateHotelForm((prev) => ({
      ...prev,
      image: file,
    }))
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

  const handleSubmitCreateHotel = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!createHotelForm.name.trim() || !createHotelForm.address.trim() || !createHotelForm.phone.trim()) {
      showError('Vui lòng nhập đầy đủ thông tin khách sạn')
      return
    }
    if (!createHotelForm.image) {
      showError('Vui lòng chọn ảnh khách sạn')
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
      await ownerService.createHotel(
        {
          name: createHotelForm.name.trim(),
          address: createHotelForm.address.trim(),
          phone: createHotelForm.phone.trim(),
          description: createHotelForm.description.trim(),
          rooms: createHotelRooms.map((room) => ({
            number: room.number.trim(),
            price: Number(room.price),
          })),
        },
        createHotelForm.image,
        createHotelRooms.map((room) => room.image as File),
      )
      showSuccess('Tạo khách sạn thành công!')
      resetCreateHotelForm()
      setShowCreateHotel(false)
      fetchHotels(true)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tạo khách sạn')
    } finally {
      setCreateHotelSubmitting(false)
    }
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

  const handleSaveRoomDetails = async () => {
    if (!selectedRoom) return
    try {
      const promises: Promise<unknown>[] = []
      if (roomEditForm.type && roomEditForm.type !== selectedRoom.type) {
        promises.push(ownerService.updateRoomType(selectedRoom.id, roomEditForm.type))
      }
      if (roomEditForm.capacity && Number(roomEditForm.capacity) !== selectedRoom.capacity) {
        promises.push(ownerService.updateRoomCapacity(selectedRoom.id, Number(roomEditForm.capacity)))
      }
      if (
        roomEditForm.discountPercent !== '' &&
        selectedRoom.discountPercent !== Number(roomEditForm.discountPercent) / 100
      ) {
        promises.push(ownerService.updateRoomDiscount(selectedRoom.id, Number(roomEditForm.discountPercent) / 100))
      }
      if (roomEditForm.image) {
        promises.push(ownerService.updateRoomImage(selectedRoom.id, roomEditForm.image))
      }
      if (promises.length === 0) {
        showSuccess('Không có thay đổi để cập nhật')
        return
      }
      await Promise.all(promises)
      showSuccess('Cập nhật thông tin phòng thành công')
      if (selectedHotel) fetchRooms(selectedHotel.id)
      fetchRoomBookings(selectedRoom.id)
      setRoomEditForm((prev) => ({ ...prev, image: null }))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể cập nhật phòng')
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
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
              Quản lý khách sạn
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateHotel(true)}
              className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-sm md:text-base"
            >
              + Thêm khách sạn
            </motion.button>
          </div>
          <p className="text-gray-600">Quản lý khách sạn và phòng của bạn</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            { label: 'Tổng khách sạn', value: hotels.length, icon: '🏨', color: 'bg-blue-500' },
            { label: 'Tổng phòng', value: rooms.length, icon: '🛏️', color: 'bg-green-500' },
            { label: 'Phòng trống', value: rooms.filter(r => r.status === 'AVAILABLE').length, icon: '✅', color: 'bg-purple-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`${stat.color} rounded-xl p-4 md:p-6 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl md:text-3xl">{stat.icon}</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm md:text-base opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Hotels & Rooms List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Hotels List */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>🏨</span> Khách sạn
              </h2>
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">Đang tải...</p>
                </div>
              ) : hotels.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">Chưa có khách sạn</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {hotels.map((hotel) => (
                    <motion.button
                      key={hotel.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedHotel(hotel)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedHotel?.id === hotel.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex gap-3">
                        {hotel.image && (
                          <img
                            src={hotel.image}
                            alt={hotel.name}
                            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-sm">{hotel.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{hotel.address}</div>
                        </div>
                      </div>
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-0.5 rounded ${
                          hotel.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {hotel.status === 'success' ? '✓ Hoạt động' : '⏳ Chờ duyệt'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleOpenEditHotel(hotel)
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteHotel(hotel.id)
                          }}
                          className="text-red-600 hover:underline disabled:text-gray-400"
                          disabled={deletingHotelId === hotel.id}
                        >
                          {deletingHotelId === hotel.id ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Rooms List */}
            {selectedHotel && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span>🛏️</span> Phòng
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
          <div className="lg:col-span-2 space-y-4">
            {selectedHotel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-4 flex flex-wrap gap-4 items-center"
              >
                {selectedHotel.image && (
                  <img
                    src={selectedHotel.image}
                    alt={selectedHotel.name}
                    className="w-full md:w-48 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-xl font-bold">{selectedHotel.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedHotel.address}</p>
                  <p className="text-sm text-gray-600">☎ {selectedHotel.phone || 'Chưa cập nhật'}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{selectedHotel.description || 'Chưa có mô tả'}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenEditHotel(selectedHotel)}
                    className="mt-3 text-sm text-blue-600 hover:underline"
                  >
                    Chỉnh sửa thông tin khách sạn
                  </button>
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
                  <div className="flex items-start justify-between gap-6 mb-4 flex-wrap">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Phòng {selectedRoom.Number} - {selectedRoom.type}
                      </h2>
                      <p className="text-gray-600">{selectedHotel?.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedRoom.price?.toLocaleString('vi-VN')} VND
                      </div>
                      <div className="text-sm text-gray-600">/ đêm</div>
                    </div>
                  </div>
                  {selectedRoom.image && (
                    <img
                      src={selectedRoom.image}
                      alt={`Room ${selectedRoom.Number}`}
                      className="w-full h-64 object-cover rounded-2xl mb-6"
                    />
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="number"
                      placeholder="Giá mới (VND)"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-[150px]"
                      onBlur={(e) => {
                        const newPrice = parseFloat(e.target.value)
                        if (newPrice > 0) {
                          handleUpdateRoomPrice(selectedRoom.id, newPrice)
                        }
                      }}
                    />
                    <select
                      value={selectedRoom.status}
                      onChange={(e) => {
                        const status = e.target.value as 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE'
                        handleUpdateRoomStatus(selectedRoom.id, status)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                  <h3 className="text-xl font-bold mb-4">Cập nhật thông tin phòng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Loại phòng</label>
                      <select
                        value={roomEditForm.type}
                        onChange={(e) => setRoomEditForm((prev) => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Chọn loại phòng</option>
                        {roomTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Sức chứa</label>
                      <input
                        type="number"
                        min="1"
                        value={roomEditForm.capacity}
                        onChange={(e) => setRoomEditForm((prev) => ({ ...prev, capacity: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Giảm giá (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={roomEditForm.discountPercent}
                        onChange={(e) => setRoomEditForm((prev) => ({ ...prev, discountPercent: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Ảnh phòng</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setRoomEditForm((prev) => ({
                            ...prev,
                            image: e.target.files ? e.target.files[0] : null,
                          }))
                        }
                        className="w-full text-sm text-gray-600"
                      />
                      {selectedRoom.image && (
                        <img
                          src={selectedRoom.image}
                          alt={`Room ${selectedRoom.Number}`}
                          className="mt-2 w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      {roomEditForm.image && (
                        <p className="text-xs text-green-600 mt-1">Đã chọn: {roomEditForm.image.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveRoomDetails}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </motion.div>

                {/* Calendar View */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Lịch đặt phòng</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() - 1)
                          setSelectedDate(newDate)
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        ←
                      </button>
                      <span className="text-sm font-semibold min-w-[150px] text-center">
                        {selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate)
                          newDate.setMonth(newDate.getMonth() + 1)
                          setSelectedDate(newDate)
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        →
                      </button>
                      <button
                        onClick={() => setSelectedDate(new Date())}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
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
                      <div className="grid grid-cols-7 gap-2 mb-4">
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
                      <div className="flex items-center gap-4 text-sm">
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

        {/* Tabs for Transactions & Withdraws */}
        <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'transactions' as const, label: 'Giao dịch', icon: '💳' },
              { id: 'withdraws' as const, label: 'Rút tiền', icon: '💸' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm md:text-base">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 md:p-6">
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Khách sạn</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Tổng tiền</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Số tiền của bạn</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
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
                            <td className="px-4 py-3 text-sm">#{transaction.id}</td>
                            <td className="px-4 py-3 text-sm">
                              {transaction.bookingEntity?.hotel?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {Number(transaction.amount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-4 py-3 text-sm text-green-600">
                              {Number(transaction.User_mount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-4 py-3">
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-bold">Yêu cầu rút tiền</h2>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
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
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {Number(withdraw.amount).toLocaleString('vi-VN')} VND
                            </p>
                            <p className="text-sm text-gray-600">
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
          </div>
        </div>
      </div>

      {/* Create Hotel Modal */}
      {showCreateHotel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">Tạo khách sạn mới</h2>
            <form onSubmit={handleSubmitCreateHotel} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Tên khách sạn</label>
                  <input
                    type="text"
                    value={createHotelForm.name}
                    onChange={(e) => handleCreateHotelTextChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Số điện thoại</label>
                  <input
                    type="text"
                    value={createHotelForm.phone}
                    onChange={(e) => handleCreateHotelTextChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Địa chỉ</label>
                <input
                  type="text"
                  value={createHotelForm.address}
                  onChange={(e) => handleCreateHotelTextChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Mô tả</label>
                <textarea
                  value={createHotelForm.description}
                  onChange={(e) => handleCreateHotelTextChange('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Ảnh khách sạn</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCreateHotelImageChange(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-600"
                  required
                />
                {createHotelForm.image && (
                  <p className="text-xs text-green-600 mt-1">Đã chọn: {createHotelForm.image.name}</p>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Danh sách phòng</h3>
                  <button
                    type="button"
                    onClick={handleAddRoomField}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Thêm phòng
                  </button>
                </div>
                {createHotelRooms.map((room, index) => (
                  <div key={`room-${index}`} className="border border-gray-200 rounded-lg p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Số phòng</label>
                        <input
                          type="text"
                          value={room.number}
                          onChange={(e) => handleRoomFieldChange(index, 'number', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Giá (VND)</label>
                        <input
                          type="number"
                          min="0"
                          value={room.price}
                          onChange={(e) => handleRoomFieldChange(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Ảnh phòng</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleRoomImageChange(index, e.target.files ? e.target.files[0] : null)}
                          className="w-full text-sm text-gray-600"
                          required
                        />
                        {room.image && (
                          <p className="text-xs text-green-600 mt-1">Đã chọn: {room.image.name}</p>
                        )}
                      </div>
                    </div>
                    {createHotelRooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRoomField(index)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Xóa phòng
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateHotel(false)
                    resetCreateHotelForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={createHotelSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  disabled={createHotelSubmitting}
                >
                  {createHotelSubmitting ? 'Đang tạo...' : 'Tạo khách sạn'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showEditHotelModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa {selectedHotel.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tên khách sạn</label>
                <input
                  type="text"
                  value={hotelForm.name}
                  onChange={(e) => handleHotelInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Địa chỉ</label>
                <input
                  type="text"
                  value={hotelForm.address}
                  onChange={(e) => handleHotelInputChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Số điện thoại</label>
                  <input
                    type="text"
                    value={hotelForm.phone}
                    onChange={(e) => handleHotelInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Ảnh khách sạn</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleHotelInputChange('image', e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-600"
                  />
                  {selectedHotel.image && (
                    <img
                      src={selectedHotel.image}
                      alt={selectedHotel.name}
                      className="mt-2 w-full h-40 object-cover rounded-lg"
                    />
                  )}
                  {hotelForm.image && (
                    <p className="text-xs text-green-600 mt-1">Đã chọn: {hotelForm.image.name}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Mô tả</label>
                <textarea
                  value={hotelForm.description}
                  onChange={(e) => handleHotelInputChange('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditHotelModal(false)
                  setHotelForm({ name: '', address: '', phone: '', description: '', image: null })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpdateHotel}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Lưu
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4">Yêu cầu rút tiền</h2>
            <form onSubmit={handleCreateWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Số tiền (VND)</label>
                <input
                  type="number"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Tên ngân hàng</label>
                <input
                  type="text"
                  value={withdrawForm.bankName}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                  placeholder="VD: Vietcombank"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Số tài khoản</label>
                <input
                  type="text"
                  value={withdrawForm.accountNumber}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={withdrawForm.accountHolderName}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolderName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Gửi yêu cầu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false)
                    setWithdrawForm({ amount: '', accountNumber: '', bankName: '', accountHolderName: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default OwnerDashboard
