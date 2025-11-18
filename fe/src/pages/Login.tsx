import { useState } from 'react'
import { motion } from 'framer-motion'
import { authService } from '../services/authService'
import Header from '../components/Header'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(formData)
      
      // Kiểm tra xem token đã được lưu chưa
      const token = localStorage.getItem('token')
      const role = authService.getUserRole()
      
      if (!token) {
        setError('Đăng nhập thất bại: Không nhận được token')
        return
      }
      
      if (!role) {
        if (response && typeof response === 'object' && 'data' in response) {
          const responseData = response as { data?: { role?: string }; message?: string }
          if (responseData.data && typeof responseData.data === 'object' && 'role' in responseData.data) {
            const loginData = responseData.data as { role: string }
            const normalizedRole = (loginData.role?.replace('ROLE_', '') || '').toUpperCase()
            localStorage.setItem('userRole', normalizedRole)
            
            // Đợi một chút để đảm bảo localStorage đã được set
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Navigate sau khi set role - sử dụng window.location để tránh React Router re-render issues
            if (normalizedRole === 'ADMIN') {
              window.location.href = '/admin'
            } else if (normalizedRole === 'OWNER') {
              window.location.href = '/owner'
            } else {
              window.location.href = '/hotels'
            }
            return
          }
        }
        setError('Đăng nhập thất bại: Không nhận được role')
        return
      }
      
      // Đợi một chút để đảm bảo localStorage đã được set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (role === 'ADMIN') {
        window.location.href = '/admin'
      } else if (role === 'OWNER') {
        window.location.href = '/owner'
      } else {
        window.location.href = '/hotels'
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Sử dụng backend URL từ environment hoặc fallback về localhost
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081'
    // Redirect đến backend OAuth2 endpoint - backend sẽ redirect đến Google
    window.location.href = `${backendUrl}/oauth2/authorization/google`
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 rounded-lg border-2 border-purple-500 p-6 md:p-8 w-full max-w-md"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
            Đăng Nhập 👋
          </h1>
          <p className="text-gray-600 mb-6 text-sm md:text-base">
            Đăng nhập để sử dụng dịch vụ của chúng tôi
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Tài Khoản
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  ✉️
                </span>
                <input
                  type="text"
                  placeholder="Nhập tài khoản"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-none outline-none text-sm md:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Mật Khẩu
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập Mật Khẩu"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full pl-10 pr-12 py-2.5 md:py-3 bg-gray-200 rounded-lg border-none outline-none text-sm md:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg cursor-pointer select-none"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleGoogleLogin()
            }}
            className="w-full bg-white border border-gray-300 py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition text-sm md:text-base mt-4"
          >
            <span className="text-lg md:text-xl">G</span>
            <span>Đăng nhập với tài khoản Google</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
