import api from './api'

export interface UserProfile {
  id: number
  username: string
  email: string
  phone: string
  verified: boolean
  role?: {
    id: number
    name: string
  }
}

export interface UpdateProfileData {
  username: string
  email: string
  phone: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

export interface ApiResponse<T> {
  status: string
  message: string
  data: T
  errorCode?: string
  timestamp?: string
}

export const userService = {
  getProfile: async () => {
    const response = await api.get<ApiResponse<UserProfile>>('/user/profile')
    return response.data
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put<ApiResponse<UserProfile>>('/user/profile', data)
    return response.data
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await api.put<ApiResponse<string>>('/user/password', data)
    return response.data
  },
}

