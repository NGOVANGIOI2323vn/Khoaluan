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
  const [searchParams] = useSearchParams()
  const [selectedFilter, setSelectedFilter] = useState('Khuyến khích')
  const [showFilters, setShowFilters] = useState(false)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  useEffect(() => {
    const fetchHotels = async (page: number = 0, sortBy?: string) => {
      try {
        setLoading(true)
        const filters: HotelFilterParams = {
          page,
          size: 8,
          sortBy: sortBy || filterMap[selectedFilter] || 'recommended',
          city: searchParams.get('city') || undefined,
          checkIn: searchParams.get('checkIn') || undefined,
          checkOut: searchParams.get('checkOut') || undefined,
          numberOfRooms: searchParams.get('numberOfRooms') ? parseInt(searchParams.get('numberOfRooms')!) : undefined,
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

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    setCurrentPage(0) // Reset to first page when filter changes
  }

  const handlePageChange = async (newPage: number) => {
    try {
      setLoading(true)
      setCurrentPage(newPage)
      const filters: HotelFilterParams = {
        page: newPage,
        size: 8,
        sortBy: filterMap[selectedFilter] || 'recommended',
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
    <div className="min-h-screen bg-gray-50">
      <Header showBookingForm={true} />

      {/* Filter Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm"
            >
              <span>🔍</span>
              <span>Lọc</span>
            </button>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 border border-gray-300 px-2 py-2 rounded text-xs">
                <span>🗺️</span>
                <span className="hidden sm:inline">Map</span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                ❤️
              </button>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`transition text-sm ${
                    selectedFilter === filter
                      ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm text-sm">
                <span>🔍</span>
                <span>Lọc</span>
              </button>
              <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition text-sm">
                <span>🗺️</span>
                <span>Show map</span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded transition">
                ❤️
              </button>
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          {showFilters && (
            <div className="lg:hidden mt-3 space-y-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    handleFilterChange(filter)
                    setShowFilters(false)
                  }}
                  className={`block w-full text-left px-3 py-2 rounded transition text-sm ${
                    selectedFilter === filter
                      ? 'bg-blue-100 text-blue-600 font-semibold'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-2xl font-bold mb-4 md:mb-6"
        >
          {totalElements} hotels available
        </motion.h2>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevious}
              className={`px-4 py-2 rounded-lg transition ${
                hasPrevious
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Trước
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
                    className={`px-3 py-2 rounded-lg transition ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
              className={`px-4 py-2 rounded-lg transition ${
                hasNext
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HotelList
