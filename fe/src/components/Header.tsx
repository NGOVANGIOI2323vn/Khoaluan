import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { ownerService } from '../services/ownerService'
import { Wallet, User, LogOut, Settings } from 'lucide-react'
import BookingFilterForm from './BookingFilterForm'
import Logo from './Logo'

interface HeaderProps {
  showBookingForm?: boolean
}

const Header = ({ showBookingForm = false }: HeaderProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Fetch wallet balance for owner/admin/user
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (isAuthenticated && (userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'USER')) {
        try {
          const response = await ownerService.getWalletBalance()
          if (response.data) {
            setWalletBalance(response.data.balance)
          }
        } catch {
          // Silently fail - wallet might not be available
          setWalletBalance(null)
        }
      } else {
        setWalletBalance(null)
      }
    }
    
    fetchWalletBalance()
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchWalletBalance, 30000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated, userRole])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUserRole(null)
    setUsername(null)
    setShowUserDropdown(false)
    // Redirect về home sau khi logout
    navigate('/')
  }
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-3 sm:py-4">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-6">
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

            {isAuthenticated && username ? (
              <div className="flex items-center gap-2 md:gap-3">
                {/* Wallet Balance for Owner/Admin/User */}
                {(userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'USER') && walletBalance !== null && (
                  <div className="hidden md:block relative group">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-md cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                      <span className="text-lg">💰</span>
                      <div className="flex flex-col">
                        <span className="text-xs opacity-90">Số dư</span>
                        <span className="text-sm font-bold">
                          {Number(walletBalance).toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    </div>
                    {/* Hover Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {userRole === 'USER' ? (
                        <Link
                          to="/wallet"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                        >
                          <Wallet className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-700">Quản lý ví</span>
                        </Link>
                      ) : (
                        <Link
                          to={userRole === 'OWNER' ? '/owner?tab=withdraws' : '/admin?tab=withdraws'}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                          onClick={() => {
                            // Dispatch event để OwnerDashboard chuyển tab
                            window.dispatchEvent(new CustomEvent('switchToWithdrawTab'))
                          }}
                        >
                          <Wallet className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-700">Rút tiền</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
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
                    <svg
                      className={`w-4 h-4 text-gray-600 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                      >
                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                          >
                            <User className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-700">Thông tin cá nhân</span>
                          </Link>
                          {userRole === 'OWNER' && (
                            <Link
                              to="/owner"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                            >
                              <Settings className="w-5 h-5 text-gray-600" />
                              <span className="text-sm font-semibold text-gray-700">Quản lý khách sạn</span>
                            </Link>
                          )}
                          {userRole === 'ADMIN' && (
                            <Link
                              to="/admin"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                            >
                              <Settings className="w-5 h-5 text-gray-600" />
                              <span className="text-sm font-semibold text-gray-700">Admin Dashboard</span>
                            </Link>
                          )}
                          {userRole === 'USER' && (
                            <>
                              <Link
                                to="/wallet"
                                onClick={() => setShowUserDropdown(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                              >
                                <Wallet className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-700">Ví điện tử</span>
                              </Link>
                              <Link
                                to="/booking-history"
                                onClick={() => setShowUserDropdown(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                              >
                                <Settings className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-700">Lịch sử đặt phòng</span>
                              </Link>
                            </>
                          )}
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-left"
                          >
                            <LogOut className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">Đăng xuất</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
          <BookingFilterForm variant="default" />
        )}
      </div>
    </header>
  )
}

export default Header
