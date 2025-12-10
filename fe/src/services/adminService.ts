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

export interface PendingHotelRoom {
  id: number
  Number?: string
  number?: string
  type?: string
  price: number
  capacity?: number
  image?: string
  imageUrl?: string
  discountPercent?: number
  status?: string
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
  rooms?: PendingHotelRoom[]
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
  getAllTransactions: async (search?: string, page?: number, size?: number) => {
    const params: Record<string, string | number> = {}
    if (search) params.search = search
    if (page !== undefined) params.page = page
    if (size !== undefined) params.size = size
    const response = await api.get<ApiResponse<BookingTransaction[] | PageResponse<BookingTransaction>>>('/admin/transactions', { params })
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
  getAllWithdraws: async (search?: string, page?: number, size?: number) => {
    const params: Record<string, string | number> = {}
    if (search) params.search = search
    if (page !== undefined) params.page = page
    if (size !== undefined) params.size = size
    const response = await api.get<ApiResponse<WithdrawRequest[] | PageResponse<WithdrawRequest>>>('/withdraws', { params })
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

  getPendingHotelsPaginated: async (search?: string, page?: number, size?: number) => {
    const params: Record<string, string | number> = {}
    if (search) params.search = search
    if (page !== undefined) params.page = page
    if (size !== undefined) params.size = size
    const response = await api.get<ApiResponse<PageResponse<PendingHotel>>>('/admin/hotels/pending/paginated', { params })
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

  getAllHotelsPaginated: async (search?: string, page?: number, size?: number) => {
    const params: Record<string, string | number> = {}
    if (search) params.search = search
    if (page !== undefined) params.page = page
    if (size !== undefined) params.size = size
    const response = await api.get<ApiResponse<PageResponse<PendingHotel>>>('/admin/hotels/paginated', { params })
    return response.data
  },

  getHotelById: async (id: number) => {
    const response = await api.get<ApiResponse<PendingHotel>>(`/admin/hotels/${id}`)
    return response.data
  },

  createHotel: async (hotelData: CreateHotelData, hotelImageUrls?: string[], roomsImageUrls?: string[], ownerId?: number) => {
    // If using Cloudinary URLs, send as JSON string in FormData
    if (hotelImageUrls && hotelImageUrls.length > 0 && roomsImageUrls) {
      const dataWithUrls = {
        ...hotelData,
        imageUrls: hotelImageUrls,
        rooms: hotelData.rooms.map((room, index) => ({
          ...room,
          imageUrl: roomsImageUrls[index],
        })),
      }
      const formData = new FormData()
      const jsonBlob = new Blob([JSON.stringify(dataWithUrls)], { type: 'application/json' })
      formData.append('hotel', jsonBlob, 'hotel.json')
      if (ownerId) {
        formData.append('ownerId', ownerId.toString())
      }
      const response = await api.post<ApiResponse<PendingHotel>>('/admin/hotels', formData)
      return response.data
    }
    // Fallback to file upload (for backward compatibility)
    const formData = new FormData()
    const jsonBlob = new Blob([JSON.stringify(hotelData)], { type: 'application/json' })
    formData.append('hotel', jsonBlob, 'hotel.json')
    if (ownerId) {
      formData.append('ownerId', ownerId.toString())
    }
    const response = await api.post<ApiResponse<PendingHotel>>('/admin/hotels', formData)
    return response.data
  },

  updateHotel: async (id: number, hotelData: UpdateHotelData, hotelImageUrls?: string[], ownerId?: number) => {
    const formData = new FormData()
    const dataWithUrls = hotelImageUrls && hotelImageUrls.length > 0 
      ? { ...hotelData, imageUrls: hotelImageUrls } 
      : hotelData
    formData.append('hotel', JSON.stringify(dataWithUrls))
    if (ownerId) {
      formData.append('ownerId', ownerId.toString())
    }
    const response = await api.put<ApiResponse<PendingHotel>>(`/admin/hotels/${id}`, formData)
    return response.data
  },

  deleteHotel: async (id: number) => {
    const response = await api.delete<ApiResponse<PendingHotel>>(`/admin/hotels/${id}`)
    return response.data
  },

  // Revenue Management
  getRevenue: async () => {
    const response = await api.get<ApiResponse<RevenueSummary>>('/admin/transactions/revenue/admin')
    return response.data
  },

  // User Management
  getAllUsers: async (role?: 'USER' | 'OWNER') => {
    const params = role ? { role } : {}
    const response = await api.get<ApiResponse<User[]>>('/admin/users', { params })
    return response.data
  },

  getAllUsersPaginated: async (role?: 'USER' | 'OWNER', page?: number, size?: number) => {
    const params: Record<string, string | number> = {}
    if (role) params.role = role
    if (page !== undefined) params.page = page
    if (size !== undefined) params.size = size
    const response = await api.get<ApiResponse<PageResponse<User>>>('/admin/users/paginated', { params })
    return response.data
  },

  getUserById: async (id: number) => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`)
    return response.data
  },

  updateUserRole: async (id: number, role: 'USER' | 'OWNER') => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/role`, null, {
      params: { role },
    })
    return response.data
  },

  toggleLockUser: async (id: number) => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/lock`)
    return response.data
  },

  getUserStats: async () => {
    const response = await api.get<ApiResponse<UserStats>>('/admin/users/stats')
    return response.data
  },

  // Review Management
  getAllReviews: async (search?: string, page?: number, size?: number) => {
    const params: Record<string, string | number> = {}
    if (search) params.search = search
    if (page !== undefined) params.page = page
    if (size !== undefined) params.size = size
    const response = await api.get<ApiResponse<PageResponse<HotelReview>>>('/admin/reviews', { params })
    return response.data
  },

  deleteReview: async (id: number) => {
    const response = await api.delete<ApiResponse<string>>(`/admin/reviews/${id}`)
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

export interface User {
  id: number
  username: string
  email: string
  phone: string
  verified: boolean
  locked: boolean
  role: {
    id: number
    name: 'USER' | 'OWNER' | 'ADMIN'
  }
  wallet?: {
    id: number
    balance: number
  }
}

export interface UserStats {
  totalUsers: number
  userCount: number
  ownerCount: number
  adminCount: number
}

export interface HotelReview {
  id: number
  rating: number
  comment: string
  createdAt: string
  user?: {
    id: number
    username: string
    email: string
  }
  hotel?: {
    id: number
    name: string
    address: string
  }
}

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface CreateHotelRoom {
  number: string
  price: number
  imageUrl?: string
}

export interface CreateHotelData {
  name: string
  address: string
  phone: string
  description: string
  imageUrl?: string
  imageUrls?: string[]
  rooms: CreateHotelRoom[]
  latitude?: number
  longitude?: number
}

export interface UpdateHotelData {
  name?: string
  address?: string
  phone?: string
  description?: string
  imageUrl?: string
  imageUrls?: string[]
  latitude?: number
  longitude?: number
}

