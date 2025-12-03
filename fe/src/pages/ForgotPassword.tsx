import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '../hooks/useToast'
import Header from '../components/Header'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const { showSuccess } = useToast()

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailValue.trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    
    const trimmedEmail = email.trim()
    
    if (!trimmedEmail) {
      setEmailError('Email là bắt buộc')
      return
    }
    
    if (!validateEmail(trimmedEmail)) {
      setEmailError('Email không hợp lệ')
      return
    }
    
    setLoading(true)

    try {
      const response = await authService.sendForgotPasswordOtp(trimmedEmail)
      if (response.message) {
        showSuccess('Mã OTP đã được gửi đến email của bạn.')
        navigate('/reset-password', { state: { email: trimmedEmail } })
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 rounded-lg border-2 border-purple-500 p-6 md:p-8 w-full max-w-md"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2 text-center">
            Quên Mật Khẩu
          </h1>
          
          <p className="text-center text-gray-600 mb-6 text-sm md:text-base">
            Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  📧
                </span>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) {
                      setEmailError('')
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-2 outline-none text-sm md:text-base ${
                    emailError ? 'border-red-500' : 'border-transparent'
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>

            <p className="text-center text-gray-600 text-sm md:text-base">
              Nhớ mật khẩu?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPassword

