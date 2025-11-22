import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Pie } from '@ant-design/charts'
import { adminService } from '../services'
import type { AdminPercent, BookingTransaction, WithdrawRequest, PendingHotel, RevenueSummary } from '../services/adminService'
import { ownerService } from '../services'
import Header from '../components/Header'
import AppModal from '../components/AppModal'
import { Check, X, Eye } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import AdminPercentForm, { type AdminPercentFormData } from '../components/AdminPercentForm'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'hotels' | 'transactions' | 'withdraws' | 'settings' | 'revenue'>('overview')
  const [pendingHotels, setPendingHotels] = useState<PendingHotel[]>([])
  const [selectedHotel, setSelectedHotel] = useState<PendingHotel | null>(null)
  const [transactions, setTransactions] = useState<BookingTransaction[]>([])
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([])
  const [adminPercent, setAdminPercent] = useState<AdminPercent | null>(null)
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingHotelId, setProcessingHotelId] = useState<number | null>(null)
  const [hotelSearchQuery, setHotelSearchQuery] = useState('')
  const { showSuccess, showError } = useToast()

  // Fetch pending hotels ngay khi mount để hiển thị stats
  const fetchPendingHotels = useCallback(async () => {
    try {
      const response = await adminService.getPendingHotels()
      if (response.data) setPendingHotels(response.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      console.error('Error fetching pending hotels:', error)
    }
  }, [])

  // Fetch transactions ngay khi mount để hiển thị stats
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await adminService.getAllTransactions()
      if (response.data) setTransactions(response.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      console.error('Error fetching transactions:', error)
    }
  }, [])

  // Fetch withdraws ngay khi mount để hiển thị stats
  const fetchWithdraws = useCallback(async () => {
    try {
      const response = await adminService.getAllWithdraws()
      if (response.data) setWithdraws(response.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      console.error('Error fetching withdraws:', error)
    }
  }, [])

  // Fetch admin percent ngay khi mount để hiển thị trong overview
  const fetchAdminPercent = useCallback(async () => {
    try {
      const response = await adminService.getAdminPercent()
      if (response.data) setAdminPercent(response.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      console.error('Error fetching admin percent:', error)
    }
  }, [])

  // Fetch wallet balance
  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await ownerService.getWalletBalance()
      if (response.data) {
        setWalletBalance(response.data.balance)
      }
    } catch {
      // Silently fail
      setWalletBalance(null)
    }
  }, [])

  // Fetch data theo tab được chọn
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      if (activeTab === 'hotels') {
        const response = await adminService.getPendingHotels(hotelSearchQuery || undefined)
        if (response.data) setPendingHotels(response.data)
      } else if (activeTab === 'transactions') {
        const response = await adminService.getAllTransactions()
        if (response.data) setTransactions(response.data)
      } else if (activeTab === 'withdraws') {
        const response = await adminService.getAllWithdraws()
        if (response.data) setWithdraws(response.data)
      } else if (activeTab === 'settings') {
        const response = await adminService.getAdminPercent()
        if (response.data) setAdminPercent(response.data)
      } else if (activeTab === 'revenue') {
        const response = await adminService.getRevenue()
        if (response.data) setRevenue(response.data)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [activeTab, hotelSearchQuery])

  // Debounce search query
  useEffect(() => {
    if (activeTab === 'hotels') {
      const timeoutId = setTimeout(() => {
        fetchData()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [hotelSearchQuery, activeTab, fetchData])

  // Lắng nghe event từ Header để chuyển tab
  useEffect(() => {
    const handleSwitchToWithdrawTab = () => {
      setActiveTab('withdraws')
    }
    window.addEventListener('switchToWithdrawTab', handleSwitchToWithdrawTab)
    return () => {
      window.removeEventListener('switchToWithdrawTab', handleSwitchToWithdrawTab)
    }
  }, [])

  // Kiểm tra URL params để chuyển tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab === 'withdraws') {
      setActiveTab('withdraws')
    }
  }, [])

  // Fetch stats data ngay khi mount
  useEffect(() => {
    fetchPendingHotels()
    fetchTransactions()
    fetchWithdraws()
    fetchAdminPercent()
    fetchWalletBalance()
  }, [fetchPendingHotels, fetchTransactions, fetchWithdraws, fetchAdminPercent, fetchWalletBalance])

  // Fetch data khi tab thay đổi
  useEffect(() => {
    fetchData()
  }, [fetchData])


  const handleUpdatePercent = async (percentValue: number) => {
    try {
      await adminService.updateAdminPercent(percentValue)
      showSuccess('Cập nhật thành công!')
      // Refresh admin percent để cập nhật UI
      await fetchAdminPercent()
      if (activeTab === 'settings') {
      fetchData()
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể cập nhật')
    }
  }

  const handleApproveTransaction = async (id: number) => {
    try {
      await adminService.setTransaction(id)
      showSuccess('Duyệt giao dịch thành công!')
      // Refresh transactions để cập nhật stats
      await fetchTransactions()
      if (activeTab === 'transactions') {
      fetchData()
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể duyệt giao dịch')
    }
  }

  const handleApproveWithdraw = async (id: number) => {
    try {
      await adminService.approveWithdraw(id)
      showSuccess('Duyệt yêu cầu rút tiền thành công!')
      // Refresh withdraws và wallet balance để cập nhật stats
      await Promise.all([fetchWithdraws(), fetchWalletBalance()])
      if (activeTab === 'withdraws') {
      fetchData()
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể duyệt yêu cầu')
    }
  }

  const handleRejectWithdraw = async (id: number) => {
    try {
      await adminService.rejectWithdraw(id)
      showSuccess('Đã từ chối yêu cầu rút tiền. Tiền đã được hoàn lại vào ví của owner.')
      // Refresh withdraws và wallet balance để cập nhật stats
      await Promise.all([fetchWithdraws(), fetchWalletBalance()])
      if (activeTab === 'withdraws') {
      fetchData()
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể từ chối yêu cầu')
    }
  }

  const handleApproveHotel = async (id: number) => {
    try {
      setProcessingHotelId(id)
      await adminService.approveHotel(id)
      showSuccess('Đã duyệt khách sạn thành công!')
      // Refresh cả pending hotels, transactions và withdraws
      await Promise.all([fetchPendingHotels(), fetchTransactions(), fetchWithdraws()])
      if (activeTab === 'hotels') {
        fetchData()
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể duyệt khách sạn')
    } finally {
      setProcessingHotelId(null)
    }
  }

  const handleRejectHotel = async (id: number) => {
    try {
      setProcessingHotelId(id)
      await adminService.rejectHotel(id)
      showSuccess('Đã từ chối khách sạn')
      // Refresh pending hotels
      await fetchPendingHotels()
      if (activeTab === 'hotels') {
        fetchData()
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể từ chối khách sạn')
    } finally {
      setProcessingHotelId(null)
    }
  }

  const stats = [
    { label: 'Khách sạn chờ duyệt', value: pendingHotels.length, icon: '🏨', gradient: 'from-yellow-500 to-orange-500' },
    { label: 'Tổng giao dịch', value: transactions.length, icon: '💳', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Giao dịch chờ duyệt', value: transactions.filter(t => t.status === 'PENDING').length, icon: '⏳', gradient: 'from-yellow-500 to-amber-500' },
    { label: 'Yêu cầu rút tiền', value: withdraws.filter(w => w.status === 'pending').length, icon: '💸', gradient: 'from-purple-500 to-pink-500' },
    { 
      label: 'Số dư ví Admin', 
      value: walletBalance !== null ? `${Number(walletBalance).toLocaleString('vi-VN')} VND` : 'Đang tải...', 
      icon: '💰', 
      gradient: 'from-green-500 to-emerald-600' 
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Quản lý hệ thống và giao dịch</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`bg-gradient-to-br ${stat.gradient} rounded-3xl p-6 text-white shadow-xl`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">{stat.icon}</span>
              </div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-base opacity-95 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto scrollbar-hide">
              {[
              { id: 'overview', label: 'Tổng quan', icon: '📊' },
              { id: 'hotels', label: 'Khách sạn', icon: '🏨' },
              { id: 'transactions', label: 'Giao dịch', icon: '💳' },
              { id: 'withdraws', label: 'Yêu cầu rút tiền', icon: '💸' },
              { id: 'revenue', label: 'Doanh thu', icon: '💰' },
              { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'hotels' | 'transactions' | 'withdraws' | 'settings' | 'revenue')}
                className={`flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 whitespace-nowrap transition flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="text-xs sm:text-sm md:text-base">{tab.label}</span>
                {tab.id === 'hotels' && pendingHotels.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5">
                    {pendingHotels.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {activeTab === 'hotels' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Khách sạn chờ duyệt</h2>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      value={hotelSearchQuery}
                      onChange={(e) => setHotelSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm khách sạn..."
                      className="flex-1 sm:w-48 md:w-64 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-xs sm:text-sm"
                    />
                    {hotelSearchQuery && (
                      <button
                        onClick={() => setHotelSearchQuery('')}
                        className="bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-300 transition text-sm flex-shrink-0"
                      >
                        ✕
                      </button>
                    )}
                    <span className="px-2 sm:px-3 py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                      {pendingHotels.length} khách sạn
                    </span>
                  </div>
                </div>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Đang tải...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : pendingHotels.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-gray-600 text-lg">Không có khách sạn nào đang chờ duyệt</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {pendingHotels.map((hotel, index) => (
                      <motion.div
                        key={hotel.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-yellow-200 hover:border-yellow-400 transition-all"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={hotel.images && hotel.images.length > 0 ? hotel.images[0].imageUrl : hotel.image || 'https://via.placeholder.com/400'}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Chờ duyệt
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{hotel.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hotel.address}</p>
                          {hotel.owner && (
                            <p className="text-xs text-gray-500 mb-3">
                              Chủ sở hữu: <span className="font-semibold">{hotel.owner.username}</span>
                            </p>
                          )}
                          {hotel.description && (
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{hotel.description}</p>
                          )}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleApproveHotel(hotel.id)}
                              disabled={processingHotelId === hotel.id}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
                            >
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                              {processingHotelId === hotel.id ? 'Đang xử lý...' : 'Duyệt'}
                            </button>
                            <button
                              onClick={() => handleRejectHotel(hotel.id)}
                              disabled={processingHotelId === hotel.id}
                              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              Từ chối
                            </button>
                            <button
                              onClick={() => setSelectedHotel(hotel)}
                              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center"
                              aria-label="View details"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">Tổng quan hệ thống</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">Giao dịch</h3>
                    <p className="text-gray-700 text-base mb-1">
                      Tổng: <span className="font-bold">{transactions.length}</span> giao dịch
                    </p>
                    <p className="text-gray-700 text-base mb-1">
                      Chờ duyệt: <span className="font-bold text-yellow-600">{transactions.filter(t => t.status === 'PENDING').length}</span>
                    </p>
                    <p className="text-gray-700 text-base">
                      Đã duyệt: <span className="font-bold text-green-600">{transactions.filter(t => t.status === 'APPROVED').length}</span>
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">Khách sạn chờ duyệt</h3>
                    <p className="text-gray-700 text-base font-semibold mb-2">
                      {pendingHotels.length} khách sạn đang chờ duyệt
                    </p>
                    {pendingHotels.length > 0 && (
                      <button
                        onClick={() => setActiveTab('hotels')}
                        className="text-sm text-green-700 hover:text-green-800 font-semibold underline"
                      >
                        Xem chi tiết →
                      </button>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">Yêu cầu rút tiền</h3>
                    <p className="text-gray-700 text-base mb-1">
                      Chờ duyệt: <span className="font-bold text-yellow-600">{withdraws.filter(w => w.status === 'pending').length}</span>
                    </p>
                    <p className="text-gray-700 text-base mb-1">
                      Đã duyệt: <span className="font-bold text-green-600">{withdraws.filter(w => w.status === 'resolved').length}</span>
                    </p>
                    <p className="text-gray-700 text-base">
                      Tổng: <span className="font-bold">{withdraws.length}</span> yêu cầu
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">Trạng thái hệ thống</h3>
                    <p className="text-green-600 font-bold text-lg mb-2">✓ Hoạt động bình thường</p>
                    {adminPercent && (
                      <p className="text-gray-700 text-sm">
                        Phí admin: <span className="font-bold">{(adminPercent.adminPercent * 100).toFixed(1)}%</span>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'transactions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">Quản lý giao dịch</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Đang tải...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Chưa có giao dịch nào</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">ID</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Khách sạn</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Tổng tiền</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Admin</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Owner</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Trạng thái</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction, index) => (
                          <motion.tr
                            key={transaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">#{transaction.id}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm break-words">
                              {transaction.bookingEntity?.hotel?.name || 'N/A'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap">
                              {Number(transaction.amount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-blue-600 whitespace-nowrap">
                              {Number(transaction.Admin_mount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-green-600 whitespace-nowrap">
                              {Number(transaction.User_mount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  transaction.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-700'
                                    : transaction.status === 'REJECTED'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {transaction.status === 'APPROVED'
                                  ? 'Đã duyệt'
                                  : transaction.status === 'REJECTED'
                                  ? 'Từ chối'
                                  : 'Chờ duyệt'}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              {transaction.status === 'PENDING' && (
                                <button
                                  onClick={() => handleApproveTransaction(transaction.id)}
                                  className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-green-700 transition whitespace-nowrap"
                                >
                                  Duyệt
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'withdraws' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">Yêu cầu rút tiền</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Đang tải...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : withdraws.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Chưa có yêu cầu rút tiền nào</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">ID</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Số tiền</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Ngân hàng</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Số TK</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Chủ TK</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Ngày tạo</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Trạng thái</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdraws.map((withdraw, index) => (
                          <motion.tr
                            key={withdraw.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">#{withdraw.id}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap">
                              {Number(withdraw.amount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm break-words">{withdraw.bankName}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm break-words">{withdraw.accountNumber}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm break-words">{withdraw.accountHolderName}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                              {new Date(withdraw.create_AT).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  withdraw.status === 'resolved'
                                    ? 'bg-green-100 text-green-700'
                                    : withdraw.status === 'refuse'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {withdraw.status === 'resolved'
                                  ? 'Đã duyệt'
                                  : withdraw.status === 'refuse'
                                  ? 'Từ chối'
                                  : 'Chờ duyệt'}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              {withdraw.status === 'pending' && (
                                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                  <button
                                    onClick={() => handleApproveWithdraw(withdraw.id)}
                                    className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-green-700 transition whitespace-nowrap"
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleRejectWithdraw(withdraw.id)}
                                    className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-red-700 transition whitespace-nowrap"
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'revenue' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 sm:p-6 space-y-4 sm:space-y-6"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">Quản lý doanh thu hệ thống</h2>
                {!revenue ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Đang tải dữ liệu doanh thu...</p>
                  </div>
                ) : (
                  <>
                    {/* Revenue Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="text-xs sm:text-sm opacity-90 mb-2">Tổng doanh thu hệ thống</div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold break-words">
                          {Number(revenue.totalRevenue).toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="text-xs sm:text-sm opacity-90 mb-2">Doanh thu Admin</div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold break-words">
                          {Number(revenue.adminRevenue).toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="text-xs sm:text-sm opacity-90 mb-2">Doanh thu Owners</div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold break-words">
                          {Number(revenue.ownerRevenue).toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                        <div className="text-xs sm:text-sm opacity-90 mb-2">Chờ duyệt</div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold break-words">
                          {Number(revenue.pendingRevenue).toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                    </div>

                    {/* Revenue Distribution Pie Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-bold mb-4">Phân bổ doanh thu</h3>
                      <Pie
                        data={[
                          { type: 'Admin', value: Number(revenue.adminRevenue) },
                          { type: 'Owners', value: Number(revenue.ownerRevenue) },
                        ]}
                        angleField="value"
                        colorField="type"
                        radius={0.8}
                        label={{
                          type: 'outer',
                          content: '{name}: {percentage}',
                        }}
                        height={300}
                      />
                    </div>

                    {/* Revenue Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Thống kê giao dịch</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tổng giao dịch:</span>
                            <span className="font-bold text-lg">{revenue.totalTransactions}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Đã duyệt:</span>
                            <span className="font-bold text-lg text-green-600">{revenue.approvedTransactions}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Chờ duyệt:</span>
                            <span className="font-bold text-lg text-yellow-600">
                              {revenue.totalTransactions - revenue.approvedTransactions}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Tỷ lệ doanh thu</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Admin</span>
                              <span className="text-sm font-semibold">
                                {revenue.totalRevenue > 0
                                  ? ((Number(revenue.adminRevenue) / Number(revenue.totalRevenue)) * 100).toFixed(1)
                                  : 0}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    revenue.totalRevenue > 0
                                      ? (Number(revenue.adminRevenue) / Number(revenue.totalRevenue)) * 100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Owners</span>
                              <span className="text-sm font-semibold">
                                {revenue.totalRevenue > 0
                                  ? ((Number(revenue.ownerRevenue) / Number(revenue.totalRevenue)) * 100).toFixed(1)
                                  : 0}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    revenue.totalRevenue > 0
                                      ? (Number(revenue.ownerRevenue) / Number(revenue.totalRevenue)) * 100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4">Cài đặt hệ thống</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <AdminPercentForm
                    onSubmit={async (data: AdminPercentFormData) => {
                      await handleUpdatePercent(data.percent / 100)
                    }}
                    defaultValue={adminPercent?.adminPercent}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Hotel Detail Modal */}
      <AppModal
        isOpen={selectedHotel !== null}
        onClose={() => setSelectedHotel(null)}
        title={selectedHotel?.name || 'Chi tiết khách sạn'}
        size="lg"
      >
        {selectedHotel && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-600">Tên khách sạn</label>
                <p className="text-sm sm:text-base font-bold text-gray-900 break-words">{selectedHotel.name}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-600">Số điện thoại</label>
                <p className="text-sm sm:text-base text-gray-900 break-words">{selectedHotel.phone}</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-600">Địa chỉ</label>
                <p className="text-sm sm:text-base text-gray-900 break-words">{selectedHotel.address}</p>
              </div>
              {selectedHotel.owner && (
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Chủ sở hữu</label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">{selectedHotel.owner.username}</p>
                </div>
              )}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-600">Email</label>
                <p className="text-sm sm:text-base text-gray-900 break-words">{selectedHotel.owner?.email || 'N/A'}</p>
              </div>
              {selectedHotel.description && (
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Mô tả</label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">{selectedHotel.description}</p>
                </div>
              )}
            </div>
            {(selectedHotel.images && selectedHotel.images.length > 0) && (
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 block">Ảnh khách sạn</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedHotel.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt={selectedHotel.name}
                      className="w-full h-24 object-cover rounded-xl"
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (selectedHotel) {
                    handleApproveHotel(selectedHotel.id)
                    setSelectedHotel(null)
                  }
                }}
                disabled={processingHotelId === selectedHotel?.id}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Duyệt khách sạn
              </button>
              <button
                onClick={() => {
                  if (selectedHotel) {
                    handleRejectHotel(selectedHotel.id)
                    setSelectedHotel(null)
                  }
                }}
                disabled={processingHotelId === selectedHotel?.id}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Từ chối
              </button>
            </div>
          </div>
        )}
      </AppModal>
    </div>
  )
}

export default AdminDashboard

