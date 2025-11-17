import api from './api'
import type { Hotel, Room } from './hotelService'

export interface CreateHotelRoom {
  number: string
  price: number
}

export interface CreateHotelData {
  name: string
  address: string
  phone: string
  description: string
  rooms: CreateHotelRoom[]
}

export interface UpdateHotelData {
  name?: string
  address?: string
  phone?: string
  description?: string
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

export const ownerService = {
  // Hotel Management
  createHotel: async (hotelData: CreateHotelData, hotelImage: File, roomsImages: File[]) => {
    const formData = new FormData()
    formData.append('hotel', JSON.stringify(hotelData))
    formData.append('hotelImage', hotelImage)
    roomsImages.forEach((image) => {
      formData.append('roomsImage', image)
    })
    const response = await api.post<ApiResponse<Hotel>>('/hotels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  deleteHotel: async (id: number) => {
    const response = await api.delete<ApiResponse<Hotel>>(`/hotels/${id}`)
    return response.data
  },

  updateHotel: async (id: number, hotelData: UpdateHotelData, hotelImage?: File) => {
    const formData = new FormData()
    formData.append('hotel', JSON.stringify(hotelData))
    if (hotelImage) {
      formData.append('hotelImage', hotelImage)
    }
    const response = await api.put<ApiResponse<Hotel>>(`/hotels/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  setAllDiscountPercent: async (hotelId: number, discountPercent: number) => {
    const response = await api.put<ApiResponse<Hotel>>(`/hotels/${hotelId}/discount`, null, {
      params: { discount_percent: discountPercent },
    })
    return response.data
  },

  // Room Management
  updateRoomImage: async (roomId: number, image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    const response = await api.put<ApiResponse<Room>>(`/rooms/${roomId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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

  // Get my hotels
  getMyHotels: async () => {
    const response = await api.get<ApiResponse<Hotel[]>>('/hotels/owner/my-hotels')
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

  getMyWithdraws: async () => {
    const response = await api.get<ApiResponse<WithdrawRequest[]>>('/withdraws/my-withdraws')
    return response.data
  },
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

