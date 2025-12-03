import api from './api'

export interface RegisterData {
  username: string
  email: string
  password: string
  Phone: string
  role?: string
}

export interface LoginData {
  username: string
  password: string
}

export interface VerifyOtpData {
  email: string
  otp: string
}

export interface LoginResponse {
  token: string
  username: string
  email: string
  role: string
  userId: number
}

export interface AuthResponse {
  message: string
  data: LoginResponse | string | unknown
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>('/auth/register', {
      ...data,
      role: data.role || 'USER',
    })
    return response.data
  },

  registerOwner: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>('/auth/register/owner', {
      ...data,
      role: 'OWNER',
    })
    return response.data
  },

  login: async (data: LoginData) => {
      const response = await api.post<AuthResponse>('/auth/login', data)
      
      // Response structure: { status, message, data: LoginResponse }
      if (response.data && response.data.data && typeof response.data.data === 'object') {
        const loginData = response.data.data as LoginResponse
        
        if (loginData.token) {
          // Normalize role name (remove ROLE_ prefix if exists)
          const normalizedRole = (loginData.role?.replace('ROLE_', '') || 'USER').toUpperCase()
          
          localStorage.setItem('token', loginData.token)
          localStorage.setItem('userRole', normalizedRole)
          localStorage.setItem('username', loginData.username)
          localStorage.setItem('userId', loginData.userId.toString())
          
          // Dispatch custom event to notify Header component
          window.dispatchEvent(new Event('localStorageUpdate'))
        } else {
          throw new Error('No token returned from login response')
        }
      } else {
        throw new Error('Invalid login response structure')
      }
      
      return response.data
  },

  sendOtp: async (email: string) => {
    const response = await api.post('/auth/otp/send', null, {
      params: { email },
    })
    return response.data
  },

  verifyOtp: async (data: VerifyOtpData) => {
    const response = await api.post<AuthResponse>('/auth/otp/verify', data)
    return response.data
  },

  sendForgotPasswordOtp: async (email: string) => {
    const response = await api.post('/auth/forgot-password/send-otp', null, {
      params: { email },
    })
    return response.data
  },

  verifyForgotPasswordOtp: async (data: VerifyOtpData) => {
    const response = await api.post<AuthResponse>('/auth/forgot-password/verify-otp', data)
    return response.data
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const response = await api.post<AuthResponse>('/auth/forgot-password/reset', data)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
    
    // Dispatch custom event to notify Header component
    window.dispatchEvent(new Event('localStorageUpdate'))
  },

  getUserRole: () => {
    return localStorage.getItem('userRole')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },
}

