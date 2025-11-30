import api from './api'

export interface AdminPercent {
  id: number
  adminPercent: number
}

export interface BookingTransaction {
  id: number
  amount: number
  User_mount?: number
  Admin_mount?: number
  user_mount?: number  // BE trả về snake_case
  admin_mount?: number  // BE trả về snake_case
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

export interface PendingHotel {
  id: number
  name: string
  address: string
  city?: string
  phone: string
  description?: string
  image?: string
  images?: Array<{ id: number; imageUrl: string }>
  rating: number
  status: 'pending' | 'success' | 'fail'
  owner?: {
    id: number
    username: string
    email: string
  }
  createdAt?: string
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

  // Hotel Management
  getPendingHotels: async (search?: string) => {
    const params = search ? { search } : {}
    const response = await api.get<ApiResponse<PendingHotel[]>>('/admin/hotels/pending', { params })
    return response.data
  },

  approveHotel: async (id: number) => {
    const response = await api.put<ApiResponse<PendingHotel>>(`/admin/hotels/${id}/approve`)
    return response.data
  },

  rejectHotel: async (id: number) => {
    const response = await api.put<ApiResponse<PendingHotel>>(`/admin/hotels/${id}/reject`)
    return response.data
  },

  getAllHotels: async (search?: string) => {
    const params = search ? { search } : {}
    const response = await api.get<ApiResponse<PendingHotel[]>>('/admin/hotels', { params })
    return response.data
  },

  // Revenue Management
  getRevenue: async () => {
    const response = await api.get<ApiResponse<RevenueSummary>>('/admin/transactions/revenue/admin')
    return response.data
  },
}

export interface HotelRevenue {
  hotelId: number
  hotelName: string
  totalRevenue: number
  pendingRevenue: number
  totalBookings: number
  approvedBookings: number
}

export interface RevenueSummary {
  totalRevenue: number
  pendingRevenue: number
  adminRevenue: number
  ownerRevenue: number
  totalTransactions: number
  approvedTransactions: number
  hotelRevenues: HotelRevenue[]
}

