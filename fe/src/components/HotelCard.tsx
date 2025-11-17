import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Hotel } from '../services/hotelService'

interface HotelCardProps {
  hotel: Hotel
  index: number
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

const HotelCard = ({ hotel, index }: HotelCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
        />
        {hotel.minPrice && (
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-blue-600 px-2 py-0.5 rounded-full shadow-sm border border-blue-100">
            <span className="text-xs md:text-sm font-bold">{formatPrice(hotel.minPrice)}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1 md:gap-2">
          <button className="bg-white/80 backdrop-blur-sm p-1.5 md:p-2 rounded-full hover:bg-white transition text-xs md:text-sm">
            📤
          </button>
          <button className="bg-white/80 backdrop-blur-sm p-1.5 md:p-2 rounded-full hover:bg-white transition text-xs md:text-sm">
            ❤️
          </button>
        </div>
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-sm md:text-base">⭐</span>
            <span className="font-semibold text-sm md:text-base">{hotel.rating || 0}</span>
          </div>
        </div>
        <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2 line-clamp-1">{hotel.name}</h3>
        <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">{hotel.description || hotel.address}</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-gray-600 truncate">{hotel.address}</p>
          </div>
          <Link
            to={`/hotel/${hotel.id}`}
            className="bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded hover:bg-blue-700 transition text-sm md:text-base whitespace-nowrap w-full sm:w-auto text-center"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default HotelCard
