import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

interface HeaderProps {
  showBookingForm?: boolean
}

const BookingFilterForm = () => {
  const navigate = useNavigate()
  const [city, setCity] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [numberOfRooms, setNumberOfRooms] = useState(1)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  
  const cities = ['Tất cả', 'Đà Nẵng', 'Hà Nội', 'Hồ Chí Minh', 'Nha Trang', 'Hội An', 'Huế', 'Phú Quốc']
  
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city && city !== 'Tất cả') params.set('city', city)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (numberOfRooms > 0) params.set('numberOfRooms', numberOfRooms.toString())
    
    navigate(`/hotels?${params.toString()}`)
  }
  
  // Format date for input (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
    >
      <div className="relative">
        <div 
          className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded border border-gray-300 cursor-pointer"
          onClick={() => setShowCityDropdown(!showCityDropdown)}
        >
          <span className="text-sm md:text-base">📍</span>
          <input
            type="text"
            placeholder="Thành phố (Tất cả)"
            value={city || ''}
            readOnly
            className="flex-1 border-none outline-none text-sm md:text-base cursor-pointer"
          />
          <span className="text-gray-400 text-xs">▼</span>
        </div>
        {showCityDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCity(c)
                  setShowCityDropdown(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm md:text-base"
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded border border-gray-300">
        <span className="text-sm md:text-base">📅</span>
        <input
          type="date"
          placeholder="Ngày nhận phòng"
          value={checkIn}
          min={today}
          onChange={(e) => setCheckIn(e.target.value)}
          className="flex-1 border-none outline-none text-sm md:text-base"
        />
      </div>
      <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded border border-gray-300">
        <span className="text-sm md:text-base">📅</span>
        <input
          type="date"
          placeholder="Ngày trả phòng"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => setCheckOut(e.target.value)}
          className="flex-1 border-none outline-none text-sm md:text-base"
        />
      </div>
      <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded border border-gray-300">
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
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm md:text-base font-semibold"
      >
        Tìm kiếm
      </button>
    </motion.div>
  )
}

const Header = ({ showBookingForm = false }: HeaderProps) => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('userRole')
      const name = localStorage.getItem('username')
      const authenticated = !!token
      
      // React will automatically optimize and only re-render if values actually changed
      setIsAuthenticated(authenticated)
      setUserRole(role)
      setUsername(name)
    }
    
    // Check immediately when component mounts or location changes
    checkAuth()
    
    // Listen to storage changes (when localStorage is updated from another tab/window)
    window.addEventListener('storage', checkAuth)
    
    // Also listen to custom event for same-tab updates
    const handleStorageUpdate = () => {
      checkAuth()
    }
    window.addEventListener('localStorageUpdate', handleStorageUpdate)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('localStorageUpdate', handleStorageUpdate)
    }
  }, [location.pathname]) // Re-check when route changes

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUserRole(null)
    setUsername(null)
    // Redirect về home sau khi logout
    window.location.href = '/'
  }
  
  return (
    <header className="bg-gray-100 py-3 md:py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <Link to="/" className="text-xl md:text-2xl font-bold text-blue-600">
            Hotels booking
          </Link>
          <div className="flex items-center gap-2 md:gap-6">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4 md:gap-6">
              <Link
                to="/"
                className={`${
                  location.pathname === '/'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700'
                } hover:text-blue-600 transition text-sm md:text-base`}
              >
                Home
              </Link>
              <Link
                to="/hotels"
                className={`${
                  location.pathname === '/hotels'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700'
                } hover:text-blue-600 transition text-sm md:text-base`}
              >
                Hotels
              </Link>
              <Link
                to="/about"
                className={`${
                  location.pathname === '/about'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700'
                } hover:text-blue-600 transition text-sm md:text-base`}
              >
                About us
              </Link>
              <Link
                to="/contact"
                className={`${
                  location.pathname === '/contact'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700'
                } hover:text-blue-600 transition text-sm md:text-base`}
              >
                Contact
              </Link>
              {isAuthenticated && userRole === 'USER' && (
                <Link
                  to="/booking-history"
                  className={`${
                    location.pathname === '/booking-history'
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-700'
                  } hover:text-blue-600 transition text-sm md:text-base`}
                >
                  Lịch sử đặt phòng
                </Link>
              )}
              {isAuthenticated && userRole === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`${
                    location.pathname === '/admin'
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-700'
                  } hover:text-blue-600 transition text-sm md:text-base`}
                >
                  Admin Dashboard
                </Link>
              )}
              {isAuthenticated && userRole === 'OWNER' && (
                <Link
                  to="/owner"
                  className={`${
                    location.pathname === '/owner'
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-700'
                  } hover:text-blue-600 transition text-sm md:text-base`}
                >
                  Quản lý khách sạn
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-200 rounded transition"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>

            <button className="hidden sm:block p-2 hover:bg-gray-200 rounded transition">
              🌐
            </button>
            {showBookingForm && (
              <button className="hidden sm:block p-2 hover:bg-gray-200 rounded transition">
                ❤️
              </button>
            )}
            {isAuthenticated && username ? (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl">👤</span>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs text-gray-500">
                      {userRole === 'ADMIN' ? 'Admin' : userRole === 'OWNER' ? 'Chủ khách sạn' : 'Khách hàng'}
                    </span>
                    <span className="text-sm md:text-base text-gray-700 font-semibold">
                      {username}
                    </span>
                  </div>
                  <span className="sm:hidden text-sm text-gray-700 font-semibold">
                    {username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 md:px-6 py-1.5 md:py-2 rounded text-sm md:text-base hover:bg-red-700 transition whitespace-nowrap flex items-center gap-1"
                >
                  <span>🚪</span>
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-3 md:px-6 py-1.5 md:py-2 rounded text-sm md:text-base hover:bg-blue-700 transition whitespace-nowrap"
              >
                Log in
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden flex flex-col gap-3 pb-3"
            >
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  location.pathname === '/'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700'
                } hover:text-blue-600 transition py-2`}
              >
                Home
              </Link>
              <Link
                to="/hotels"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  location.pathname === '/hotels'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700'
                } hover:text-blue-600 transition py-2`}
              >
                Hotels
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  location.pathname === '/about'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700'
                } hover:text-blue-600 transition py-2`}
              >
                About us
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  location.pathname === '/contact'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700'
                } hover:text-blue-600 transition py-2`}
              >
                Contact
              </Link>
              {isAuthenticated && userRole === 'USER' && (
                <Link
                  to="/booking-history"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    location.pathname === '/booking-history'
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-700'
                  } hover:text-blue-600 transition py-2`}
                >
                  Lịch sử đặt phòng
                </Link>
              )}
              {isAuthenticated && userRole === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    location.pathname === '/admin'
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-700'
                  } hover:text-blue-600 transition py-2`}
                >
                  Admin Dashboard
                </Link>
              )}
              {isAuthenticated && userRole === 'OWNER' && (
                <Link
                  to="/owner"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    location.pathname === '/owner'
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-700'
                  } hover:text-blue-600 transition py-2`}
                >
                  Quản lý khách sạn
                </Link>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-red-600 hover:text-red-700 transition py-2 text-left"
                >
                  Đăng xuất
                </button>
              )}
            </motion.nav>
          )}
        </AnimatePresence>

        {showBookingForm && (
          <BookingFilterForm />
        )}
      </div>
    </header>
  )
}

export default Header
