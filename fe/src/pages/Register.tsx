import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import Header from '../components/Header'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    Phone: '',
    role: 'USER',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)

    try {
      const response = await authService.register(formData)
      if (response.message) {
        // Tự động gửi OTP sau khi đăng ký thành công
        try {
          await authService.sendOtp(formData.email)
          // Chuyển đến trang verify OTP với email
          navigate('/verify-otp', { state: { email: formData.email } })
        } catch (otpError) {
          console.error('Failed to send OTP automatically', otpError)
          // Nếu gửi OTP thất bại, vẫn chuyển đến trang verify để user có thể yêu cầu gửi lại
          navigate('/verify-otp', { state: { email: formData.email } })
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Register Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 rounded-lg border-2 border-purple-500 p-6 md:p-8 w-full max-w-md"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-6 text-center">
            Đăng ký tài khoản
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full px-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-none outline-none text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Email
              </label>
              <input
                type="email"
                placeholder="Nhập Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-none outline-none text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Số điện thoại
              </label>
              <input
                type="text"
                placeholder="Nhập số điện thoại"
                value={formData.Phone}
                onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                required
                className="w-full px-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-none outline-none text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập Mật Khẩu"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 pr-12 py-2.5 md:py-3 bg-gray-200 rounded-lg border-none outline-none text-sm md:text-base"
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

            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 pr-12 py-2.5 md:py-3 bg-gray-200 rounded-lg border-none outline-none text-sm md:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg cursor-pointer select-none"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Chọn vai trò
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-none outline-none text-sm md:text-base"
              >
                <option value="USER">Khách hàng</option>
                <option value="OWNER">Chủ khách sạn</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>

            <p className="text-center text-gray-600 text-sm md:text-base">
              Bạn đã có tài khoản ?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Đăng Nhập Ngay.
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
