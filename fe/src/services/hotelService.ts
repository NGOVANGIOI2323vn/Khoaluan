import api from './api'

export interface Hotel {
  id: number
  name: string
  address: string
  city?: string
  phone: string
  description: string
  image: string
  rating: number
  status: string
  minPrice?: number // Giá thấp nhất của khách sạn
  rooms?: Room[]
  owner?: {
    id: number
    username: string
    email: string
  }
}

export interface Room {
  id: number
  Number: string
  type: string
  status: string
  price: number
  capacity: number
  image: string
  discountPercent: number
  hotel?: Hotel
}

export interface HotelReview {
  id: number
  rating: number
  comment: string
  createdAt?: string
  user?: {
    id: number
    username: string
    email: string
  }
  hotel?: Hotel
}

export interface ApiResponse<T> {
  message: string
  data: T
  status: string
}

export interface HotelPageResponse {
  content: Hotel[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface HotelFilterParams {
  sortBy?: string
  page?: number
  size?: number
  minRating?: number
  maxRating?: number
  minPrice?: number
  maxPrice?: number
  search?: string
  city?: string
  checkIn?: string // Format: YYYY-MM-DD
  checkOut?: string // Format: YYYY-MM-DD
  numberOfRooms?: number
}

export const hotelService = {
  getAllHotels: async (filters?: HotelFilterParams) => {
    const params: Record<string, string> = {}
    if (filters) {
      if (filters.sortBy) params.sortBy = filters.sortBy
      if (filters.page !== undefined) params.page = filters.page.toString()
      if (filters.size !== undefined) params.size = filters.size.toString()
      if (filters.minRating !== undefined) params.minRating = filters.minRating.toString()
      if (filters.maxRating !== undefined) params.maxRating = filters.maxRating.toString()
      if (filters.minPrice !== undefined) params.minPrice = filters.minPrice.toString()
      if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice.toString()
      if (filters.search) params.search = filters.search
      if (filters.city) params.city = filters.city
      if (filters.checkIn) params.checkIn = filters.checkIn
      if (filters.checkOut) params.checkOut = filters.checkOut
      if (filters.numberOfRooms !== undefined) params.numberOfRooms = filters.numberOfRooms.toString()
    }
    
    const response = await api.get<ApiResponse<Hotel[] | HotelPageResponse>>('/hotels', { params })
    return response.data
  },

  getHotelById: async (id: number) => {
    const response = await api.get<ApiResponse<Hotel>>(`/hotels/${id}`)
    return response.data
  },

  getRoomsByHotelId: async (hotelId: number) => {
    const response = await api.get<ApiResponse<Room[]>>(`/hotels/${hotelId}/rooms`)
    return response.data
  },

  getReviewsByHotelId: async (hotelId: number) => {
    const response = await api.get<ApiResponse<HotelReview[]>>(`/hotels/${hotelId}/reviews`)
    return response.data
  },

  createReview: async (hotelId: number, rating: number, comment: string) => {
    const response = await api.post<ApiResponse<HotelReview>>(`/hotels/${hotelId}/reviews`, null, {
      params: {
        rating,
        comment,
      },
    })
    return response.data
  },
}

