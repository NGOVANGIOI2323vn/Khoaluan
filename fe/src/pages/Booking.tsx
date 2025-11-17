import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { hotelService } from '../services/hotelService'
import { useToast } from '../hooks/useToast'
import type { Hotel, Room } from '../services/hotelService'
// Booking form data interface
interface BookingFormData {
  checkIn: string
  checkOut: string
  adults: number
  children: number
  roomType: string
  specialRequests?: string
}

const Booking = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showWarning } = useToast()

  // Lấy thông tin từ query params hoặc state nếu có
  const searchParams = new URLSearchParams(location.search)
  const roomIdParam = searchParams.get('roomId')
  const [formData, setFormData] = useState<BookingFormData>({
    checkIn: searchParams.get('checkIn') || new Date().toISOString().split('T')[0],
    checkOut: searchParams.get('checkOut') || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    adults: parseInt(searchParams.get('adults') || '2'),
    children: parseInt(searchParams.get('children') || '0'),
    roomType: roomIdParam || '',
    specialRequests: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const [hotelRes, roomsRes] = await Promise.all([
          hotelService.getHotelById(Number(id)),
          hotelService.getRoomsByHotelId(Number(id)),
        ])
        if (hotelRes.data) setHotel(hotelRes.data)
        if (roomsRes.data) {
          setRooms(roomsRes.data)
          // Nếu có roomId trong params và chưa chọn room, chọn room đó
          if (roomIdParam) {
            const selectedRoom = roomsRes.data.find((r) => r.id === Number(roomIdParam))
            if (selectedRoom) {
              setFormData((prev) => ({ ...prev, roomType: selectedRoom.id.toString() }))
            }
          }
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        setError(error.response?.data?.message || 'Không thể tải thông tin khách sạn')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, roomIdParam])

  const selectedRoom = rooms.find((r) => r.id.toString() === formData.roomType) || rooms[0]

  const calculateNights = () => {
    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(formData.checkOut)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }

  const nights = calculateNights()
  const roomPrice = selectedRoom ? (selectedRoom.discountPercent > 0 
    ? selectedRoom.price * (1 - selectedRoom.discountPercent / 100)
    : selectedRoom.price) : 0
  const subtotal = roomPrice * nights
  const total = subtotal

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom) {
      showWarning('Vui lòng chọn phòng')
      return
    }
    // Lưu thông tin booking vào localStorage hoặc state management
    const bookingInfo = {
      hotelId: hotel?.id,
      hotelName: hotel?.name,
      hotelImage: hotel?.image,
      hotelAddress: hotel?.address,
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.Number,
      ...formData,
      roomTypeName: selectedRoom.type,
      roomPrice,
      nights,
      subtotal,
      total,
      checkInDate: formData.checkIn,
      checkOutDate: formData.checkOut,
    }
    localStorage.setItem('bookingInfo', JSON.stringify(bookingInfo))
    navigate(`/checkout?roomId=${selectedRoom.id}&hotelId=${hotel?.id}&checkIn=${formData.checkIn}&checkOut=${formData.checkOut}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600">Đang tải thông tin khách sạn...</p>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
            {error || 'Khách sạn không tìm thấy'}
          </h1>
          <button
            onClick={() => navigate('/hotels')}
            className="text-blue-600 hover:underline"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Đặt phòng</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <span>📍</span>
            <span>{hotel.name}</span>
            {hotel.city && (
              <>
                <span>•</span>
                <span>{hotel.city}</span>
              </>
            )}
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-4 md:p-6"
            >
              <div className="flex gap-4">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-bold mb-2">{hotel.name}</h2>
                  <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 mb-2">
                    <span>⭐</span>
                    <span>{hotel.rating || 0}</span>
                    {hotel.city && (
                      <>
                        <span>•</span>
                        <span>{hotel.city}</span>
                      </>
                    )}
                  </div>
                  {hotel.address && (
                    <p className="text-sm text-gray-600 mb-2">{hotel.address}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Dates & Guests */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-4 md:p-6"
            >
              <h2 className="text-lg md:text-xl font-bold mb-4">Ngày nhận phòng & Số khách</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Ngày nhận phòng</label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Ngày trả phòng</label>
                  <input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    min={formData.checkIn}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Số người lớn</label>
                  <select
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} người lớn
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Số trẻ em</label>
                  <select
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[0, 1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} trẻ em
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Room Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-4 md:p-6"
            >
              <h2 className="text-lg md:text-xl font-bold mb-4">Chọn loại phòng</h2>
              {rooms.length === 0 ? (
                <p className="text-center text-gray-600 py-8">Không có phòng nào</p>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room, index) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        formData.roomType === room.id.toString()
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      } ${room.status !== 'AVAILABLE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (room.status === 'AVAILABLE') {
                          setFormData({ ...formData, roomType: room.id.toString() })
                        }
                      }}
                    >
                      <div className="flex gap-4">
                        {room.image && (
                          <img
                            src={room.image}
                            alt={room.type}
                            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-base md:text-lg">Phòng {room.Number} - {room.type}</h3>
                              <p className="text-sm text-gray-600">Sức chứa: {room.capacity} người</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg md:text-xl font-bold text-blue-600">
                                {room.discountPercent > 0 ? (
                                  <>
                                    <span className="line-through text-gray-400 text-base">
                                      {room.price.toLocaleString('vi-VN')}
                                    </span>{' '}
                                    {(room.price * (1 - room.discountPercent / 100)).toLocaleString('vi-VN')} VND
                                  </>
                                ) : (
                                  `${room.price.toLocaleString('vi-VN')} VND`
                                )}
                              </p>
                              <p className="text-xs text-gray-500">/ đêm</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              room.status === 'AVAILABLE' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {room.status === 'AVAILABLE' ? '✓ Có sẵn' : '✗ Không khả dụng'}
                            </span>
                            {room.discountPercent > 0 && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                Giảm {room.discountPercent}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="roomType"
                            value={room.id.toString()}
                            checked={formData.roomType === room.id.toString()}
                            onChange={() => {
                              if (room.status === 'AVAILABLE') {
                                setFormData({ ...formData, roomType: room.id.toString() })
                              }
                            }}
                            disabled={room.status !== 'AVAILABLE'}
                            className="w-5 h-5 text-blue-600"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Special Requests */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-4 md:p-6"
            >
              <h2 className="text-lg md:text-xl font-bold mb-4">Yêu cầu đặc biệt (tùy chọn)</h2>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Ví dụ: Phòng tầng cao, giường cạnh cửa sổ, không hút thuốc..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </motion.div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-4 md:p-6 sticky top-4"
            >
              <h2 className="text-lg md:text-xl font-bold mb-4">Tóm tắt đặt phòng</h2>
              <div className="space-y-4 mb-6">
                {selectedRoom && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giá phòng ({nights} đêm)</span>
                      <span className="font-semibold">{roomPrice.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng phòng</span>
                      <span className="font-semibold">{subtotal.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-blue-600">{total.toLocaleString('vi-VN')} VND</span>
                      </div>
                    </div>
                  </>
                )}
                {!selectedRoom && (
                  <p className="text-sm text-gray-600 text-center py-4">Vui lòng chọn phòng</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-base md:text-lg"
              >
                Tiếp tục thanh toán
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                Bạn sẽ không bị tính phí ngay bây giờ
              </p>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Booking

