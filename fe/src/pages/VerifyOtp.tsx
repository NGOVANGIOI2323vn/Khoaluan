import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '../hooks/useToast'
import Header from '../components/Header'

const VerifyOtp = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const { showSuccess } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Email không được tìm thấy. Vui lòng đăng ký lại.')
      return
    }
    
    if (otp.length !== 6) {
      setError('Mã OTP phải có 6 chữ số')
      return
    }
    
    setLoading(true)

    try {
      const response = await authService.verifyOtp({ email, otp })
      if (response.message) {
        showSuccess('Xác thực email thành công! Bạn có thể đăng nhập ngay.')
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) {
      setError('Email không được tìm thấy.')
      return
    }
    
    setResending(true)
    setError('')
    
    try {
      const response = await authService.sendOtp(email)
      if (response.message) {
        showSuccess('Mã OTP mới đã được gửi đến email của bạn.')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Không thể gửi lại OTP. Vui lòng thử lại.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Verify OTP Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 rounded-lg border-2 border-purple-500 p-6 md:p-8 w-full max-w-md"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2 text-center">
            Xác thực Email
          </h1>
          
          <p className="text-center text-gray-600 mb-6 text-sm md:text-base">
            Chúng tôi đã gửi mã OTP đến email: <br />
            <span className="font-semibold text-blue-600">{email || 'N/A'}</span>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                Nhập mã OTP (6 chữ số)
              </label>
              <input
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtp(value)
                }}
                required
                maxLength={6}
                className="w-full px-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-none outline-none text-center text-2xl tracking-widest text-sm md:text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-blue-600 hover:underline text-sm md:text-base disabled:opacity-50"
              >
                {resending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm md:text-base">
              Quay lại{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Đăng ký
              </Link>
              {' hoặc '}
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

export default VerifyOtp

