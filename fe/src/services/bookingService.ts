import api from './api'

export interface Booking {
  id: number
  status: string
  bookingDate: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  qrUrl?: string
  user?: {
    id: number
    username: string
    email: string
    phone?: string
  }
  hotel?: {
    id: number
    name: string
    address: string
  }
  rooms?: {
    id: number
    Number?: string
    number?: string  // Fallback nếu Jackson serialize thành lowercase
    type: string
    price: number
    capacity: number
    discountPercent?: number
  }
}

export interface CreateBookingData {
  checkInDate: string
  checkOutDate: string
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

export const bookingService = {
  createBooking: async (roomId: number, data: CreateBookingData) => {
    const response = await api.post<ApiResponse<Booking>>(`/bookings/rooms/${roomId}`, data)
    return response.data
  },

  payBooking: async (bookingId: number) => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${bookingId}/pay`)
    return response.data
  },

  getBookingHistory: async (page?: number, size?: number) => {
    // Luôn gửi page và size để đảm bảo API trả về phân trang
    const params: { page: number; size: number } = {
      page: page !== undefined ? page : 0,
      size: size !== undefined ? size : 8
    }
    const response = await api.get<ApiResponse<Booking[] | PageResponse<Booking>>>('/bookings', { params })
    return response.data
  },

  getBookingsByRoom: async (roomId: number) => {
    const response = await api.get<ApiResponse<Booking[]>>(`/bookings/rooms/${roomId}`)
    return response.data
  },

  getBookingById: async (bookingId: number) => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${bookingId}`)
    return response.data
  },
}

