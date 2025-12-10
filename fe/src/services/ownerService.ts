import api from './api'
import type { Hotel, Room } from './hotelService'

export interface CreateHotelRoom {
  number: string
  price: number
  imageUrl?: string // URL from Cloudinary
}

export interface CreateHotelData {
  name: string
  address: string
  phone: string
  description: string
  imageUrl?: string // URL from Cloudinary (deprecated, use imageUrls)
  imageUrls?: string[] // List of URLs from Cloudinary
  rooms: CreateHotelRoom[]
  latitude?: number
  longitude?: number
}

export interface UpdateHotelData {
  name?: string
  address?: string
  phone?: string
  description?: string
  imageUrl?: string // URL from Cloudinary (deprecated, use imageUrls)
  imageUrls?: string[] // List of URLs from Cloudinary
  latitude?: number
  longitude?: number
}

export interface UpdateRoomData {
  price?: number
  status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE'
  type?: 'STANDARD' | 'DELUXE' | 'SUITE' | 'SUPERIOR' | 'EXECUTIVE' | 'FAMILY' | 'STUDIO'
  discount_percent?: number
  capacity?: number
}

export interface ApiResponse<T> {
  message: string
  data: T
  status: string
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

export const ownerService = {
  // Hotel Management
  createHotel: async (hotelData: CreateHotelData, hotelImageUrls?: string[], roomsImageUrls?: string[]) => {
    // If using Cloudinary URLs, send as JSON string in FormData
    if (hotelImageUrls && hotelImageUrls.length > 0 && roomsImageUrls) {
      const dataWithUrls = {
        ...hotelData,
        imageUrls: hotelImageUrls, // Gửi danh sách nhiều ảnh
        rooms: hotelData.rooms.map((room, index) => ({
          ...room,
          imageUrl: roomsImageUrls[index],
        })),
      }
      const formData = new FormData()
      // Send JSON as Blob with application/json content type
      const jsonBlob = new Blob([JSON.stringify(dataWithUrls)], { type: 'application/json' })
      formData.append('hotel', jsonBlob, 'hotel.json')
      const response = await api.post<ApiResponse<Hotel>>('/hotels', formData)
      return response.data
    }
    // Fallback to file upload (for backward compatibility)
    const formData = new FormData()
    const jsonBlob = new Blob([JSON.stringify(hotelData)], { type: 'application/json' })
    formData.append('hotel', jsonBlob, 'hotel.json')
    const response = await api.post<ApiResponse<Hotel>>('/hotels', formData)
    return response.data
  },
  deleteHotel: async (id: number) => {
    const response = await api.delete<ApiResponse<Hotel>>(`/hotels/${id}`)
    return response.data
  },

  updateHotel: async (id: number, hotelData: UpdateHotelData, hotelImageUrls?: string[]) => {
    const formData = new FormData()
    // Include imageUrls in the DTO if provided
    const dataWithUrls = hotelImageUrls && hotelImageUrls.length > 0 
      ? { ...hotelData, imageUrls: hotelImageUrls } 
      : hotelData
    // Send JSON as string (backend will parse it)
    formData.append('hotel', JSON.stringify(dataWithUrls))
    const response = await api.put<ApiResponse<Hotel>>(`/hotels/${id}`, formData)
    return response.data
  },

  setAllDiscountPercent: async (hotelId: number, discountPercent: number) => {
    const response = await api.put<ApiResponse<Hotel>>(`/hotels/${hotelId}/discount`, null, {
      params: { discount_percent: discountPercent },
    })
    return response.data
  },

  // Room Management
  updateRoomImage: async (roomId: number, imageUrl: string) => {
    const response = await api.put<ApiResponse<Room>>(`/rooms/${roomId}/image`, null, {
      params: { imageUrl },
    })
    return response.data
  },

  updateRoomPrice: async (roomId: number, price: number) => {
    const response = await api.put<ApiResponse<Room>>(`/rooms/${roomId}/price`, null, {
      params: { price },
    })
    return response.data
  },

  updateRoomStatus: async (roomId: number, status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE') => {
    const response = await api.put<ApiResponse<Room>>(`/rooms/${roomId}/status`, null, {
      params: { status },
    })
    return response.data
  },

  updateRoomType: async (roomId: number, type: string) => {
    const response = await api.put<ApiResponse<Room>>(`/rooms/${roomId}/type`, null, {
      params: { type },
    })
    return response.data
  },

  updateRoomDiscount: async (roomId: number, discountPercent: number) => {
    const response = await api.put<ApiResponse<Room>>(`/rooms/${roomId}/discount`, null, {
      params: { discount_percent: discountPercent },
    })
    return response.data
  },

  updateRoomCapacity: async (roomId: number, capacity: number) => {
    const response = await api.put<ApiResponse<Room>>(`/rooms/${roomId}/capacity`, null, {
      params: { capacity },
    })
    return response.data
  },

  deleteRoom: async (roomId: number) => {
    const response = await api.delete<ApiResponse<Room>>(`/rooms/${roomId}`)
    return response.data
  },

  // Get my hotels
  getMyHotels: async () => {
    const response = await api.get<ApiResponse<Hotel[]>>('/hotels/owner/my-hotels')
    return response.data
  },

  getMyHotelsPaginated: async (page?: number, size?: number) => {
    const params: Record<string, number> = {}
    if (page !== undefined) params.page = page
    if (size !== undefined) params.size = size
    const response = await api.get<ApiResponse<PageResponse<Hotel>>>('/hotels/owner/my-hotels/paginated', { params })
    return response.data
  },

  // Transaction View
  getMyTransactions: async () => {
    const response = await api.get<ApiResponse<BookingTransaction[]>>('/admin/transactions/owner/my-transactions')
    return response.data
  },

  getTransaction: async (id: number) => {
    const response = await api.get<ApiResponse<unknown>>(`/admin/transactions/${id}`)
    return response.data
  },

  // Withdraw Management
  createWithdraw: async (data: {
    amount: number
    accountNumber: string
    bankName: string
    accountHolderName: string
  }) => {
    const response = await api.post<ApiResponse<WithdrawRequest>>('/withdraws', data)
    return response.data
  },

  getMyWithdraws: async (page?: number, size?: number) => {
    const params: { page?: number; size?: number } = {}
    if (page !== undefined) params.page = page
    if (size !== undefined) params.size = size
    const response = await api.get<ApiResponse<WithdrawRequest[] | PageResponse<WithdrawRequest>>>('/withdraws/my-withdraws', { params })
    return response.data
  },

  // Revenue Management
  getRevenue: async () => {
    const response = await api.get<ApiResponse<RevenueSummary>>('/admin/transactions/revenue/owner')
    return response.data
  },

  // Wallet Management
  getWalletBalance: async () => {
    const response = await api.get<ApiResponse<WalletBalance>>('/wallet/balance')
    return response.data
  },

  getWalletTransactions: async (page?: number, size?: number, type?: 'DEPOSIT' | 'PAYMENT') => {
    const params: { page?: number; size?: number; type?: string } = {}
    if (page !== undefined) params.page = page
    if (size !== undefined) params.size = size
    if (type) params.type = type
    const response = await api.get<ApiResponse<WalletTransaction[] | PageResponse<WalletTransaction>>>('/wallet/transactions', { params })
    return response.data
  },
}

export interface WalletBalance {
  balance: number
  userId: number
  username: string
}

export interface WalletTransaction {
  id: number
  type: 'DEPOSIT' | 'PAYMENT'
  amount: number
  description: string
  createdAt: string
}

export interface BookingTransaction {
  id: number
  amount: number
  User_mount: number
  Admin_mount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  bookingEntity?: {
    id: number
    status?: string  // Trạng thái thanh toán của booking: PAID, PENDING, FAILED, REFUNDED
    totalPrice: number
    checkInDate: string
    checkOutDate: string
    bookingDate?: string
    hotel?: {
      id: number
      name: string
      address?: string
    }
    user?: {
      id: number
      username: string
      email?: string
      phone?: string
    } | number  // Có thể là object hoặc chỉ là id
    rooms?: {
      id: number
      Number?: string
      number?: string
      type: string
      price: number
      capacity: number
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

