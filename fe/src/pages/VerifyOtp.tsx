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
  const [otpError, setOtpError] = useState('')
  const { showSuccess } = useToast()

  const validateOtp = (otpValue: string) => {
    // OTP validation: phải đúng 6 chữ số (0-9) - khớp với BE (RandomOTP.generateOTP(6))
    const otpRegex = /^[0-9]{6}$/
    return otpRegex.test(otpValue.trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOtpError('')
    
    if (!email) {
      setError('Email không được tìm thấy. Vui lòng đăng ký lại.')
      return
    }
    
    const trimmedOtp = otp.trim()
    
    if (!trimmedOtp) {
      setOtpError('Mã OTP là bắt buộc')
      return
    }
    
    if (trimmedOtp.length !== 6) {
      setOtpError('Mã OTP phải có đúng 6 chữ số')
      return
    }
    
    if (!validateOtp(trimmedOtp)) {
      setOtpError('Mã OTP chỉ được chứa số (0-9)')
      return
    }
    
    setLoading(true)

    try {
      // Làm sạch OTP (chỉ giữ số) và trim trước khi gửi lên BE
      const cleanedOtp = trimmedOtp.replace(/\D/g, '')
      const response = await authService.verifyOtp({ email, otp: cleanedOtp })
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
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Nhập mã OTP (6 chữ số)"
                value={otp}
                onChange={(e) => {
                  // Chỉ cho phép nhập số, tối đa 6 chữ số - khớp với BE (RandomOTP.generateOTP(6))
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtp(value)
                  if (otpError) {
                    setOtpError('')
                  }
                }}
                maxLength={6}
                className={`w-full px-4 py-2.5 md:py-3 bg-gray-200 rounded-lg border-2 outline-none text-center text-2xl tracking-widest text-sm md:text-base ${
                  otpError ? 'border-red-500' : 'border-transparent'
                }`}
              />
              {otpError && (
                <p className="mt-1 text-sm text-red-500">{otpError}</p>
              )}
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

