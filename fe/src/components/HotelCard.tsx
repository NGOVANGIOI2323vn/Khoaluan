import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Star, Edit2, Trash2 } from 'lucide-react'
import type { Hotel } from '../services/hotelService'

interface HotelCardProps {
  hotel: Hotel
  index?: number
  onEdit?: (hotel: Hotel) => void
  onDelete?: (hotelId: number) => void
  isDeleting?: boolean
  variant?: 'default' | 'dashboard'
}

// Helper function để format giá ngắn gọn
const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1).replace('.0', '')}M`
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K`
  }
  return price.toString()
}

const HotelCard = ({
  hotel,
  index = 0,
  onEdit,
  onDelete,
  isDeleting = false,
  variant = 'default',
}: HotelCardProps) => {
  const imageUrl = hotel.images && hotel.images.length > 0
    ? hotel.images[0].imageUrl
    : hotel.image

  if (variant === 'dashboard') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col"
      >
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          {hotel.minPrice && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-sm text-blue-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg border border-blue-100">
              <span className="text-xs sm:text-sm font-bold">Từ {formatPrice(hotel.minPrice)}/đêm</span>
            </div>
          )}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1 sm:gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(hotel)
                }}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-md"
                aria-label="Edit hotel"
              >
                <Edit2 className="w-4 h-4 text-blue-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(hotel.id)
                }}
                disabled={isDeleting || (hotel.bookingCount !== undefined && hotel.bookingCount > 0)}
                className={`bg-white/90 backdrop-blur-sm p-2 rounded-full transition shadow-md ${
                  (hotel.bookingCount !== undefined && hotel.bookingCount > 0)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-white disabled:opacity-50'
                }`}
                aria-label="Delete hotel"
                title={(hotel.bookingCount !== undefined && hotel.bookingCount > 0) ? `Không thể xóa vì có ${hotel.bookingCount} đặt phòng` : 'Xóa khách sạn'}
              >
                <Trash2 className={`w-4 h-4 ${(hotel.bookingCount !== undefined && hotel.bookingCount > 0) ? 'text-gray-400' : 'text-red-600'}`} />
              </button>
            )}
          </div>
        </div>
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm sm:text-base font-bold text-gray-900">{hotel.rating || 0}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              {hotel.locked && (
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 bg-red-100 text-red-700">
                  🔒 Đã khóa
                </span>
              )}
              {hotel.bookingCount !== undefined && hotel.bookingCount > 0 && (
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 bg-blue-100 text-blue-700">
                  📋 {hotel.bookingCount} đặt phòng
                </span>
              )}
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                  hotel.status === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {hotel.status === 'success' ? '✓ Hoạt động' : '⏳ Chờ duyệt'}
              </span>
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-1 break-words">{hotel.name}</h3>
          <div className="flex items-start gap-2 mb-2 min-h-[40px]">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 flex-1 break-words">{hotel.address}</p>
          </div>
          {hotel.description && (
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2 break-words">{hotel.description}</p>
          )}
        </div>
      </motion.div>
    )
  }

  // Default variant for public pages
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col"
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {hotel.minPrice && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-sm text-blue-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg border border-blue-100">
            <span className="text-xs sm:text-sm font-bold">Từ {formatPrice(hotel.minPrice)}/đêm</span>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm sm:text-base font-bold text-gray-900">{hotel.rating || 0}</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-1 break-words">{hotel.name}</h3>
        <div className="flex items-start gap-2 mb-3 min-h-[40px]">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 flex-1 break-words">{hotel.address}</p>
          </div>
          <Link
            to={`/hotel/${hotel.id}`}
          className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm sm:text-base mt-auto"
          >
            Xem chi tiết
          </Link>
      </div>
    </motion.div>
  )
}

export default HotelCard
