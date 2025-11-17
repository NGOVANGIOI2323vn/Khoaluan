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

export const bookingService = {
  createBooking: async (roomId: number, data: CreateBookingData) => {
    const response = await api.post<ApiResponse<Booking>>(`/bookings/rooms/${roomId}`, data)
    return response.data
  },

  payBooking: async (bookingId: number) => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${bookingId}/pay`)
    return response.data
  },

  getBookingHistory: async () => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings')
    return response.data
  },

  getBookingsByRoom: async (roomId: number) => {
    const response = await api.get<ApiResponse<Booking[]>>(`/bookings/rooms/${roomId}`)
    return response.data
  },
}

