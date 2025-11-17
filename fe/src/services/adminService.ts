import api from './api'

export interface AdminPercent {
  id: number
  adminPercent: number
}

export interface BookingTransaction {
  id: number
  amount: number
  User_mount: number
  Admin_mount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  bookingEntity?: {
    id: number
    totalPrice: number
    checkInDate: string
    checkOutDate: string
    hotel?: {
      id: number
      name: string
    }
    user?: {
      id: number
      username: string
    }
  }
}

export interface WithdrawRequest {
  id: number
  amount: number
  accountNumber: string
  bankName: string
  accountHolderName: string
  status: 'pending' | 'resolved' | 'refuse'
  create_AT: string
  update_AT?: string
}

export interface ApiResponse<T> {
  message: string
  data: T
  status: string
}

export const adminService = {
  // Admin Percent Management
  createAdminPercent: async (percent: number) => {
    const response = await api.post<ApiResponse<AdminPercent>>('/admin/percent', null, {
      params: { percent },
    })
    return response.data
  },

  updateAdminPercent: async (percent: number) => {
    const response = await api.put<ApiResponse<AdminPercent>>('/admin/percent', null, {
      params: { percent },
    })
    return response.data
  },

  getAdminPercent: async () => {
    const response = await api.get<ApiResponse<AdminPercent>>('/admin/percent')
    return response.data
  },

  // Transaction Management
  getAllTransactions: async () => {
    const response = await api.get<ApiResponse<BookingTransaction[]>>('/admin/transactions')
    return response.data
  },

  getTransaction: async (id: number) => {
    const response = await api.get<ApiResponse<BookingTransaction>>(`/admin/transactions/${id}`)
    return response.data
  },

  setTransaction: async (id: number) => {
    const response = await api.put<ApiResponse<BookingTransaction>>(`/admin/transactions/${id}/approve`)
    return response.data
  },

  // Withdraw Management
  getAllWithdraws: async () => {
    const response = await api.get<ApiResponse<WithdrawRequest[]>>('/withdraws')
    return response.data
  },

  approveWithdraw: async (id: number) => {
    const response = await api.put<ApiResponse<WithdrawRequest>>(`/withdraws/${id}/approve`)
    return response.data
  },

  rejectWithdraw: async (id: number) => {
    const response = await api.put<ApiResponse<WithdrawRequest>>(`/withdraws/${id}/reject`)
    return response.data
  },
}

