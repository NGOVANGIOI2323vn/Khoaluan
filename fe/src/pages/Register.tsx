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
  const [validationErrors, setValidationErrors] = useState<{
    username?: string
    email?: string
    phone?: string
    password?: string
    confirmPassword?: string
  }>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9+\-\s()]{9,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const validateForm = () => {
    const errors: {
      username?: string
      email?: string
      phone?: string
      password?: string
      confirmPassword?: string
    } = {}
    
    if (!formData.username.trim()) {
      errors.username = 'Tên đăng nhập là bắt buộc'
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    } else if (formData.username.trim().length > 50) {
      errors.username = 'Tên đăng nhập không được quá 50 ký tự'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email không hợp lệ'
    }
    
    if (!formData.Phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc'
    } else if (!validatePhone(formData.Phone)) {
      errors.phone = 'Số điện thoại không hợp lệ (9-15 số)'
    }
    
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc'
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc'
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
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
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value })
                  if (validationErrors.username) {
                    setValidationErrors({ ...validationErrors, username: undefined })
                  }
                }}
                className={`w-full px-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-2 outline-none text-sm md:text-base ${
                  validationErrors.username ? 'border-red-500' : 'border-transparent'
                }`}
              />
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Email
              </label>
              <input
                type="email"
                placeholder="Nhập Email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: undefined })
                  }
                }}
                className={`w-full px-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-2 outline-none text-sm md:text-base ${
                  validationErrors.email ? 'border-red-500' : 'border-transparent'
                }`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                value={formData.Phone}
                onChange={(e) => {
                  setFormData({ ...formData, Phone: e.target.value })
                  if (validationErrors.phone) {
                    setValidationErrors({ ...validationErrors, phone: undefined })
                  }
                }}
                className={`w-full px-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-2 outline-none text-sm md:text-base ${
                  validationErrors.phone ? 'border-red-500' : 'border-transparent'
                }`}
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.phone}</p>
              )}
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
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: undefined })
                    }
                    if (confirmPassword && validationErrors.confirmPassword) {
                      setValidationErrors({ ...validationErrors, confirmPassword: undefined })
                    }
                  }}
                  className={`w-full px-4 pr-12 py-2.5 md:py-3 bg-gray-200 rounded-lg border-2 outline-none text-sm md:text-base ${
                    validationErrors.password ? 'border-red-500' : 'border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg cursor-pointer select-none"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
              )}
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
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (validationErrors.confirmPassword) {
                      setValidationErrors({ ...validationErrors, confirmPassword: undefined })
                    }
                  }}
                  className={`w-full px-4 pr-12 py-2.5 md:py-3 bg-gray-200 rounded-lg border-2 outline-none text-sm md:text-base ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg cursor-pointer select-none"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
              )}
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
