import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import HotelCard from '../components/HotelCard'
import { hotelService } from '../services/hotelService'
import type { Hotel, HotelPageResponse, HotelFilterParams } from '../services/hotelService'

// Map filter names to API sortBy values
const filterMap: Record<string, string> = {
  'Khuyến khích': 'recommended',
  'Đánh giá hàng đầu': 'top_rated',
  'Giá cao nhất': 'price_high',
  'Giá thấp nhất': 'price_low',
  'Nhiều sao nhất': 'most_stars',
  'Gần nhất đầu tiên': 'newest',
}

const HotelList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedFilter, setSelectedFilter] = useState('Khuyến khích')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  // Filter states
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [numberOfRooms, setNumberOfRooms] = useState(searchParams.get('numberOfRooms') ? parseInt(searchParams.get('numberOfRooms')!) : 1)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  
  const cities = ['Tất cả', 'Đà Nẵng', 'Hà Nội', 'Hồ Chí Minh', 'Nha Trang', 'Hội An', 'Huế', 'Phú Quốc']
  const today = new Date().toISOString().split('T')[0]
  
  // Sync filter states with URL params
  useEffect(() => {
    setCity(searchParams.get('city') || '')
    setCheckIn(searchParams.get('checkIn') || '')
    setCheckOut(searchParams.get('checkOut') || '')
    setSearchQuery(searchParams.get('search') || '')
    const rooms = searchParams.get('numberOfRooms')
    if (rooms) {
      setNumberOfRooms(parseInt(rooms))
    } else {
      setNumberOfRooms(1)
    }
  }, [searchParams])
  
  // Close dropdown when clicking outside
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

  // Fetch hotels when filters or sort change
  useEffect(() => {
    const fetchHotels = async (page: number = 0, sortBy?: string) => {
      try {
        setLoading(true)
        const filters: HotelFilterParams = {
          page,
          size: 8,
          sortBy: sortBy || filterMap[selectedFilter] || 'recommended',
          city: searchParams.get('city') && searchParams.get('city') !== 'Tất cả' ? searchParams.get('city') || undefined : undefined,
          checkIn: searchParams.get('checkIn') || undefined,
          checkOut: searchParams.get('checkOut') || undefined,
          numberOfRooms: searchParams.get('numberOfRooms') ? parseInt(searchParams.get('numberOfRooms')!) : undefined,
          search: searchParams.get('search') || undefined,
        }
        
        const response = await hotelService.getAllHotels(filters)
        
        if (response.data) {
          // Check if response is paginated
          if ('content' in response.data) {
            const pageData = response.data as HotelPageResponse
            setHotels(pageData.content)
            setTotalPages(pageData.totalPages)
            setTotalElements(pageData.totalElements)
            setCurrentPage(pageData.currentPage)
            setHasNext(pageData.hasNext)
            setHasPrevious(pageData.hasPrevious)
          } else {
            // Fallback for non-paginated response
            const hotelsList = response.data as Hotel[]
            setHotels(hotelsList)
            setTotalPages(1)
            setTotalElements(hotelsList.length)
            setCurrentPage(0)
            setHasNext(false)
            setHasPrevious(false)
          }
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        setError(error.response?.data?.message || 'Không thể tải danh sách khách sạn')
      } finally {
        setLoading(false)
      }
    }

    fetchHotels(0, filterMap[selectedFilter])
  }, [selectedFilter, searchParams])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Update URL params with all filters
    const newParams = new URLSearchParams()
    
    if (searchQuery) {
      newParams.set('search', searchQuery)
    }
    if (city && city !== 'Tất cả') {
      newParams.set('city', city)
    }
    if (checkIn) {
      newParams.set('checkIn', checkIn)
    }
    if (checkOut) {
      newParams.set('checkOut', checkOut)
    }
    if (numberOfRooms > 0) {
      newParams.set('numberOfRooms', numberOfRooms.toString())
    }
    
    setSearchParams(newParams, { replace: true })
    setCurrentPage(0)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    setCurrentPage(0)
  }

  const handlePageChange = async (newPage: number) => {
    try {
      setLoading(true)
      setCurrentPage(newPage)
      const filters: HotelFilterParams = {
        page: newPage,
        size: 8,
        sortBy: filterMap[selectedFilter] || 'recommended',
        city: searchParams.get('city') && searchParams.get('city') !== 'Tất cả' ? searchParams.get('city') || undefined : undefined,
        checkIn: searchParams.get('checkIn') || undefined,
        checkOut: searchParams.get('checkOut') || undefined,
        numberOfRooms: searchParams.get('numberOfRooms') ? parseInt(searchParams.get('numberOfRooms')!) : undefined,
        search: searchParams.get('search') || undefined,
      }
      
      const response = await hotelService.getAllHotels(filters)
      
      if (response.data && 'content' in response.data) {
        const pageData = response.data as HotelPageResponse
        setHotels(pageData.content)
        setTotalPages(pageData.totalPages)
        setTotalElements(pageData.totalElements)
        setHasNext(pageData.hasNext)
        setHasPrevious(pageData.hasPrevious)
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Không thể tải danh sách khách sạn')
    } finally {
      setLoading(false)
    }
  }

  const filters = [
    'Khuyến khích',
    'Đánh giá hàng đầu',
    'Giá cao nhất',
    'Giá thấp nhất',
    'Nhiều sao nhất',
    'Gần nhất đầu tiên',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <form onSubmit={handleFormSubmit}>
            {/* Search and Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
              {/* Search Input */}
              <div className="sm:col-span-2 lg:col-span-2">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm khách sạn theo tên hoặc địa chỉ..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm md:text-base"
                />
              </div>

              {/* City Selector */}
              <div className="relative city-dropdown-container">
                <div 
                  className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-300 hover:border-blue-500 transition cursor-pointer h-full"
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                >
                  <span className="text-base">📍</span>
                  <input
                    type="text"
                    placeholder="Thành phố"
                    value={city || ''}
                    readOnly
                    className="flex-1 border-none outline-none bg-transparent text-sm md:text-base cursor-pointer"
                  />
                  <span className="text-gray-400 text-xs">▼</span>
                </div>
                {showCityDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {cities.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCity(c)
                          setShowCityDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm md:text-base transition"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Check-in Date */}
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-300 hover:border-blue-500 transition">
                <span className="text-base">📅</span>
                <input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => {
                    setCheckIn(e.target.value)
                    if (e.target.value >= checkOut) {
                      const newCheckOut = new Date(e.target.value)
                      newCheckOut.setDate(newCheckOut.getDate() + 1)
                      setCheckOut(newCheckOut.toISOString().split('T')[0])
                    }
                  }}
                  className="flex-1 border-none outline-none bg-transparent text-sm md:text-base"
                />
              </div>

              {/* Check-out Date */}
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-300 hover:border-blue-500 transition">
                <span className="text-base">📅</span>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="flex-1 border-none outline-none bg-transparent text-sm md:text-base"
              />
              </div>

              {/* Number of Rooms and Search Button */}
              <div className="flex gap-2">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-300 hover:border-blue-500 transition flex-1">
                  <span className="text-base">🛏️</span>
                  <input
                    type="number"
                    placeholder="Số phòng"
                    value={numberOfRooms}
                    min={1}
                    onChange={(e) => setNumberOfRooms(parseInt(e.target.value) || 1)}
                    className="flex-1 border-none outline-none bg-transparent text-sm md:text-base w-16"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-sm md:text-base whitespace-nowrap shadow-md"
                >
                  🔍 Tìm
                </button>
              </div>
            </div>
          </form>

          {/* Sort Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                className={`px-4 py-2 rounded-lg transition whitespace-nowrap text-sm md:text-base font-medium ${
                    selectedFilter === filter
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                {totalElements} khách sạn có sẵn
              </h2>
              <p className="text-gray-600 text-sm md:text-base">Tìm khách sạn phù hợp với bạn</p>
            </div>
            {selectedFilter !== 'Khuyến khích' && (
              <button
                onClick={() => handleFilterChange('Khuyến khích')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium underline whitespace-nowrap"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải danh sách khách sạn...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {hotels.map((hotel, index) => (
              <HotelCard key={hotel.id} hotel={hotel} index={index} />
            ))}
          </div>
        )}

        {!loading && !error && hotels.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Không có khách sạn nào</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10 mb-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevious}
              className={`px-4 py-2 rounded-xl transition font-medium ${
                hasPrevious
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ← Trước
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i
                } else if (currentPage < 3) {
                  pageNum = i
                } else if (currentPage > totalPages - 4) {
                  pageNum = totalPages - 5 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-xl transition font-medium ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
              className={`px-4 py-2 rounded-xl transition font-medium ${
                hasNext
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HotelList
