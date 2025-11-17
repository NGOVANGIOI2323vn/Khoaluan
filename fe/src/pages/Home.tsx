import { motion, useScroll, useTransform } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import HotelCard from '../components/HotelCard'
import { hotelService, type Hotel, type HotelReview } from '../services/hotelService'
import { useToast } from '../hooks/useToast'

const Home = () => {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.95])
  
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([])
  const [popularHotels, setPopularHotels] = useState<Hotel[]>([])
  const [topReviews, setTopReviews] = useState<Array<HotelReview & { hotelName?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const { showSuccess, showError } = useToast()
  
  // Search form state
  const [searchCity, setSearchCity] = useState('')
  const [searchCheckIn, setSearchCheckIn] = useState('')
  const [searchCheckOut, setSearchCheckOut] = useState('')
  const [searchRooms, setSearchRooms] = useState(1)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  
  const cities = ['Tất cả', 'Đà Nẵng', 'Hà Nội', 'Hồ Chí Minh', 'Nha Trang', 'Hội An', 'Huế', 'Phú Quốc']
  
  // Format date for input (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0]
  
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchCity && searchCity !== 'Tất cả') params.set('city', searchCity)
    if (searchCheckIn) params.set('checkIn', searchCheckIn)
    if (searchCheckOut) params.set('checkOut', searchCheckOut)
    if (searchRooms > 0) params.set('numberOfRooms', searchRooms.toString())
    
    navigate(`/hotels?${params.toString()}`)
  }
  
  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.city-dropdown-container')) {
        setShowCityDropdown(false)
      }
    }
    
    if (showCityDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCityDropdown])

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true)
        // Lấy top hotels (sort by rating, limit 6)
        const featuredResponse = await hotelService.getAllHotels({
          sortBy: 'rating',
          page: 0,
          size: 6,
        })
        
        // Lấy popular hotels (sort by price ascending, limit 6)
        const popularResponse = await hotelService.getAllHotels({
          sortBy: 'price_asc',
          page: 0,
          size: 6,
        })
        
        if (featuredResponse.data) {
          const hotels = Array.isArray(featuredResponse.data) 
            ? featuredResponse.data 
            : (featuredResponse.data as { content?: Hotel[] }).content || []
          setFeaturedHotels(hotels.slice(0, 6))
          
          // Lấy reviews từ top hotels
          const reviewsPromises = hotels.slice(0, 3).map(async (hotel) => {
            try {
              const reviewsResponse = await hotelService.getReviewsByHotelId(hotel.id)
              if (reviewsResponse.data && Array.isArray(reviewsResponse.data)) {
                return reviewsResponse.data
                  .filter((r: HotelReview) => r.rating >= 4)
                  .slice(0, 2)
                  .map((r: HotelReview) => ({ ...r, hotelName: hotel.name }))
              }
            } catch (error) {
              console.error('Failed to load hotel reviews', error)
              showError('Không thể tải đánh giá khách sạn')
            }
            return []
          })
          
          const allReviews = (await Promise.all(reviewsPromises)).flat()
          setTopReviews(allReviews.slice(0, 6))
        }
        
        if (popularResponse.data) {
          const hotels = Array.isArray(popularResponse.data) 
            ? popularResponse.data 
            : (popularResponse.data as { content?: Hotel[] }).content || []
          setPopularHotels(hotels.slice(0, 6))
        }
      } catch (error) {
        console.error('Failed to load hotels', error)
        showError('Không thể tải danh sách khách sạn')
      } finally {
        setLoading(false)
      }
    }
    
    fetchHotels()
  }, [showError])
  
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showError('Vui lòng nhập email hợp lệ')
      return
    }
    showSuccess('Cảm ơn bạn đã đăng ký nhận thông tin khuyến mãi!')
    setNewsletterEmail('')
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Header />
      
      {/* Hero Section with Animated Background */}
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
        {/* Animated Background Images */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"
            animate={{
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Parallax Effect */}
        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 max-w-6xl mx-auto px-4 pt-16 sm:pt-24 md:pt-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20"
          >
            {/* Tabs with Animation */}
            <motion.div
              className="flex gap-2 md:gap-4 mb-4 md:mb-6 border-b pb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 md:gap-2 pb-2 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm md:text-base"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="text-lg md:text-xl"
                >
                  🏨
                </motion.span>
                <span>Hotels</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 md:gap-2 pb-2 text-gray-500 hover:text-blue-600 transition text-sm md:text-base"
              >
                <span className="text-lg md:text-xl">🏠</span>
                <span>Rental</span>
              </motion.button>
            </motion.div>

            {/* Input Fields Grid with Stagger Animation */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {/* City Selector */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                className="relative city-dropdown-container"
              >
                <div 
                  className="flex items-center gap-2 bg-gray-50 px-3 md:px-4 py-2 md:py-3 rounded border border-gray-300 hover:border-blue-500 transition cursor-pointer"
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                >
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="text-base md:text-lg"
                  >
                    📍
                  </motion.span>
                  <input
                    type="text"
                    placeholder="Thành phố (Tất cả)"
                    value={searchCity || ''}
                    readOnly
                    className="flex-1 border-none outline-none bg-transparent text-sm md:text-base cursor-pointer"
                  />
                  <motion.span
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    className="text-gray-400 text-xs"
                  >
                    ▼
                  </motion.span>
                </div>
                {showCityDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 overflow-y-auto"
                  >
                    {cities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSearchCity(city)
                          setShowCityDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm md:text-base transition"
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Check-in Date */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex items-center gap-2 bg-gray-50 px-3 md:px-4 py-2 md:py-3 rounded border border-gray-300 hover:border-blue-500 transition"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="text-base md:text-lg"
                >
                  📅
                </motion.span>
                <input
                  type="date"
                  placeholder="Ngày nhận phòng"
                  value={searchCheckIn}
                  min={today}
                  onChange={(e) => {
                    setSearchCheckIn(e.target.value)
                    if (e.target.value >= searchCheckOut) {
                      const newCheckOut = new Date(e.target.value)
                      newCheckOut.setDate(newCheckOut.getDate() + 1)
                      setSearchCheckOut(newCheckOut.toISOString().split('T')[0])
                    }
                  }}
                  className="flex-1 border-none outline-none bg-transparent text-sm md:text-base"
                />
              </motion.div>

              {/* Check-out Date */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex items-center gap-2 bg-gray-50 px-3 md:px-4 py-2 md:py-3 rounded border border-gray-300 hover:border-blue-500 transition"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  className="text-base md:text-lg"
                >
                  📅
                </motion.span>
                <input
                  type="date"
                  placeholder="Ngày trả phòng"
                  value={searchCheckOut}
                  min={searchCheckIn || today}
                  onChange={(e) => setSearchCheckOut(e.target.value)}
                  className="flex-1 border-none outline-none bg-transparent text-sm md:text-base"
                />
              </motion.div>

              {/* Number of Rooms */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex items-center gap-2 bg-gray-50 px-3 md:px-4 py-2 md:py-3 rounded border border-gray-300 hover:border-blue-500 transition"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                  className="text-base md:text-lg"
                >
                  🛏️
                </motion.span>
                <input
                  type="number"
                  placeholder="Số phòng"
                  value={searchRooms}
                  min={1}
                  onChange={(e) => setSearchRooms(parseInt(e.target.value) || 1)}
                  className="flex-1 border-none outline-none bg-transparent text-sm md:text-base"
                />
                </motion.div>
            </motion.div>

            {/* Search Button with Pulse Animation */}
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
            >
                <motion.button
                onClick={handleSearch}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(59, 130, 246, 0.7)',
                      '0 0 0 10px rgba(59, 130, 246, 0)',
                      '0 0 0 0 rgba(59, 130, 246, 0)',
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                    },
                  }}
                  className="bg-blue-600 text-white p-3 md:p-4 rounded-lg hover:bg-blue-700 transition shadow-lg"
                >
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="text-lg md:text-xl inline-block"
                  >
                    🔍
                  </motion.span>
                </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Featured Hotels Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Khách sạn nổi bật
              </h2>
              <p className="text-gray-600">Những khách sạn được đánh giá cao nhất</p>
            </div>
            <Link
              to="/hotels"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base"
            >
              Xem tất cả →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-lg h-64 animate-pulse"
                />
              ))}
            </div>
          ) : featuredHotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredHotels.map((hotel, index) => (
                <HotelCard key={hotel.id} hotel={hotel} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có khách sạn nào</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Popular Destinations Section */}
      <div className="bg-gray-50 py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Khách sạn giá tốt
                </h2>
                <p className="text-gray-600">Những khách sạn với giá ưu đãi nhất</p>
              </div>
              <Link
                to="/hotels?sortBy=price_asc"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base"
              >
                Xem tất cả →
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg h-64 animate-pulse"
                  />
                ))}
              </div>
            ) : popularHotels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {popularHotels.map((hotel, index) => (
                  <HotelCard key={hotel.id} hotel={hotel} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Chưa có khách sạn nào</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Special Offers Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ưu đãi đặc biệt
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Giảm giá lên đến 30% cho đặt phòng sớm
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: '🎁', title: 'Giảm 20%', desc: 'Cho thành viên mới' },
                { icon: '⭐', title: 'Giảm 30%', desc: 'Đặt trước 30 ngày' },
                { icon: '💎', title: 'Tích điểm', desc: 'Nhận thưởng mỗi đêm' },
              ].map((offer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <div className="text-4xl mb-3">{offer.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                  <p className="opacity-90">{offer.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-gray-600 text-lg">
            Dịch vụ khách sạn tốt nhất với giá cả hợp lý
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: '🔒',
              title: 'Thanh toán an toàn',
              desc: 'Bảo mật thông tin tuyệt đối',
            },
            {
              icon: '✅',
              title: 'Xác nhận tức thì',
              desc: 'Nhận xác nhận ngay sau khi đặt',
            },
            {
              icon: '💰',
              title: 'Giá tốt nhất',
              desc: 'Đảm bảo giá tốt nhất thị trường',
            },
            {
              icon: '🎯',
              title: 'Hỗ trợ 24/7',
              desc: 'Đội ngũ hỗ trợ luôn sẵn sàng',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Customer Reviews Section */}
      {topReviews.length > 0 && (
        <div className="bg-gray-50 py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Đánh giá từ khách hàng
              </h2>
              <p className="text-gray-600 text-lg">
                Những phản hồi chân thực từ khách hàng của chúng tôi
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topReviews.map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-3">{review.comment}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {review.user?.username || 'Khách hàng'}
                      </p>
                      {review.hotelName && (
                        <p className="text-sm text-gray-600">{review.hotelName}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Đăng ký nhận ưu đãi
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Nhận thông tin về các ưu đãi đặc biệt và khuyến mãi mới nhất
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
          <motion.button
                type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap"
              >
                Đăng ký
          </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Popular Cities Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
            Điểm đến phổ biến
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=400', count: '500+' },
              { name: 'Hà Nội', image: 'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=400', count: '800+' },
              { name: 'Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400', count: '1000+' },
              { name: 'Nha Trang', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', count: '300+' },
            ].map((city, index) => (
              <Link
                key={index}
                to={`/hotels?city=${encodeURIComponent(city.name)}`}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative h-48 md:h-64 rounded-xl overflow-hidden shadow-lg"
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg md:text-xl font-bold mb-1">{city.name}</h3>
                    <p className="text-sm opacity-90">{city.count} khách sạn</p>
                  </div>
                </motion.div>
        </Link>
            ))}
          </div>
      </motion.div>
      </div>

      {/* Feature Cards with Advanced Animations */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {[
            {
              icon: '🏨',
              title: 'Hơn 100.000 khách sạn toàn cầu',
              color: 'from-blue-500 to-blue-600',
            },
            {
              icon: '💡',
              title: 'Giảm giá độc quyền mỗi lần đặt phòng',
              color: 'from-yellow-500 to-orange-500',
            },
            {
              icon: '🎧',
              title: 'Hỗ trợ khách hàng 24/7',
              color: 'from-purple-500 to-pink-500',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{
                delay: 0.4 + index * 0.2,
                duration: 0.6,
                type: 'spring',
                stiffness: 100,
              }}
              whileHover={{
                scale: 1.05,
                y: -10,
                rotateY: 5,
                transition: { duration: 0.3 },
              }}
              className="bg-white rounded-xl p-6 md:p-8 shadow-lg text-center hover:shadow-2xl transition relative overflow-hidden group"
            >
              {/* Animated Gradient Background on Hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10`}
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Floating Icon */}
              <motion.div
                className="text-4xl md:text-5xl mb-3 md:mb-4 relative z-10"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: 'easeInOut',
                }}
              >
                {feature.icon}
              </motion.div>
              
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              
              <p className="text-gray-800 font-medium text-sm md:text-base relative z-10">
                {feature.title}
              </p>
              
              {/* Decorative Elements */}
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Animated Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 py-8 md:py-16"
      >
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white overflow-hidden relative"
          whileHover={{ scale: 1.02 }}
        >
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              backgroundSize: '200px 200px',
            }}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {[
              { number: '100K+', label: 'Khách sạn' },
              { number: '50K+', label: 'Thành viên' },
              { number: '24/7', label: 'Hỗ trợ' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.2,
                  type: 'spring',
                  stiffness: 200,
                }}
                whileHover={{ scale: 1.1 }}
                className="text-center"
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-lg md:text-xl opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Home
