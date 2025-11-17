import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../services'
import type { AdminPercent, BookingTransaction, WithdrawRequest } from '../services/adminService'
import Header from '../components/Header'
import { useToast } from '../hooks/useToast'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'withdraws' | 'settings'>('overview')
  const [transactions, setTransactions] = useState<BookingTransaction[]>([])
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([])
  const [adminPercent, setAdminPercent] = useState<AdminPercent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showSuccess, showError, showWarning } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      if (activeTab === 'transactions') {
        const response = await adminService.getAllTransactions()
        if (response.data) setTransactions(response.data)
      } else if (activeTab === 'withdraws') {
        const response = await adminService.getAllWithdraws()
        if (response.data) setWithdraws(response.data)
      } else if (activeTab === 'settings') {
        const response = await adminService.getAdminPercent()
        if (response.data) setAdminPercent(response.data)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchData()
  }, [fetchData])


  const handleUpdatePercent = async () => {
    const input = document.getElementById('percent-input') as HTMLInputElement
    const percent = parseFloat(input.value) / 100 // Convert percentage to decimal
    if (percent < 0 || percent > 1) {
      showWarning('Phần trăm phải từ 0% đến 100%')
      return
    }
    try {
      await adminService.updateAdminPercent(percent)
      showSuccess('Cập nhật thành công!')
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể cập nhật')
    }
  }

  const handleApproveTransaction = async (id: number) => {
    try {
      await adminService.setTransaction(id)
      showSuccess('Duyệt giao dịch thành công!')
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể duyệt giao dịch')
    }
  }

  const handleApproveWithdraw = async (id: number) => {
    try {
      await adminService.approveWithdraw(id)
      showSuccess('Duyệt yêu cầu rút tiền thành công!')
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể duyệt yêu cầu')
    }
  }

  const handleRejectWithdraw = async (id: number) => {
    try {
      await adminService.rejectWithdraw(id)
      showSuccess('Đã từ chối yêu cầu rút tiền')
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể từ chối yêu cầu')
    }
  }

  const stats = [
    { label: 'Tổng giao dịch', value: transactions.length, icon: '💰', color: 'bg-blue-500' },
    { label: 'Đang chờ duyệt', value: transactions.filter(t => t.status === 'PENDING').length, icon: '⏳', color: 'bg-yellow-500' },
    { label: 'Đã duyệt', value: transactions.filter(t => t.status === 'APPROVED').length, icon: '✅', color: 'bg-green-500' },
    { label: 'Tổng doanh thu', value: '0 VND', icon: '💵', color: 'bg-purple-500' },
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
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Quản lý hệ thống và giao dịch</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`${stat.color} rounded-xl p-4 md:p-6 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl md:text-3xl">{stat.icon}</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                >
                  📊
                </motion.div>
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm md:text-base opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto">
              {[
              { id: 'overview', label: 'Tổng quan', icon: '📊' },
              { id: 'transactions', label: 'Giao dịch', icon: '💳' },
              { id: 'withdraws', label: 'Yêu cầu rút tiền', icon: '💸' },
              { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'transactions' | 'withdraws' | 'settings')}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm md:text-base">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4">Tổng quan hệ thống</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Giao dịch gần đây</h3>
                    <p className="text-gray-600 text-sm">
                      {transactions.length} giao dịch trong hệ thống
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Trạng thái hệ thống</h3>
                    <p className="text-green-600 font-semibold">✓ Hoạt động bình thường</p>
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
                <h2 className="text-xl md:text-2xl font-bold mb-4">Quản lý giao dịch</h2>
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Khách sạn</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Tổng tiền</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Admin</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Owner</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Thao tác</th>
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
                            <td className="px-4 py-3 text-sm">#{transaction.id}</td>
                            <td className="px-4 py-3 text-sm">
                              {transaction.bookingEntity?.hotel?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {Number(transaction.amount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-4 py-3 text-sm text-blue-600">
                              {Number(transaction.Admin_mount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-4 py-3 text-sm text-green-600">
                              {Number(transaction.User_mount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-4 py-3">
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
                            <td className="px-4 py-3">
                              {transaction.status === 'PENDING' && (
                                <button
                                  onClick={() => handleApproveTransaction(transaction.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
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
                <h2 className="text-xl md:text-2xl font-bold mb-4">Yêu cầu rút tiền</h2>
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Số tiền</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Ngân hàng</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Số TK</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Chủ TK</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Ngày tạo</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Thao tác</th>
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
                            <td className="px-4 py-3 text-sm">#{withdraw.id}</td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {Number(withdraw.amount).toLocaleString('vi-VN')} VND
                            </td>
                            <td className="px-4 py-3 text-sm">{withdraw.bankName}</td>
                            <td className="px-4 py-3 text-sm">{withdraw.accountNumber}</td>
                            <td className="px-4 py-3 text-sm">{withdraw.accountHolderName}</td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(withdraw.create_AT).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-4 py-3">
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
                            <td className="px-4 py-3">
                              {withdraw.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveWithdraw(withdraw.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleRejectWithdraw(withdraw.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition"
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

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4">Cài đặt hệ thống</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-semibold mb-2">
                    Phần trăm phí admin (%)
                  </label>
                  <div className="flex gap-4">
                    <input
                      id="percent-input"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Nhập phần trăm"
                      defaultValue={adminPercent ? (adminPercent.adminPercent * 100).toFixed(1) : ''}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={handleUpdatePercent}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Cập nhật
                    </button>
                  </div>
                  {adminPercent && (
                    <p className="text-sm text-gray-600 mt-2">
                      Giá trị hiện tại: {(adminPercent.adminPercent * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

