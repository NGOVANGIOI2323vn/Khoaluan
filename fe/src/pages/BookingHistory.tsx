import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { bookingService, type PageResponse } from '../services/bookingService'
import { useToast } from '../hooks/useToast'
import type { Booking } from '../services/bookingService'

const BookingHistory = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null)
  const { showSuccess, showError } = useToast()

  const fetchBookings = async (page: number = 0) => {
    try {
      setLoading(true)
      const response = await bookingService.getBookingHistory(page, 8)
      if (response.data) {
        // Check if response is paginated
        if ('content' in response.data) {
          const pageData = response.data as PageResponse<Booking>
          setBookings(pageData.content)
          setTotalPages(pageData.totalPages)
          setCurrentPage(pageData.currentPage)
          setHasNext(pageData.hasNext)
          setHasPrevious(pageData.hasPrevious)
        } else {
          // Fallback for non-paginated response - tự tính toán phân trang ở Frontend
          const bookingsList = response.data as Booking[]
          
          // Tính toán phân trang thủ công
          const itemsPerPage = 8
          const calculatedTotalPages = Math.ceil(bookingsList.length / itemsPerPage)
          
          // Slice bookings theo page
          const startIndex = page * itemsPerPage
          const endIndex = startIndex + itemsPerPage
          const paginatedBookings = bookingsList.slice(startIndex, endIndex)
          
          setBookings(paginatedBookings)
          setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1)
          setCurrentPage(page)
          setHasNext(page < calculatedTotalPages - 1)
          setHasPrevious(page > 0)
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Không thể tải lịch sử đặt phòng. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings(0)
  }, [])

  const handlePageChange = async (newPage: number) => {
    await fetchBookings(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBookingForm={true} />

      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8">Lịch sử đặt phòng</h1>

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải lịch sử đặt phòng...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Bạn chưa có đặt phòng nào</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3 md:space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-300 p-4 md:p-6 shadow-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <span className="font-semibold text-sm md:text-base">Tên khách sạn:</span>{' '}
                      <span className="text-sm md:text-base">{booking.hotel?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Phòng:</span>{' '}
                      <span className="text-sm md:text-base">
                        {booking.rooms?.Number || booking.rooms?.number || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Tổng tiền:</span>{' '}
                      <span className="text-blue-600 font-bold text-sm md:text-base">
                        {Number(booking.totalPrice).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Sức chứa:</span>{' '}
                      <span className="text-sm md:text-base">{booking.rooms?.capacity || 'N/A'} người</span>
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <span className="font-semibold text-sm md:text-base">Check-in:</span>{' '}
                      <span className="text-sm md:text-base">{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Check-out:</span>{' '}
                      <span className="text-sm md:text-base">{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Trạng thái:</span>{' '}
                      <span className={`text-sm md:text-base font-semibold ${
                        booking.status === 'PAID' ? 'text-green-600' :
                        booking.status === 'PENDING' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {booking.status === 'PAID' ? 'Đã thanh toán' :
                         booking.status === 'PENDING' ? 'Chờ thanh toán' :
                         booking.status === 'FAILED' ? 'Thất bại' : booking.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm md:text-base">Ngày đặt:</span>{' '}
                      <span className="text-sm md:text-base">
                        {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                  {booking.status === 'PAID' && (
                    <button
                      onClick={() => navigate(`/invoice/${booking.id}`)}
                      className="w-full sm:w-auto bg-blue-600 text-white px-4 md:px-6 py-1.5 md:py-2 rounded hover:bg-blue-700 transition text-sm md:text-base whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      📄 Xem hóa đơn
                    </button>
                  )}
                  {booking.status === 'PENDING' && (
                    <button
                      onClick={async () => {
                        if (payingBookingId) return // Đang xử lý thanh toán khác
                        try {
                          setPayingBookingId(booking.id)
                          await bookingService.payBooking(booking.id)
                          showSuccess('Thanh toán thành công!')
                          setTimeout(() => window.location.reload(), 1500)
                        } catch (err: unknown) {
                          const error = err as { response?: { data?: { message?: string } } }
                          showError(error.response?.data?.message || 'Thanh toán không thành công. Vui lòng kiểm tra lại số dư ví hoặc thử lại sau.')
                          setPayingBookingId(null)
                        }
                      }}
                      disabled={payingBookingId !== null}
                      className={`w-full sm:w-auto px-4 md:px-6 py-1.5 md:py-2 rounded transition text-sm md:text-base whitespace-nowrap flex items-center justify-center gap-2 ${
                        payingBookingId === booking.id
                          ? 'bg-gray-400 text-white cursor-not-allowed opacity-75'
                          : payingBookingId !== null
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {payingBookingId === booking.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        'Thanh toán'
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
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

export default BookingHistory
