import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import WithdrawForm, { type WithdrawFormData } from '../components/WithdrawForm'
import AppModal from '../components/AppModal'
import FormattedNumberInput from '../components/FormattedNumberInput'
import { ownerService, type PageResponse, type WalletTransaction } from '../services/ownerService'
import { useToast } from '../hooks/useToast'
import type { WithdrawRequest } from '../services/ownerService'
import api from '../services/api'

const Wallet = () => {
  const { showSuccess, showError } = useToast()
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([])
  const [deposits, setDeposits] = useState<WalletTransaction[]>([])
  const [activeTab, setActiveTab] = useState<'withdraw' | 'deposit'>('withdraw')
  const [loading, setLoading] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)
  const [submittingDeposit, setSubmittingDeposit] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  useEffect(() => {
    fetchWalletData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchWalletBalance(), fetchWithdraws(0), fetchDeposits(0)])
    } catch (err) {
      console.error('Error fetching wallet data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchWalletBalance = async () => {
    try {
      const response = await ownerService.getWalletBalance()
      if (response.data) {
        setWalletBalance(Number(response.data.balance))
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải số dư ví')
    }
  }

  const fetchWithdraws = async (page: number = 0) => {
    try {
      const response = await ownerService.getMyWithdraws(page, 8)
      if (response.data) {
        // Check if response is paginated
        if ('content' in response.data) {
          const pageData = response.data as PageResponse<WithdrawRequest>
          setWithdraws(pageData.content)
          setTotalPages(pageData.totalPages)
          setCurrentPage(pageData.currentPage)
          setHasNext(pageData.hasNext)
          setHasPrevious(pageData.hasPrevious)
        } else {
          // Fallback for non-paginated response
          const withdrawsList = response.data as WithdrawRequest[]
          setWithdraws(withdrawsList)
          setTotalPages(1)
          setCurrentPage(0)
          setHasNext(false)
          setHasPrevious(false)
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải lịch sử rút tiền')
    }
  }

  const fetchDeposits = async (page: number = 0) => {
    try {
      const response = await ownerService.getWalletTransactions(page, 8, 'DEPOSIT')
      if (response.data) {
        // Check if response is paginated
        if ('content' in response.data) {
          const pageData = response.data as PageResponse<WalletTransaction>
          setDeposits(pageData.content)
          // Always update pagination state for deposits
          setTotalPages(pageData.totalPages)
          setCurrentPage(pageData.currentPage)
          setHasNext(pageData.hasNext)
          setHasPrevious(pageData.hasPrevious)
        } else {
          // Fallback for non-paginated response
          const depositsList = response.data as WalletTransaction[]
          setDeposits(depositsList)
          setTotalPages(1)
          setCurrentPage(0)
          setHasNext(false)
          setHasPrevious(false)
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải lịch sử nạp tiền')
    }
  }

  const handlePageChange = async (newPage: number) => {
    if (activeTab === 'withdraw') {
      await fetchWithdraws(newPage)
    } else {
      await fetchDeposits(newPage)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTabChange = (tab: 'withdraw' | 'deposit') => {
    setActiveTab(tab)
    setCurrentPage(0)
    if (tab === 'withdraw') {
      fetchWithdraws(0)
    } else {
      fetchDeposits(0)
    }
  }

  const handleWithdraw = async (data: WithdrawFormData) => {
    try {
      setSubmittingWithdraw(true)
      const response = await ownerService.createWithdraw({
        amount: data.amount,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
      })
      if (response.data) {
        showSuccess('Yêu cầu rút tiền đã được gửi thành công!')
        setShowWithdrawModal(false)
        await fetchWalletBalance()
        await fetchWithdraws(0)
        await fetchDeposits(0)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tạo yêu cầu rút tiền')
    } finally {
      setSubmittingWithdraw(false)
    }
  }

  const handleDeposit = async () => {
    if (depositAmount <= 0) {
      showError('Số tiền nạp phải lớn hơn 0')
      return
    }
    if (depositAmount < 10000) {
      showError('Số tiền nạp tối thiểu là 10,000 VND')
      return
    }

    try {
      setSubmittingDeposit(true)
      const userId = localStorage.getItem('userId')
      if (!userId) {
        showError('Không tìm thấy thông tin người dùng')
        return
      }

      // Tạo payment URL qua VNPay
      const response = await api.post<{ url: string }>('/vnpay/create', null, {
        params: {
          amount: depositAmount * 100, // VNPay tính bằng xu
          orderInfo: `Nap tien vao vi|userId:${userId}`,
          orderType: 'deposit',
        },
      })

      if (response.data?.url) {
        // Redirect đến VNPay
        window.location.href = response.data.url
      } else {
        showError('Không thể tạo link thanh toán')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể nạp tiền')
    } finally {
      setSubmittingDeposit(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'Đã duyệt'
      case 'rejected':
        return 'Đã từ chối'
      default:
        return 'Chờ duyệt'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Ví điện tử</h1>
          <p className="text-gray-600">Quản lý số dư và giao dịch của bạn</p>
        </motion.div>

        {/* Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl p-6 md:p-8 mb-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">Số dư ví</h2>
              <div className="text-3xl md:text-4xl font-bold">
                {loading ? (
                  <span className="animate-pulse">Đang tải...</span>
                ) : walletBalance !== null ? (
                  `${Number(walletBalance).toLocaleString('vi-VN')} VND`
                ) : (
                  '0 VND'
                )}
              </div>
            </div>
            <div className="text-6xl">💰</div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex-1 bg-white text-blue-600 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              + Nạp tiền
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={!walletBalance || walletBalance <= 0}
              className="flex-1 bg-white text-blue-600 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rút tiền
            </button>
          </div>
        </motion.div>

        {/* Transaction History Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => handleTabChange('withdraw')}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === 'withdraw'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Lịch sử rút tiền
            </button>
            <button
              onClick={() => handleTabChange('deposit')}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === 'deposit'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Lịch sử nạp tiền
            </button>
          </div>

          {activeTab === 'withdraw' ? (
            <>
          <h2 className="text-xl font-bold mb-4">Lịch sử rút tiền</h2>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : withdraws.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Chưa có lịch sử rút tiền</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Số tiền</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ngân hàng</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Số tài khoản</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Chủ tài khoản</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {withdraws.map((withdraw) => (
                    <tr key={withdraw.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">#{withdraw.id}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {Number(withdraw.amount).toLocaleString('vi-VN')} VND
                      </td>
                      <td className="px-4 py-3 text-sm">{withdraw.bankName}</td>
                      <td className="px-4 py-3 text-sm">{withdraw.accountNumber}</td>
                      <td className="px-4 py-3 text-sm">{withdraw.accountHolderName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            withdraw.status
                          )}`}
                        >
                          {getStatusText(withdraw.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {withdraw.create_AT
                          ? new Date(withdraw.create_AT).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

              {/* Pagination for Withdraws */}
              {!loading && totalPages > 1 && activeTab === 'withdraw' && (
                <div className="flex justify-center items-center gap-2 mt-6">
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
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Lịch sử nạp tiền</h2>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Đang tải...</p>
                </div>
              ) : deposits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Chưa có lịch sử nạp tiền</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Số tiền</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Mô tả</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Ngày tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deposits.map((deposit) => (
                        <tr key={deposit.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">#{deposit.id}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            +{(() => {
                              const amount = Number(deposit.amount)
                              // Kiểm tra nếu amount rất lớn (> 100 triệu), có thể là dữ liệu cũ tính bằng xu
                              // Chia 100 để chuyển từ xu sang VND
                              // Nếu amount <= 100 triệu, có thể là dữ liệu mới tính bằng VND, không chia
                              // Ngưỡng 100 triệu để tránh chia nhầm các giao dịch lớn hợp lệ
                              const displayAmount = amount > 100000000 ? amount / 100 : amount
                              return displayAmount.toLocaleString('vi-VN')
                            })()} VND
                          </td>
                          <td className="px-4 py-3 text-sm">{deposit.description || 'Nạp tiền vào ví'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {deposit.createdAt
                              ? new Date(deposit.createdAt).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Deposits */}
              {!loading && totalPages > 1 && activeTab === 'deposit' && (
                <div className="flex justify-center items-center gap-2 mt-6">
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
            </>
          )}
        </motion.div>

        {/* Deposit Modal */}
        <AppModal
          isOpen={showDepositModal}
          onClose={() => {
            setShowDepositModal(false)
            setDepositAmount(0)
          }}
          title="Nạp tiền vào ví"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Số tiền nạp (VND) <span className="text-red-500">*</span>
              </label>
              <FormattedNumberInput
                value={depositAmount}
                onChange={setDepositAmount}
                placeholder="Nhập số tiền"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={10000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Số tiền nạp tối thiểu: 10,000 VND
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowDepositModal(false)
                  setDepositAmount(0)
                }}
                disabled={submittingDeposit}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeposit}
                disabled={submittingDeposit || depositAmount < 10000}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingDeposit ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
              </button>
            </div>
          </div>
        </AppModal>

        {/* Withdraw Modal */}
        <AppModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          title="Rút tiền từ ví"
        >
          <WithdrawForm
            onSubmit={handleWithdraw}
            onCancel={() => setShowWithdrawModal(false)}
            maxAmount={walletBalance || undefined}
            isSubmitting={submittingWithdraw}
          />
        </AppModal>
      </div>
    </div>
  )
}

export default Wallet

