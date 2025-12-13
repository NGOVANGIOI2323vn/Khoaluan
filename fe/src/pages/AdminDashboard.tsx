import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../services'
import type { AdminPercent, BookingTransaction, WithdrawRequest, PendingHotel, RevenueSummary, User, UserStats, HotelReview, CreateHotelRoom } from '../services/adminService'
import { ownerService } from '../services'
import Header from '../components/Header'
import AppModal from '../components/AppModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { Check, X, Eye, Lock, Unlock, UserCog } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { useConfirm } from '../hooks/useConfirm'
import { useDebounce } from '../hooks/useDebounce'
import AdminPercentForm, { type AdminPercentFormData } from '../components/AdminPercentForm'
import HotelForm, { type HotelFormData } from '../components/HotelForm'
import type { CreateHotelData, UpdateHotelData } from '../services/adminService'
import cloudinaryService from '../utils/cloudinaryService'
import { geocodingService } from '../services/geocodingService'

// Memoized components để tránh re-render không cần thiết
const TransactionRow = memo(({ transaction, index }: { 
  transaction: BookingTransaction
  index: number
}) => (
  <motion.tr
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
      {transaction.amount 
        ? (typeof transaction.amount === 'string' 
            ? Number(transaction.amount).toLocaleString('vi-VN') 
            : Number(transaction.amount).toLocaleString('vi-VN'))
        : '0'} VND
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-blue-600 whitespace-nowrap">
      {(() => {
        const adminMount = transaction.Admin_mount ?? transaction.admin_mount
        if (adminMount == null || adminMount === undefined) return '0'
        const numValue = typeof adminMount === 'string' ? parseFloat(adminMount) : Number(adminMount)
        return isNaN(numValue) ? '0' : numValue.toLocaleString('vi-VN')
      })()} VND
    </td>
    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-green-600 whitespace-nowrap">
      {(() => {
        const userMount = transaction.User_mount ?? transaction.user_mount
        if (userMount == null || userMount === undefined) return '0'
        const numValue = typeof userMount === 'string' ? parseFloat(userMount) : Number(userMount)
        return isNaN(numValue) ? '0' : numValue.toLocaleString('vi-VN')
      })()} VND
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
      {/* Chức năng duyệt đã bị vô hiệu hóa - tiền đã được tự động chia khi thanh toán */}
    </td>
  </motion.tr>
))
TransactionRow.displayName = 'TransactionRow'

const WithdrawRow = memo(({ withdraw, index, onApprove, onReject }: { 
  withdraw: WithdrawRequest
  index: number
  onApprove: (id: number) => void
  onReject: (id: number) => void
}) => (
  <motion.tr
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
            onClick={() => onApprove(withdraw.id)}
            className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-green-700 transition whitespace-nowrap"
          >
            Duyệt
          </button>
          <button
            onClick={() => onReject(withdraw.id)}
            className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-red-700 transition whitespace-nowrap"
          >
            Từ chối
          </button>
        </div>
      )}
    </td>
  </motion.tr>
))
WithdrawRow.displayName = 'WithdrawRow'

// Memoized Stats Cards component
const StatsCards = memo(({ stats }: { stats: Array<{ label: string; value: string | number; icon: string; gradient: string }> }) => (
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
))
StatsCards.displayName = 'StatsCards'

// Memoized Tabs component
const TabsNavigation = memo(({ 
  activeTab, 
  setActiveTab, 
  pendingHotelsCount 
}: { 
  activeTab: string
  setActiveTab: (tab: 'overview' | 'pending-hotels' | 'hotels' | 'transactions' | 'withdraws' | 'settings' | 'revenue' | 'users' | 'reviews') => void
  pendingHotelsCount: number
}) => {
  const tabs = useMemo(() => [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'pending-hotels', label: 'Duyệt khách sạn', icon: '⏳' },
    { id: 'hotels', label: 'Xem khách sạn', icon: '🏨' },
    { id: 'transactions', label: 'Giao dịch', icon: '💳' },
    { id: 'withdraws', label: 'Yêu cầu rút tiền', icon: '💸' },
    { id: 'revenue', label: 'Doanh thu', icon: '💰' },
    { id: 'users', label: 'Tài khoản', icon: '👥' },
    { id: 'reviews', label: 'Bình luận', icon: '💬' },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
  ], [])

  return (
    <div className="flex border-b overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as 'overview' | 'pending-hotels' | 'hotels' | 'transactions' | 'withdraws' | 'settings' | 'revenue' | 'users' | 'reviews')}
          className={`flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 whitespace-nowrap transition flex-shrink-0 ${
            activeTab === tab.id
              ? 'border-b-2 border-blue-600 text-blue-600 font-semibold bg-blue-50'
              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
          }`}
        >
          <span className="text-base sm:text-lg">{tab.icon}</span>
          <span className="text-xs sm:text-sm md:text-base">{tab.label}</span>
          {tab.id === 'pending-hotels' && pendingHotelsCount > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5">
              {pendingHotelsCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
})
TabsNavigation.displayName = 'TabsNavigation'

// Memoized Transactions Table component
const TransactionsTable = memo(({ 
  transactions, 
  loading, 
  error, 
  searchQuery, 
  onSearchChange, 
  onClearSearch,
  page,
  totalPages,
  totalElements,
  onPageChange
}: {
  transactions: BookingTransaction[]
  loading: boolean
  error: string
  searchQuery: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-4"
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Quản lý giao dịch</h2>
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm giao dịch, khách sạn, người dùng..."
          className="flex-1 sm:w-48 md:w-64 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-xs sm:text-sm"
        />
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-300 transition text-sm flex-shrink-0"
          >
            ✕
          </button>
        )}
        {totalElements > 0 && (
          <span className="px-2 sm:px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
            {totalElements} giao dịch
          </span>
        )}
      </div>
    </div>
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
      <>
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
                {/* Cột Thao tác đã bị loại bỏ - tiền đã được tự động chia khi thanh toán */}
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Trang {page + 1} / {totalPages} ({totalElements} giao dịch)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(0)}
                disabled={page === 0}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Đầu
              </button>
              <button
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
              <button
                onClick={() => onPageChange(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Cuối
              </button>
            </div>
          </div>
        )}
      </>
    )}
  </motion.div>
))
TransactionsTable.displayName = 'TransactionsTable'

// Memoized Withdraws Table component
const WithdrawsTable = memo(({ 
  withdraws, 
  loading, 
  error, 
  searchQuery, 
  onSearchChange,
  onApprove,
  onReject,
  page,
  totalPages,
  totalElements,
  onPageChange
}: {
  withdraws: WithdrawRequest[]
  loading: boolean
  error: string
  searchQuery: string
  onSearchChange: (value: string) => void
  onApprove: (id: number) => void
  onReject: (id: number) => void
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-4"
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Yêu cầu rút tiền</h2>
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm yêu cầu, ngân hàng, chủ TK..."
          className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-xs sm:text-sm w-full sm:w-auto min-w-[200px]"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-300 transition text-sm flex-shrink-0"
          >
            ✕
          </button>
        )}
        {totalElements > 0 && (
          <span className="px-2 sm:px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
            {totalElements} yêu cầu
          </span>
        )}
      </div>
    </div>
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
      <>
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
                <WithdrawRow
                  key={withdraw.id}
                  withdraw={withdraw}
                  index={index}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Trang {page + 1} / {totalPages} ({totalElements} yêu cầu)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(0)}
                disabled={page === 0}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Đầu
              </button>
              <button
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
              <button
                onClick={() => onPageChange(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Cuối
              </button>
            </div>
          </div>
        )}
      </>
    )}
  </motion.div>
))
WithdrawsTable.displayName = 'WithdrawsTable'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pending-hotels' | 'hotels' | 'transactions' | 'withdraws' | 'settings' | 'revenue' | 'users' | 'reviews'>('overview')
  const [pendingHotelSearchQuery, setPendingHotelSearchQuery] = useState('')
  const debouncedPendingHotelSearch = useDebounce(pendingHotelSearchQuery, 500)
  const [pendingHotels, setPendingHotels] = useState<PendingHotel[]>([])
  const [pendingHotelsPage, setPendingHotelsPage] = useState(0)
  const [pendingHotelsPageSize] = useState(10)
  const [pendingHotelsTotalPages, setPendingHotelsTotalPages] = useState(0)
  const [pendingHotelsTotalElements, setPendingHotelsTotalElements] = useState(0)
  const [allHotels, setAllHotels] = useState<PendingHotel[]>([])
  const [allHotelsPage, setAllHotelsPage] = useState(0)
  const [allHotelsPageSize] = useState(10)
  const [allHotelsTotalPages, setAllHotelsTotalPages] = useState(0)
  const [allHotelsTotalElements, setAllHotelsTotalElements] = useState(0)
  const [selectedHotel, setSelectedHotel] = useState<PendingHotel | null>(null)
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false)
  const [isEditingHotel, setIsEditingHotel] = useState(false)
  const [editingHotelId, setEditingHotelId] = useState<number | null>(null)
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([])
  const [isSubmittingHotel, setIsSubmittingHotel] = useState(false)
  const [transactions, setTransactions] = useState<BookingTransaction[]>([])
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([])
  const [adminPercent, setAdminPercent] = useState<AdminPercent | null>(null)
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [usersPage, setUsersPage] = useState(0)
  const [usersPageSize] = useState(10)
  const [usersTotalPages, setUsersTotalPages] = useState(0)
  const [usersTotalElements, setUsersTotalElements] = useState(0)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userRoleFilter, setUserRoleFilter] = useState<'USER' | 'OWNER' | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingHotelId, setProcessingHotelId] = useState<number | null>(null)
  const [hotelSearchQuery, setHotelSearchQuery] = useState('')
  const [processingUserId, setProcessingUserId] = useState<number | null>(null)
  // Reviews state
  const [reviews, setReviews] = useState<HotelReview[]>([])
  const [reviewsPage, setReviewsPage] = useState(0)
  const [reviewsPageSize] = useState(10)
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0)
  const [reviewsTotalElements, setReviewsTotalElements] = useState(0)
  const [reviewSearchQuery, setReviewSearchQuery] = useState('')
  const [processingReviewId, setProcessingReviewId] = useState<number | null>(null)
  // Transactions pagination state
  const [transactionsPage, setTransactionsPage] = useState(0)
  const [transactionsPageSize] = useState(10)
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(0)
  const [transactionsTotalElements, setTransactionsTotalElements] = useState(0)
  const [transactionsSearchQuery, setTransactionsSearchQuery] = useState('')
  // Withdraws pagination state
  const [withdrawsPage, setWithdrawsPage] = useState(0)
  const [withdrawsPageSize] = useState(10)
  const [withdrawsTotalPages, setWithdrawsTotalPages] = useState(0)
  const [withdrawsTotalElements, setWithdrawsTotalElements] = useState(0)
  const [withdrawsSearchQuery, setWithdrawsSearchQuery] = useState('')
  const { showSuccess, showError } = useToast()
  const { confirm, close, handleConfirm, confirmState } = useConfirm()
  // Ref để tránh multiple API calls cùng lúc
  const isFetchingRef = useRef(false)
  
  // Debounce search queries
  const debouncedHotelSearch = useDebounce(hotelSearchQuery, 500)
  const debouncedReviewSearch = useDebounce(reviewSearchQuery, 500)
  const debouncedTransactionSearch = useDebounce(transactionsSearchQuery, 500)
  const debouncedWithdrawSearch = useDebounce(withdrawsSearchQuery, 500)

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

  // Fetch transactions ngay khi mount để hiển thị stats (không pagination)
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await adminService.getAllTransactions()
      if (response.data) {
        // Check if it's array or PageResponse
        if (Array.isArray(response.data)) {
        setTransactions(response.data)
        } else {
          setTransactions(response.data.content || [])
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      console.error('Error fetching transactions:', error)
    }
  }, [])

  // Fetch transactions với pagination
  const fetchTransactionsPaginated = useCallback(async (search?: string, page?: number, size?: number) => {
    try {
      const response = await adminService.getAllTransactions(search, page, size)
      if (response.data) {
        // Check if it's array or PageResponse
        if (Array.isArray(response.data)) {
          setTransactions(response.data)
          setTransactionsTotalPages(0)
          setTransactionsTotalElements(response.data.length)
        } else {
          setTransactions(response.data.content || [])
          setTransactionsTotalPages(response.data.totalPages || 0)
          setTransactionsTotalElements(response.data.totalElements || 0)
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      console.error('Error fetching transactions:', error)
    }
  }, [])

  // Fetch withdraws ngay khi mount để hiển thị stats (không pagination)
  const fetchWithdraws = useCallback(async () => {
    try {
      const response = await adminService.getAllWithdraws()
      if (response.data) {
        // Check if it's array or PageResponse
        if (Array.isArray(response.data)) {
          setWithdraws(response.data)
        } else {
          setWithdraws(response.data.content || [])
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      console.error('Error fetching withdraws:', error)
    }
  }, [])

  // Fetch withdraws với pagination
  const fetchWithdrawsPaginated = useCallback(async (search?: string, page?: number, size?: number) => {
    try {
      const response = await adminService.getAllWithdraws(search, page, size)
      if (response.data) {
        // Check if it's array or PageResponse
        if (Array.isArray(response.data)) {
          setWithdraws(response.data)
          setWithdrawsTotalPages(0)
          setWithdrawsTotalElements(response.data.length)
        } else {
          setWithdraws(response.data.content || [])
          setWithdrawsTotalPages(response.data.totalPages || 0)
          setWithdrawsTotalElements(response.data.totalElements || 0)
        }
      }
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

  // Fetch users
  const fetchUsers = useCallback(async (role?: 'USER' | 'OWNER') => {
    try {
      const response = await adminService.getAllUsers(role)
      if (response.data) setUsers(response.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      console.error('Error fetching users:', error)
    }
  }, [])

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await adminService.getUserStats()
      if (response.data) setUserStats(response.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      console.error('Error fetching user stats:', error)
    }
  }, [])

  // Fetch reviews
  const fetchReviews = useCallback(async (search?: string, page?: number, size?: number) => {
    try {
      const response = await adminService.getAllReviews(search, page, size)
      if (response.data) {
        setReviews(response.data.content)
        setReviewsTotalPages(response.data.totalPages)
        setReviewsTotalElements(response.data.totalElements)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      console.error('Error fetching reviews:', error)
    }
  }, [])

  // Fetch data theo tab được chọn
  const fetchData = useCallback(async () => {
    // Tránh multiple calls cùng lúc
    if (isFetchingRef.current) return
    
    try {
      isFetchingRef.current = true
      setLoading(true)
      
      if (activeTab === 'pending-hotels') {
        const response = await adminService.getPendingHotelsPaginated(debouncedPendingHotelSearch || undefined, pendingHotelsPage, pendingHotelsPageSize)
        if (response.data) {
          if ('content' in response.data) {
            setPendingHotels(response.data.content)
            setPendingHotelsTotalPages(response.data.totalPages)
            setPendingHotelsTotalElements(response.data.totalElements)
          } else {
            setPendingHotels(response.data as PendingHotel[])
          }
        }
      } else if (activeTab === 'hotels') {
        const response = await adminService.getAllHotelsPaginated(debouncedHotelSearch || undefined, allHotelsPage, allHotelsPageSize)
        if (response.data) {
          if ('content' in response.data) {
            setAllHotels(response.data.content)
            setAllHotelsTotalPages(response.data.totalPages)
            setAllHotelsTotalElements(response.data.totalElements)
          } else {
            setAllHotels(response.data as PendingHotel[])
          }
        }
      } else if (activeTab === 'transactions') {
        await fetchTransactionsPaginated(debouncedTransactionSearch || undefined, transactionsPage, transactionsPageSize)
      } else if (activeTab === 'withdraws') {
        await fetchWithdrawsPaginated(debouncedWithdrawSearch || undefined, withdrawsPage, withdrawsPageSize)
      } else if (activeTab === 'settings') {
        const response = await adminService.getAdminPercent()
        if (response.data) setAdminPercent(response.data)
      } else if (activeTab === 'revenue') {
        const response = await adminService.getRevenue()
        if (response.data) setRevenue(response.data)
      } else if (activeTab === 'users') {
        const role = userRoleFilter === 'ALL' ? undefined : userRoleFilter
        const response = await adminService.getAllUsersPaginated(role, usersPage, usersPageSize)
        if (response.data) {
          if ('content' in response.data) {
            setUsers(response.data.content)
            setUsersTotalPages(response.data.totalPages)
            setUsersTotalElements(response.data.totalElements)
          } else {
            setUsers(response.data as User[])
          }
        }
      } else if (activeTab === 'reviews') {
        await fetchReviews(debouncedReviewSearch || undefined, reviewsPage, reviewsPageSize)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [activeTab, debouncedHotelSearch, debouncedPendingHotelSearch, debouncedReviewSearch, debouncedTransactionSearch, debouncedWithdrawSearch, userRoleFilter, reviewsPage, reviewsPageSize, fetchReviews, transactionsPage, transactionsPageSize, fetchTransactionsPaginated, withdrawsPage, withdrawsPageSize, fetchWithdrawsPaginated, pendingHotelsPage, pendingHotelsPageSize, allHotelsPage, allHotelsPageSize, usersPage, usersPageSize])

  // Reset page về 0 khi debounced search query thay đổi (sau khi debounce)
  const prevDebouncedReviewRef = useRef(debouncedReviewSearch)
  const prevDebouncedTransactionRef = useRef(debouncedTransactionSearch)
  const prevDebouncedWithdrawRef = useRef(debouncedWithdrawSearch)

  useEffect(() => {
    if (activeTab === 'reviews' && prevDebouncedReviewRef.current !== debouncedReviewSearch) {
      prevDebouncedReviewRef.current = debouncedReviewSearch
      setReviewsPage(0)
    }
  }, [debouncedReviewSearch, activeTab])

  useEffect(() => {
    if (activeTab === 'transactions' && prevDebouncedTransactionRef.current !== debouncedTransactionSearch) {
      prevDebouncedTransactionRef.current = debouncedTransactionSearch
      setTransactionsPage(0)
    }
  }, [debouncedTransactionSearch, activeTab])

  useEffect(() => {
    if (activeTab === 'withdraws' && prevDebouncedWithdrawRef.current !== debouncedWithdrawSearch) {
      prevDebouncedWithdrawRef.current = debouncedWithdrawSearch
      setWithdrawsPage(0)
    }
  }, [debouncedWithdrawSearch, activeTab])

  // Reset page về 0 khi search query thay đổi
  useEffect(() => {
    if (activeTab === 'pending-hotels') {
      setPendingHotelsPage(0)
    }
  }, [debouncedPendingHotelSearch, activeTab])

  useEffect(() => {
    if (activeTab === 'hotels') {
      setAllHotelsPage(0)
    }
  }, [debouncedHotelSearch, activeTab])

  useEffect(() => {
    if (activeTab === 'users') {
      setUsersPage(0)
    }
  }, [userRoleFilter, activeTab])

  // Fetch data khi debounced search query thay đổi (cho pending-hotels và hotels)
  useEffect(() => {
    if (activeTab === 'pending-hotels') {
      fetchData()
    }
  }, [debouncedPendingHotelSearch, activeTab, fetchData])

  useEffect(() => {
    if (activeTab === 'hotels') {
      fetchData()
    }
  }, [debouncedHotelSearch, activeTab, fetchData])

  // Fetch data khi page thay đổi
  useEffect(() => {
    if (activeTab === 'pending-hotels') {
      fetchData()
    }
  }, [pendingHotelsPage, activeTab, fetchData])

  useEffect(() => {
    if (activeTab === 'hotels') {
      fetchData()
    }
  }, [allHotelsPage, activeTab, fetchData])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchData()
    }
  }, [usersPage, activeTab, fetchData])

  // Fetch data khi page thay đổi (cho reviews, transactions, withdraws)
  // Khi search query thay đổi, page sẽ được reset về 0 và trigger fetchData ở đây
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchData()
    }
  }, [reviewsPage, activeTab, fetchData])

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchData()
    }
  }, [transactionsPage, activeTab, fetchData])

  useEffect(() => {
    if (activeTab === 'withdraws') {
      fetchData()
    }
  }, [withdrawsPage, activeTab, fetchData])

  // Fetch users when role filter changes
  useEffect(() => {
    if (activeTab === 'users') {
      fetchData()
    }
  }, [userRoleFilter, activeTab, fetchData])

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
    fetchUserStats()
  }, [fetchPendingHotels, fetchTransactions, fetchWithdraws, fetchAdminPercent, fetchWalletBalance, fetchUserStats])

  // Fetch data khi tab thay đổi
  const prevTabRef = useRef(activeTab)
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab
      isFetchingRef.current = false
      fetchData()
    }
  }, [activeTab, fetchData])


  const handleUpdatePercent = async (percentValue: number) => {
    const confirmed = await confirm({
      title: 'Xác nhận cập nhật phí admin',
      message: `Bạn có chắc chắn muốn cập nhật phí admin thành ${(percentValue * 100).toFixed(1)}%?`,
      type: 'warning',
    })
    if (!confirmed) return
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

  // handleApproveTransaction đã bị vô hiệu hóa - tiền đã được tự động chia khi thanh toán

  const handleApproveWithdraw = useCallback(async (id: number) => {
    const confirmed = await confirm({
      title: 'Xác nhận duyệt yêu cầu rút tiền',
      message: 'Bạn có chắc chắn muốn duyệt yêu cầu rút tiền này? Tiền sẽ được chuyển đến tài khoản ngân hàng của owner.',
      type: 'success',
    })
    if (!confirmed) return
    try {
      await adminService.approveWithdraw(id)
      showSuccess('Duyệt yêu cầu rút tiền thành công!')
      // Refresh withdraws và wallet balance để cập nhật stats
      await Promise.all([fetchWithdraws(), fetchWalletBalance()])
      if (activeTab === 'withdraws') {
        await fetchWithdrawsPaginated(withdrawsSearchQuery || undefined, withdrawsPage, withdrawsPageSize)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể duyệt yêu cầu')
    }
  }, [confirm, showSuccess, showError, activeTab, withdrawsSearchQuery, withdrawsPage, withdrawsPageSize, fetchWithdraws, fetchWalletBalance, fetchWithdrawsPaginated])

  const handleRejectWithdraw = useCallback(async (id: number) => {
    const confirmed = await confirm({
      title: 'Xác nhận từ chối yêu cầu rút tiền',
      message: 'Bạn có chắc chắn muốn từ chối yêu cầu rút tiền này? Tiền sẽ được hoàn lại vào ví của owner.',
      type: 'warning',
    })
    if (!confirmed) return
    try {
      await adminService.rejectWithdraw(id)
      showSuccess('Đã từ chối yêu cầu rút tiền. Tiền đã được hoàn lại vào ví của owner.')
      // Refresh withdraws và wallet balance để cập nhật stats
      await Promise.all([fetchWithdraws(), fetchWalletBalance()])
      if (activeTab === 'withdraws') {
        await fetchWithdrawsPaginated(withdrawsSearchQuery || undefined, withdrawsPage, withdrawsPageSize)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể từ chối yêu cầu')
    }
  }, [confirm, showSuccess, showError, activeTab, withdrawsSearchQuery, withdrawsPage, withdrawsPageSize, fetchWithdraws, fetchWalletBalance, fetchWithdrawsPaginated])

  const handleApproveHotel = useCallback(async (id: number) => {
    const confirmed = await confirm({
      title: 'Xác nhận duyệt khách sạn',
      message: 'Bạn có chắc chắn muốn duyệt khách sạn này? Khách sạn sẽ được hiển thị công khai trên hệ thống.',
      type: 'success',
    })
    if (!confirmed) return
    try {
      setProcessingHotelId(id)
      await adminService.approveHotel(id)
      showSuccess('Đã duyệt khách sạn thành công!')
      
      // Cập nhật state trực tiếp để tránh loading state
      if (activeTab === 'pending-hotels') {
        setPendingHotels(prev => prev.filter(hotel => hotel.id !== id))
      } else if (activeTab === 'hotels') {
        setAllHotels(prev => prev.map(hotel => 
          hotel.id === id ? { ...hotel, status: 'success' as const } : hotel
        ))
      }
      
      // Cập nhật pending hotels count
      setPendingHotels(prev => prev.filter(hotel => hotel.id !== id))
      
      // Refresh transactions và withdraws ở background (không block UI)
      Promise.all([fetchTransactions(), fetchWithdraws()]).catch(() => {
        // Silently fail, không ảnh hưởng UI
      })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể duyệt khách sạn')
    } finally {
      setProcessingHotelId(null)
    }
  }, [confirm, showSuccess, showError, activeTab, fetchTransactions, fetchWithdraws])

  const handleRejectHotel = useCallback(async (id: number) => {
    const confirmed = await confirm({
      title: 'Xác nhận từ chối khách sạn',
      message: 'Bạn có chắc chắn muốn từ chối khách sạn này? Hành động này không thể hoàn tác.',
      type: 'danger',
    })
    if (!confirmed) return
    try {
      setProcessingHotelId(id)
      await adminService.rejectHotel(id)
      showSuccess('Đã từ chối khách sạn')
      
      // Cập nhật state trực tiếp để tránh loading state
      if (activeTab === 'pending-hotels') {
        setPendingHotels(prev => prev.filter(hotel => hotel.id !== id))
      } else if (activeTab === 'hotels') {
        setAllHotels(prev => prev.map(hotel => 
          hotel.id === id ? { ...hotel, status: 'fail' as const } : hotel
        ))
      }
      
      // Cập nhật pending hotels count
      setPendingHotels(prev => prev.filter(hotel => hotel.id !== id))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể từ chối khách sạn')
    } finally {
      setProcessingHotelId(null)
    }
  }, [confirm, showSuccess, showError, activeTab])

  const handleToggleLockHotel = useCallback(async (id: number, isLocked: boolean) => {
    const confirmed = await confirm({
      title: isLocked ? 'Xác nhận mở khóa khách sạn' : 'Xác nhận khóa khách sạn',
      message: isLocked 
        ? 'Bạn có chắc chắn muốn mở khóa khách sạn này? Khách sạn sẽ hiển thị lại cho người dùng.'
        : 'Bạn có chắc chắn muốn khóa khách sạn này? Khách sạn sẽ không hiển thị cho người dùng.',
      type: isLocked ? 'success' : 'warning',
    })
    if (!confirmed) return
    try {
      setProcessingHotelId(id)
      await adminService.toggleLockHotel(id)
      showSuccess(isLocked ? 'Mở khóa khách sạn thành công!' : 'Khóa khách sạn thành công!')
      
      // Cập nhật state trực tiếp
      if (activeTab === 'hotels') {
        setAllHotels(prev => prev.map(hotel => 
          hotel.id === id ? { ...hotel, locked: !isLocked } : hotel
        ))
      } else if (activeTab === 'pending-hotels') {
        setPendingHotels(prev => prev.map(hotel => 
          hotel.id === id ? { ...hotel, locked: !isLocked } : hotel
        ))
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể khóa/mở khóa khách sạn')
    } finally {
      setProcessingHotelId(null)
    }
  }, [confirm, showSuccess, showError, activeTab])

  const handleUpdateUserRole = useCallback(async (userId: number, newRole: 'USER' | 'OWNER') => {
    const roleName = newRole === 'USER' ? 'Khách hàng' : 'Chủ khách sạn'
    const confirmed = await confirm({
      title: 'Xác nhận thay đổi role',
      message: `Bạn có chắc chắn muốn chuyển role của người dùng này thành ${roleName}?`,
      type: 'warning',
    })
    if (!confirmed) return
    try {
      setProcessingUserId(userId)
      await adminService.updateUserRole(userId, newRole)
      showSuccess('Cập nhật role thành công!')
      // Refresh users
      await fetchUsers(userRoleFilter === 'ALL' ? undefined : userRoleFilter)
      await fetchUserStats()
      if (activeTab === 'users') {
        fetchData()
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể cập nhật role')
    } finally {
      setProcessingUserId(null)
    }
  }, [confirm, showSuccess, showError, activeTab, userRoleFilter, fetchUsers, fetchUserStats, fetchData])

  const handleDeleteReview = useCallback(async (reviewId: number) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa bình luận',
      message: 'Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.',
      type: 'danger',
    })
    if (!confirmed) return
    try {
      setProcessingReviewId(reviewId)
      await adminService.deleteReview(reviewId)
      showSuccess('Xóa bình luận thành công!')
      await fetchReviews(reviewSearchQuery || undefined, reviewsPage, reviewsPageSize)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể xóa bình luận')
    } finally {
      setProcessingReviewId(null)
    }
  }, [confirm, showSuccess, showError, reviewSearchQuery, reviewsPage, reviewsPageSize, fetchReviews])

  const handleToggleLockUser = useCallback(async (userId: number, isLocked: boolean) => {
    const confirmed = await confirm({
      title: isLocked ? 'Xác nhận mở khóa tài khoản' : 'Xác nhận khóa tài khoản',
      message: isLocked 
        ? 'Bạn có chắc chắn muốn mở khóa tài khoản này?'
        : 'Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập.',
      type: isLocked ? 'success' : 'warning',
    })
    if (!confirmed) return
    try {
      setProcessingUserId(userId)
      await adminService.toggleLockUser(userId)
      showSuccess(isLocked ? 'Mở khóa tài khoản thành công!' : 'Khóa tài khoản thành công!')
      // Refresh users
      await fetchUsers(userRoleFilter === 'ALL' ? undefined : userRoleFilter)
      await fetchUserStats()
      if (activeTab === 'users') {
        fetchData()
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể khóa/mở khóa tài khoản')
    } finally {
      setProcessingUserId(null)
    }
  }, [confirm, showSuccess, showError, activeTab, userRoleFilter, fetchUsers, fetchUserStats, fetchData])

  // Hotel CRUD handlers đã bị vô hiệu hóa - admin chỉ có thể xem và khóa hotel

  const handleSubmitHotel = useCallback(async (
    data: HotelFormData, 
    images: File[], 
    rooms: Array<{ number: string; price: number; image: File | null; existingImageUrl?: string }>
  ) => {
    try {
      setIsSubmittingHotel(true)
      
      // Geocode address to get latitude and longitude
      let latitude: number | undefined
      let longitude: number | undefined
      try {
        const geocodeResult = await geocodingService.geocodeAddress(data.address)
        if (geocodeResult.status === 'OK' && geocodeResult.lat && geocodeResult.lng) {
          latitude = geocodeResult.lat
          longitude = geocodeResult.lng
        } else {
          console.warn('Geocoding failed or returned no results:', geocodeResult.error)
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError)
        // Continue without lat/lng if geocoding fails
      }
      
      // Upload images to Cloudinary
      const hotelImageUrls: string[] = []
      const roomsImageUrls: string[] = []
      
      if (images.length > 0) {
        // Upload hotel images
        for (let i = 0; i < Math.min(images.length, 10); i++) {
          const response = await cloudinaryService.uploadImage(images[i])
          hotelImageUrls.push(response.secure_url)
        }
      }

      // Upload room images (only new images, keep existing ones)
      for (const room of rooms) {
        if (room.image) {
          // New image uploaded
          const response = await cloudinaryService.uploadImage(room.image)
          roomsImageUrls.push(response.secure_url)
        } else if (room.existingImageUrl) {
          // Keep existing image
          roomsImageUrls.push(room.existingImageUrl)
        } else {
          roomsImageUrls.push('') // Empty string if no image
        }
      }

      // Create room data
      const roomsData: CreateHotelRoom[] = rooms.map((room, index) => ({
        number: room.number,
        price: room.price,
        imageUrl: roomsImageUrls[index] || undefined,
      }))

      const hotelData: CreateHotelData = {
        name: data.name,
        address: data.address,
        phone: data.phone,
        description: data.description || '',
        imageUrls: hotelImageUrls.length > 0 ? hotelImageUrls : undefined,
        rooms: roomsData,
        latitude: latitude,
        longitude: longitude,
      }

      if (isEditingHotel && editingHotelId && selectedHotel) {
        // Update hotel - merge existing images (not removed) with new images
        const existingImageUrls: string[] = []
        if (selectedHotel.images && selectedHotel.images.length > 0) {
          // Only include images that were not removed
          selectedHotel.images
            .filter(img => !removedImageIds.includes(img.id))
            .forEach(img => existingImageUrls.push(img.imageUrl))
        }
        
        // Combine existing images (not removed) with new images
        const allImageUrls = [...existingImageUrls, ...hotelImageUrls]
        
        const updateData: UpdateHotelData = {
          name: data.name,
          address: data.address,
          phone: data.phone,
          description: data.description || '',
          imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
          latitude: latitude,
          longitude: longitude,
        }
        
        // Note: Backend should handle geocoding on update, but we can also send lat/lng if available
        await adminService.updateHotel(editingHotelId, updateData, allImageUrls.length > 0 ? allImageUrls : undefined)
        showSuccess('Cập nhật khách sạn thành công!')
        setRemovedImageIds([]) // Reset removed images after successful update
      } else {
        // Create hotel - backend will handle geocoding, but we can also send lat/lng if available
        await adminService.createHotel(hotelData, hotelImageUrls, roomsImageUrls)
        showSuccess('Tạo khách sạn thành công!')
      }

      setIsHotelModalOpen(false)
      setIsEditingHotel(false)
      setEditingHotelId(null)
      setSelectedHotel(null)
      if (activeTab === 'hotels') {
        fetchData()
      }
      await fetchPendingHotels()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể lưu khách sạn')
    } finally {
      setIsSubmittingHotel(false)
    }
  }, [isEditingHotel, editingHotelId, selectedHotel, removedImageIds, showSuccess, showError, activeTab, fetchData, fetchPendingHotels])

  // Memoize computed values để tránh re-compute không cần thiết
  const pendingTransactionsCount = useMemo(() => {
    return transactions.filter(t => t.status === 'PENDING').length
  }, [transactions])
  
  const approvedTransactionsCount = useMemo(() => {
    return transactions.filter(t => t.status === 'APPROVED').length
  }, [transactions])
  
  const pendingWithdrawsCount = useMemo(() => {
    return withdraws.filter(w => w.status === 'pending').length
  }, [withdraws])
  
  const resolvedWithdrawsCount = useMemo(() => {
    return withdraws.filter(w => w.status === 'resolved').length
  }, [withdraws])

  const stats = useMemo(() => [
    { label: 'Khách sạn chờ duyệt', value: pendingHotels.length, icon: '🏨', gradient: 'from-yellow-500 to-orange-500' },
    { label: 'Tổng giao dịch', value: transactions.length, icon: '💳', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Giao dịch chờ duyệt', value: pendingTransactionsCount, icon: '⏳', gradient: 'from-yellow-500 to-amber-500' },
    { label: 'Yêu cầu rút tiền', value: pendingWithdrawsCount, icon: '💸', gradient: 'from-purple-500 to-pink-500' },
    { 
      label: 'Số dư ví Admin', 
      value: walletBalance !== null ? `${Number(walletBalance).toLocaleString('vi-VN')} VND` : 'Đang tải...', 
      icon: '💰', 
      gradient: 'from-green-500 to-emerald-600' 
    },
  ], [pendingHotels.length, transactions.length, pendingTransactionsCount, pendingWithdrawsCount, walletBalance])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
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
        <StatsCards stats={stats} />

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <TabsNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            pendingHotelsCount={pendingHotels.length}
          />

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {activeTab === 'pending-hotels' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Duyệt khách sạn</h2>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      value={pendingHotelSearchQuery}
                      onChange={(e) => setPendingHotelSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm khách sạn..."
                      className="flex-1 sm:w-48 md:w-64 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-xs sm:text-sm"
                    />
                    {pendingHotelSearchQuery && (
                      <button
                        onClick={() => setPendingHotelSearchQuery('')}
                        className="bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-300 transition text-sm flex-shrink-0"
                      >
                        ✕
                      </button>
                    )}
                    <span className="px-2 sm:px-3 py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                      {pendingHotelsTotalElements > 0 ? pendingHotelsTotalElements : pendingHotels.length} khách sạn chờ duyệt
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
                            <button
                              onClick={() => handleToggleLockHotel(hotel.id, hotel.locked || false)}
                              disabled={processingHotelId === hotel.id}
                              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                                hotel.locked
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                              title={hotel.locked ? 'Mở khóa khách sạn' : 'Khóa khách sạn'}
                            >
                              {hotel.locked ? (
                                <Unlock className="w-3 h-3 sm:w-4 sm:h-4" />
                              ) : (
                                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {/* Pagination */}
                {pendingHotelsTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Trang {pendingHotelsPage + 1} / {pendingHotelsTotalPages} ({pendingHotelsTotalElements} khách sạn)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPendingHotelsPage(0)}
                        disabled={pendingHotelsPage === 0}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Đầu
                      </button>
                      <button
                        onClick={() => setPendingHotelsPage((prev) => Math.max(0, prev - 1))}
                        disabled={pendingHotelsPage === 0}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Trước
                      </button>
                      <button
                        onClick={() => setPendingHotelsPage((prev) => Math.min(pendingHotelsTotalPages - 1, prev + 1))}
                        disabled={pendingHotelsPage >= pendingHotelsTotalPages - 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Sau
                      </button>
                      <button
                        onClick={() => setPendingHotelsPage(pendingHotelsTotalPages - 1)}
                        disabled={pendingHotelsPage >= pendingHotelsTotalPages - 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Cuối
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'hotels' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Xem khách sạn</h2>
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
                    <span className="px-2 sm:px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                      {allHotelsTotalElements > 0 ? allHotelsTotalElements : allHotels.length} khách sạn
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
                ) : allHotels.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <div className="text-6xl mb-4">🏨</div>
                    <p className="text-gray-600 text-lg">Chưa có khách sạn nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {allHotels.map((hotel, index) => (
                      <motion.div
                        key={hotel.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all ${
                          hotel.status === 'pending' 
                            ? 'border-yellow-200 hover:border-yellow-400' 
                            : hotel.status === 'success'
                            ? 'border-green-200 hover:border-green-400'
                            : 'border-red-200 hover:border-red-400'
                        }`}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={hotel.images && hotel.images.length > 0 ? hotel.images[0].imageUrl : hotel.image || 'https://via.placeholder.com/400'}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
                            hotel.status === 'pending' 
                              ? 'bg-yellow-500' 
                              : hotel.status === 'success'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}>
                            {hotel.status === 'pending' ? 'Chờ duyệt' : hotel.status === 'success' ? 'Đã duyệt' : 'Từ chối'}
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
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setSelectedHotel(hotel)}
                              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center"
                              aria-label="View details"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleLockHotel(hotel.id, hotel.locked || false)}
                              disabled={processingHotelId === hotel.id}
                              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                                hotel.locked
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                              title={hotel.locked ? 'Mở khóa khách sạn' : 'Khóa khách sạn'}
                            >
                              {hotel.locked ? (
                                <>
                                  <Unlock className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="text-xs sm:text-sm hidden sm:inline">Mở khóa</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="text-xs sm:text-sm hidden sm:inline">Khóa</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {/* Pagination */}
                {allHotelsTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Trang {allHotelsPage + 1} / {allHotelsTotalPages} ({allHotelsTotalElements} khách sạn)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAllHotelsPage(0)}
                        disabled={allHotelsPage === 0}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Đầu
                      </button>
                      <button
                        onClick={() => setAllHotelsPage((prev) => Math.max(0, prev - 1))}
                        disabled={allHotelsPage === 0}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Trước
                      </button>
                      <button
                        onClick={() => setAllHotelsPage((prev) => Math.min(allHotelsTotalPages - 1, prev + 1))}
                        disabled={allHotelsPage >= allHotelsTotalPages - 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Sau
                      </button>
                      <button
                        onClick={() => setAllHotelsPage(allHotelsTotalPages - 1)}
                        disabled={allHotelsPage >= allHotelsTotalPages - 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Cuối
                      </button>
                    </div>
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
                      Chờ duyệt: <span className="font-bold text-yellow-600">{pendingTransactionsCount}</span>
                    </p>
                    <p className="text-gray-700 text-base">
                      Đã duyệt: <span className="font-bold text-green-600">{approvedTransactionsCount}</span>
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">Khách sạn chờ duyệt</h3>
                    <p className="text-gray-700 text-base font-semibold mb-2">
                      {pendingHotels.length} khách sạn đang chờ duyệt
                    </p>
                    {pendingHotels.length > 0 && (
                      <button
                        onClick={() => setActiveTab('pending-hotels')}
                        className="text-sm text-green-700 hover:text-green-800 font-semibold underline"
                      >
                        Xem chi tiết →
                      </button>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">Yêu cầu rút tiền</h3>
                    <p className="text-gray-700 text-base mb-1">
                      Chờ duyệt: <span className="font-bold text-yellow-600">{pendingWithdrawsCount}</span>
                    </p>
                    <p className="text-gray-700 text-base mb-1">
                      Đã duyệt: <span className="font-bold text-green-600">{resolvedWithdrawsCount}</span>
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
              <TransactionsTable
                transactions={transactions}
                loading={loading}
                error={error}
                searchQuery={transactionsSearchQuery}
                onSearchChange={setTransactionsSearchQuery}
                onClearSearch={() => setTransactionsSearchQuery('')}
                page={transactionsPage}
                totalPages={transactionsTotalPages}
                totalElements={transactionsTotalElements}
                onPageChange={setTransactionsPage}
              />
            )}

            {activeTab === 'withdraws' && (
              <WithdrawsTable
                withdraws={withdraws}
                loading={loading}
                error={error}
                searchQuery={withdrawsSearchQuery}
                onSearchChange={setWithdrawsSearchQuery}
                onApprove={handleApproveWithdraw}
                onReject={handleRejectWithdraw}
                page={withdrawsPage}
                totalPages={withdrawsTotalPages}
                totalElements={withdrawsTotalElements}
                onPageChange={setWithdrawsPage}
              />
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

            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Quản lý tài khoản</h2>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value as 'USER' | 'OWNER' | 'ALL')}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-xs sm:text-sm"
                    >
                      <option value="ALL">Tất cả</option>
                      <option value="USER">Khách hàng</option>
                      <option value="OWNER">Chủ khách sạn</option>
                    </select>
                    {userStats && (
                      <span className="px-2 sm:px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                        {userRoleFilter === 'ALL' ? userStats.totalUsers : 
                         userRoleFilter === 'USER' ? userStats.userCount : userStats.ownerCount} tài khoản
                      </span>
                    )}
                  </div>
                </div>

                {/* User Stats Cards */}
                {userStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                      <div className="text-xs sm:text-sm opacity-90 mb-2">Tổng tài khoản</div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold">{userStats.totalUsers}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                      <div className="text-xs sm:text-sm opacity-90 mb-2">Khách hàng</div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold">{userStats.userCount}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                      <div className="text-xs sm:text-sm opacity-90 mb-2">Chủ khách sạn</div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold">{userStats.ownerCount}</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                      <div className="text-xs sm:text-sm opacity-90 mb-2">Admin</div>
                      <div className="text-lg sm:text-xl md:text-2xl font-bold">{userStats.adminCount}</div>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Đang tải...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <div className="text-6xl mb-4">👤</div>
                    <p className="text-gray-600 text-lg">Không có tài khoản nào</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">ID</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Tên đăng nhập</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Email</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Số điện thoại</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Loại tài khoản</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Xác thực</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Trạng thái</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">#{user.id}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold">{user.username}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm break-words">{user.email}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{user.phone}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  user.role.name === 'ADMIN'
                                    ? 'bg-red-100 text-red-700'
                                    : user.role.name === 'OWNER'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {user.role.name === 'ADMIN'
                                  ? 'Admin'
                                  : user.role.name === 'OWNER'
                                  ? 'Chủ khách sạn'
                                  : 'Khách hàng'}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  user.verified
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {user.verified ? 'Đã xác thực' : 'Chưa xác thực'}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  user.locked
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {user.locked ? 'Đã khóa' : 'Hoạt động'}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              {user.role.name !== 'ADMIN' && (
                                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                  {user.role.name === 'USER' ? (
                                    <button
                                      onClick={() => handleUpdateUserRole(user.id, 'OWNER')}
                                      disabled={processingUserId === user.id}
                                      className="bg-purple-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-purple-700 transition whitespace-nowrap flex items-center justify-center gap-1 disabled:opacity-50"
                                      title="Chuyển thành Chủ khách sạn"
                                    >
                                      <UserCog className="w-3 h-3" />
                                      Chuyển Owner
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateUserRole(user.id, 'USER')}
                                      disabled={processingUserId === user.id}
                                      className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-blue-700 transition whitespace-nowrap flex items-center justify-center gap-1 disabled:opacity-50"
                                      title="Chuyển thành Khách hàng"
                                    >
                                      <UserCog className="w-3 h-3" />
                                      Chuyển User
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleToggleLockUser(user.id, user.locked)}
                                    disabled={processingUserId === user.id}
                                    className={`${
                                      user.locked
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    } text-white px-2 sm:px-3 py-1 rounded text-xs transition whitespace-nowrap flex items-center justify-center gap-1 disabled:opacity-50`}
                                    title={user.locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                  >
                                    {user.locked ? (
                                      <>
                                        <Unlock className="w-3 h-3" />
                                        Mở khóa
                                      </>
                                    ) : (
                                      <>
                                        <Lock className="w-3 h-3" />
                                        Khóa
                                      </>
                                    )}
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
                {/* Pagination */}
                {usersTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Trang {usersPage + 1} / {usersTotalPages} ({usersTotalElements} tài khoản)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUsersPage(0)}
                        disabled={usersPage === 0}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Đầu
                      </button>
                      <button
                        onClick={() => setUsersPage((prev) => Math.max(0, prev - 1))}
                        disabled={usersPage === 0}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Trước
                      </button>
                      <button
                        onClick={() => setUsersPage((prev) => Math.min(usersTotalPages - 1, prev + 1))}
                        disabled={usersPage >= usersTotalPages - 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Sau
                      </button>
                      <button
                        onClick={() => setUsersPage(usersTotalPages - 1)}
                        disabled={usersPage >= usersTotalPages - 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Cuối
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Quản lý bình luận</h2>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm bình luận, người dùng, khách sạn..."
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-xs sm:text-sm w-full sm:w-auto min-w-[200px]"
                    />
                    {reviewsTotalElements > 0 && (
                      <span className="px-2 sm:px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                        {reviewsTotalElements} bình luận
                      </span>
                    )}
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
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-gray-600 text-lg">Không có bình luận nào</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">ID</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Người dùng</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Khách sạn</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Đánh giá</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Bình luận</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Ngày tạo</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviews.map((review, index) => (
                            <motion.tr
                              key={review.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">#{review.id}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                <div className="font-semibold">{review.user?.username || 'N/A'}</div>
                                <div className="text-gray-500 text-xs">{review.user?.email || ''}</div>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                <div className="font-semibold">{review.hotel?.name || 'N/A'}</div>
                                <div className="text-gray-500 text-xs">{review.hotel?.address || ''}</div>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                      ⭐
                                    </span>
                                  ))}
                                  <span className="ml-1 text-xs text-gray-600">({review.rating})</span>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm max-w-xs break-words">
                                {review.comment || 'Không có bình luận'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  disabled={processingReviewId === review.id}
                                  className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-red-700 transition whitespace-nowrap flex items-center justify-center gap-1 disabled:opacity-50"
                                  title="Xóa bình luận"
                                >
                                  <X className="w-3 h-3" />
                                  Xóa
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {reviewsTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Trang {reviewsPage + 1} / {reviewsTotalPages} ({reviewsTotalElements} bình luận)
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setReviewsPage(0)}
                            disabled={reviewsPage === 0}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Đầu
                          </button>
                          <button
                            onClick={() => setReviewsPage((prev) => Math.max(0, prev - 1))}
                            disabled={reviewsPage === 0}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Trước
                          </button>
                          <button
                            onClick={() => setReviewsPage((prev) => Math.min(reviewsTotalPages - 1, prev + 1))}
                            disabled={reviewsPage >= reviewsTotalPages - 1}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Sau
                          </button>
                          <button
                            onClick={() => setReviewsPage(reviewsTotalPages - 1)}
                            disabled={reviewsPage >= reviewsTotalPages - 1}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Cuối
                          </button>
                        </div>
                      </div>
                    )}
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
      {/* Hotel Create/Edit Modal */}
      <AppModal
        isOpen={isHotelModalOpen}
        onClose={() => {
          setIsHotelModalOpen(false)
          setIsEditingHotel(false)
          setEditingHotelId(null)
          setSelectedHotel(null)
          setRemovedImageIds([])
        }}
        title={isEditingHotel ? 'Sửa khách sạn' : 'Tạo khách sạn mới'}
        size="lg"
      >
        <HotelForm
          onSubmit={handleSubmitHotel}
          defaultValues={
            isEditingHotel && selectedHotel
              ? {
                  name: selectedHotel.name,
                  address: selectedHotel.address,
                  phone: selectedHotel.phone,
                  description: selectedHotel.description || '',
                }
              : undefined
          }
          existingImages={
            isEditingHotel && selectedHotel && selectedHotel.images
              ? selectedHotel.images.filter(img => !removedImageIds.includes(img.id))
              : []
          }
          onRemoveExistingImage={(imageId: number) => {
            setRemovedImageIds(prev => [...prev, imageId])
          }}
          defaultRooms={
            isEditingHotel && selectedHotel && selectedHotel.rooms && selectedHotel.rooms.length > 0
              ? selectedHotel.rooms.map(room => ({
                  number: room.Number || room.number || '',
                  price: room.price || 0,
                  image: null, // Existing rooms don't have File objects
                  existingImageUrl: room.imageUrl || room.image, // Keep existing image URL
                }))
              : [{ number: '', price: 0, image: null }]
          }
          showRooms={true}
          submitLabel={isEditingHotel ? 'Cập nhật' : 'Tạo mới'}
          isSubmitting={isSubmittingHotel}
          onCancel={() => {
            setIsHotelModalOpen(false)
            setIsEditingHotel(false)
            setEditingHotelId(null)
            setSelectedHotel(null)
            setRemovedImageIds([])
          }}
        />
      </AppModal>

      {/* Hotel Detail Modal */}
      <AppModal
        isOpen={selectedHotel !== null && !isHotelModalOpen}
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={close}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
      />
    </div>
  )
}

export default AdminDashboard

