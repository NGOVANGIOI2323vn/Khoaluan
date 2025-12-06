import axios from 'axios'

// Sử dụng backend URL từ environment hoặc fallback về localhost
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:8081/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Don't set Content-Type for FormData, let browser set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    })
    
    // Chỉ redirect về login nếu không phải đang ở trang public hoặc login
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password', '/', '/hotels', '/hotel/', '/about', '/contact', '/oauth2/callback', '/login/oauth2/code', '/qr/']
      const isPublicPath = publicPaths.some(path => window.location.pathname.startsWith(path))
      
      // Chỉ redirect nếu đang ở trang protected (không phải public)
      // Và chỉ redirect nếu request đó thực sự yêu cầu authentication
      if (!isPublicPath && !window.location.pathname.includes('/login')) {
        // Kiểm tra xem request có phải là public endpoint không
        const publicEndpoints = ['/api/hotels', '/api/info', '/api/auth', '/api/geocoding', '/api/chat', '/api/vnpay/return']
        const isPublicEndpoint = error.config?.url && publicEndpoints.some(endpoint => error.config.url.includes(endpoint))
        
        // Chỉ redirect nếu không phải public endpoint
        if (!isPublicEndpoint) {
          localStorage.removeItem('token')
          localStorage.removeItem('userRole')
          localStorage.removeItem('username')
          localStorage.removeItem('userId')
          window.location.href = '/login'
        }
      }
      // Nếu đang ở trang public, không làm gì cả
      // User vẫn có thể xem trang public ngay cả khi token hết hạn
    }
    return Promise.reject(error)
  }
)

export default api

