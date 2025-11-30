import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface BookingFilterFormProps {
  variant?: 'default' | 'hero'
  onSearch?: () => void
}

const BookingFilterForm = ({ variant = 'default', onSearch }: BookingFilterFormProps) => {
  const navigate = useNavigate()
  const [city, setCity] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [numberOfRooms, setNumberOfRooms] = useState(1)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  
  const cities = ['Tất cả', 'Đà Nẵng', 'Hà Nội', 'Hồ Chí Minh', 'Nha Trang', 'Hội An', 'Huế', 'Phú Quốc']
  const today = new Date().toISOString().split('T')[0]
  
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
  
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city && city !== 'Tất cả') params.set('city', city)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (numberOfRooms > 0) params.set('numberOfRooms', numberOfRooms.toString())
    
    navigate(`/hotels?${params.toString()}`)
    onSearch?.()
  }
  
  if (variant === 'hero') {
    return (
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="visible"
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
            className="flex items-center gap-2 bg-gray-50 px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-300 hover:border-blue-500 transition cursor-pointer"
            onClick={() => setShowCityDropdown(!showCityDropdown)}
          >
            <span className="text-base md:text-lg">📍</span>
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
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
            >
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
          className="flex items-center gap-2 bg-gray-50 px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-300 hover:border-blue-500 transition"
        >
          <span className="text-base md:text-lg">📅</span>
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
        </motion.div>

        {/* Check-out Date */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="flex items-center gap-2 bg-gray-50 px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-300 hover:border-blue-500 transition"
        >
          <span className="text-base md:text-lg">📅</span>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="flex-1 border-none outline-none bg-transparent text-sm md:text-base"
          />
        </motion.div>

        {/* Number of Rooms & Search Button */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="flex gap-2"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="flex items-center gap-2 bg-gray-50 px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-300 hover:border-blue-500 transition flex-1"
          >
            <span className="text-base md:text-lg">🛏️</span>
            <input
              type="number"
              placeholder="Số phòng"
              value={numberOfRooms}
              min={1}
              onChange={(e) => setNumberOfRooms(parseInt(e.target.value) || 1)}
              className="flex-1 border-none outline-none bg-transparent text-sm md:text-base w-16"
            />
          </motion.div>
          <motion.button
            onClick={handleSearch}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 transition shadow-lg font-semibold text-sm md:text-base whitespace-nowrap"
          >
            🔍 Tìm
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }
  
  // Default variant (for Header)
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
    >
      <div className="relative city-dropdown-container">
        <div 
          className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-500 transition cursor-pointer"
          onClick={() => setShowCityDropdown(!showCityDropdown)}
        >
          <span className="text-sm md:text-base">📍</span>
          <input
            type="text"
            placeholder="Thành phố"
            value={city || ''}
            readOnly
            className="flex-1 border-none outline-none text-sm md:text-base cursor-pointer"
          />
          <span className="text-gray-400 text-xs">▼</span>
        </div>
        {showCityDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
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
      <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-500 transition">
        <span className="text-sm md:text-base">📅</span>
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
          className="flex-1 border-none outline-none text-sm md:text-base"
        />
      </div>
      <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-500 transition">
        <span className="text-sm md:text-base">📅</span>
        <input
          type="date"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => setCheckOut(e.target.value)}
          className="flex-1 border-none outline-none text-sm md:text-base"
        />
      </div>
      <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-500 transition">
        <span className="text-sm md:text-base">🛏️</span>
        <input
          type="number"
          placeholder="Số phòng"
          value={numberOfRooms}
          min={1}
          onChange={(e) => setNumberOfRooms(parseInt(e.target.value) || 1)}
          className="flex-1 border-none outline-none text-sm md:text-base"
        />
      </div>
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm md:text-base whitespace-nowrap"
      >
        Tìm kiếm
      </button>
    </motion.div>
  )
}

export default BookingFilterForm

