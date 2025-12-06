import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import GoogleMapComponent from '../components/GoogleMap'
import RoomAvailability from '../components/RoomAvailability'
import { hotelService } from '../services/hotelService'
import { useToast } from '../hooks/useToast'
import type { Hotel, Room, HotelReview } from '../services/hotelService'

const HotelDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showSuccess, showError } = useToast()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [reviews, setReviews] = useState<HotelReview[]>([])
  const [activeTab, setActiveTab] = useState<'about' | 'rooms' | 'reviews'>('rooms')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  
  // Lấy dates từ URL params
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(!!token)
    }
    checkAuth()
    window.addEventListener('storage', checkAuth)
    window.addEventListener('localStorageUpdate', checkAuth)
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('localStorageUpdate', checkAuth)
    }
  }, [])

  const fetchData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [hotelRes, roomsRes, reviewsRes] = await Promise.all([
        hotelService.getHotelById(Number(id)),
        hotelService.getRoomsByHotelId(Number(id)),
        hotelService.getReviewsByHotelId(Number(id)),
      ])
      if (hotelRes.data) setHotel(hotelRes.data)
      if (roomsRes.data) setRooms(roomsRes.data)
      if (reviewsRes.data) setReviews(reviewsRes.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Không thể tải thông tin khách sạn. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewError('')
    
    if (!isAuthenticated) {
      showError('Vui lòng đăng nhập để có thể đánh giá khách sạn.')
      navigate('/login')
      return
    }
    
    if (!reviewForm.comment.trim()) {
      setReviewError('Vui lòng nhập nội dung đánh giá')
      return
    }
    
    if (reviewForm.comment.trim().length < 10) {
      setReviewError('Nội dung đánh giá phải có ít nhất 10 ký tự')
      return
    }
    
    if (reviewForm.comment.trim().length > 1000) {
      setReviewError('Nội dung đánh giá không được quá 1000 ký tự')
      return
    }
    
    if (!id) return

    try {
      setSubmittingReview(true)
      const response = await hotelService.createReview(
        Number(id),
        reviewForm.rating,
        reviewForm.comment
      )
      if (response.data) {
        showSuccess('Đánh giá của bạn đã được gửi thành công!')
        setReviewForm({ rating: 5, comment: '' })
        setShowReviewForm(false)
        // Refresh reviews
        await fetchData()
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Tính rating trung bình
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

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
          <a href="/hotels" className="text-blue-600 hover:underline">
            Quay lại danh sách
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header showBookingForm={true} />

      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Hotel Name & Rating */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{hotel.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-yellow-400 text-lg md:text-xl">⭐</span>
                <span className="font-semibold text-base md:text-lg text-gray-900">{hotel.rating || 0}</span>
              <span className="text-gray-500 text-sm md:text-base">({reviews.length} đánh giá)</span>
            </div>
          </div>
          <div className="flex gap-2">
              <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-sm md:text-base shadow-sm">
              ❤️
            </button>
              <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-sm md:text-base shadow-sm">
              📤
            </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="row-span-2 col-span-2 sm:col-span-1">
            <img
              src={hotel.image}
              alt={hotel.name}
                className="w-full h-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] object-cover rounded-xl shadow-xl"
            />
          </div>
          <img
            src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400"
            alt="Room"
            className="w-full h-24 sm:h-32 md:h-48 object-cover rounded-xl shadow-xl"
          />
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400"
              alt="Bathroom"
              className="w-full h-24 sm:h-32 md:h-48 object-cover rounded-xl shadow-xl"
            />
            <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold shadow-lg border border-gray-200">
              53 photos
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2 px-2 md:px-4 whitespace-nowrap text-sm md:text-base ${
              activeTab === 'about'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-blue-600'
            } transition`}
          >
            Về
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-2 px-2 md:px-4 whitespace-nowrap text-sm md:text-base ${
              activeTab === 'rooms'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-blue-600'
            } transition`}
          >
            phòng
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 px-2 md:px-4 whitespace-nowrap text-sm md:text-base ${
              activeTab === 'reviews'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-600 hover:text-blue-600'
            } transition`}
          >
            bình luận ({reviews.length || 0})
          </button>
          <div className="ml-auto">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  showError('Vui lòng đăng nhập để đặt phòng')
                  navigate('/login')
                  return
                }
                navigate(`/booking/${id}`)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg font-semibold text-sm md:text-base whitespace-nowrap"
            >
              Chọn phòng
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'rooms' && (
          <div className="space-y-4 md:space-y-8 mb-6 md:mb-8">
            {rooms.length === 0 ? (
              <p className="text-center text-gray-600 py-8">Không có phòng nào</p>
            ) : (
              rooms.map((room, index) => (
            <motion.div
                  key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm"
            >
              <div className="relative">
                <img
                      src={room.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'}
                      alt={room.Number}
                  className="w-full h-40 md:h-48 object-cover rounded-lg"
                />
              </div>
              <div>
                    <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
                      Phòng {room.Number} - {room.type}
                    </h3>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span>Sức chứa: {room.capacity} người</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📶</span>
                        <span>Trạng thái: {room.status}</span>
                  </div>
                      {room.discountPercent > 0 && (
                  <div className="flex items-center gap-2">
                          <span>🎁</span>
                          <span>Giảm giá: {(room.discountPercent * 100).toFixed(0)}%</span>
                  </div>
                      )}
                </div>
                {/* Room Availability */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <RoomAvailability 
                    roomId={room.id} 
                    checkIn={checkIn}
                    checkOut={checkOut}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center md:block">
                <div className="text-center">
                  <p className="text-xs md:text-sm mb-2 font-semibold">Số lượng khách</p>
                  <div className="flex gap-2 justify-center">
                        {Array.from({ length: room.capacity }).map((_, i) => (
                          <span key={i} className="text-xl md:text-2xl">👤</span>
                        ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-2 break-words">
                      {room.discountPercent > 0 ? (
                        <>
                          <span className="line-through text-gray-400 text-lg">
                            {room.price.toLocaleString('vi-VN')}
                          </span>{' '}
                          {(room.price * (1 - room.discountPercent)).toLocaleString('vi-VN')} VND
                        </>
                      ) : (
                        `${room.price.toLocaleString('vi-VN')} VND`
                      )}
                </p>
                    <p className="text-xs text-gray-500 mb-3 md:mb-4">/ đêm</p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        showError('Vui lòng đăng nhập để đặt phòng')
                        navigate('/login')
                        return
                      }
                      
                      // Lấy dates từ Header filter nếu có
                      const urlParams = new URLSearchParams(window.location.search)
                      const checkIn = urlParams.get('checkIn') || new Date().toISOString().split('T')[0]
                      const checkOut = urlParams.get('checkOut') || new Date(Date.now() + 86400000).toISOString().split('T')[0]
                      
                      // Lưu thông tin booking vào localStorage
                      const bookingInfo = {
                        hotelId: hotel.id,
                        hotelName: hotel.name,
                        hotelImage: hotel.image,
                        hotelAddress: hotel.address,
                        roomId: room.id,
                        roomNumber: room.Number,
                        roomType: room.type,
                        roomPrice: room.discountPercent > 0 
                          ? room.price * (1 - room.discountPercent) 
                          : room.price,
                        checkIn,
                        checkOut,
                        checkInDate: checkIn,
                        checkOutDate: checkOut,
                        adults: 2,
                        children: 0,
                        nights: Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)),
                      }
                      localStorage.setItem('bookingInfo', JSON.stringify(bookingInfo))
                      
                      // Navigate đến checkout
                      navigate(`/checkout?roomId=${room.id}&hotelId=${hotel.id}&checkIn=${checkIn}&checkOut=${checkOut}`)
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-xs sm:text-sm md:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={room.status !== 'AVAILABLE'}
                  >
                    {room.status === 'AVAILABLE' ? 'Đặt phòng' : 'Không khả dụng'}
                  </button>
                </div>
              </div>
            </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 md:space-y-8 mb-6 md:mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
                Chỗ ở này bao gồm những gì?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <span className="text-green-600">✓</span>
                  <span>Wi-Fi (free)</span>
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base">
                    <span className="text-green-600">✓</span>
                  <span>Parking (free)</span>
                  </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="font-bold text-base md:text-lg">Môi trường xung quanh</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm md:text-base">
                    <span>📍</span>
                  <span>{hotel.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <span>📞</span>
                  <span>{hotel.phone}</span>
                  </div>
              </div>
              </div>
            </div>
            
            {/* Google Maps */}
            <div>
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
                Vị trí trên bản đồ
              </h3>
              {hotel.latitude && hotel.longitude ? (
                <GoogleMapComponent
                  center={{ lat: hotel.latitude, lng: hotel.longitude }}
                  zoom={15}
                  height="400px"
                  address={hotel.address}
                />
              ) : (
                <GoogleMapComponent
                  address={hotel.address}
                  zoom={15}
                  height="400px"
                />
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
            {/* Overall Rating */}
            <div className="bg-blue-50 p-4 md:p-6 rounded-lg mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{averageRating}/5</div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xl md:text-2xl ${
                          star <= Math.round(Number(averageRating))
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Dựa trên {reviews.length} đánh giá
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form */}
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm mb-6"
              >
                {!showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Viết đánh giá
                  </button>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Đánh giá của bạn
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className={`text-2xl sm:text-3xl transition ${
                              star <= reviewForm.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          >
                            ⭐
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {reviewForm.rating}/5
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Nội dung đánh giá
                      </label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => {
                          setReviewForm({ ...reviewForm, comment: e.target.value })
                          if (reviewError) {
                            setReviewError('')
                        }
                        }}
                        rows={4}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          reviewError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Chia sẻ trải nghiệm của bạn về khách sạn này..."
                      />
                      {reviewError && (
                        <p className="mt-1 text-sm text-red-500">{reviewError}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {reviewForm.comment.length}/1000 ký tự
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReviewForm(false)
                          setReviewForm({ rating: 5, comment: '' })
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base whitespace-nowrap"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {!isAuthenticated && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-700 mb-2">
                  Đăng nhập để viết đánh giá
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:underline font-semibold text-sm"
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-center text-gray-600 py-8">Chưa có đánh giá nào</p>
              ) : (
                reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm"
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
                        {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                          <div>
                            <div className="font-semibold text-sm md:text-base text-gray-800">
                              {review.user?.username || 'Anonymous'}
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 flex-wrap mt-1">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-sm ${
                                      star <= review.rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              <span>{review.rating}/5</span>
                              {review.createdAt && (
                                <span className="text-gray-500">
                                  • {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HotelDetail
