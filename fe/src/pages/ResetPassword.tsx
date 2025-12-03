import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '../hooks/useToast'
import Header from '../components/Header'

const ResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  
  const [step, setStep] = useState<'otp' | 'password'>('otp')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { showSuccess } = useToast()

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password')
    }
  }, [email, navigate])

  const validateOtp = (otpValue: string) => {
    const otpRegex = /^[0-9]{6}$/
    return otpRegex.test(otpValue.trim())
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOtpError('')
    
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
      const cleanedOtp = trimmedOtp.replace(/\D/g, '')
      const response = await authService.verifyForgotPasswordOtp({ email, otp: cleanedOtp })
      if (response.message) {
        showSuccess('Xác thực OTP thành công! Vui lòng nhập mật khẩu mới.')
        setStep('password')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPasswordError('')
    setConfirmPasswordError('')
    
    if (!newPassword) {
      setPasswordError('Mật khẩu mới là bắt buộc')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Xác nhận mật khẩu là bắt buộc')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp')
      return
    }
    
    setLoading(true)

    try {
      const cleanedOtp = otp.trim().replace(/\D/g, '')
      const response = await authService.resetPassword({
        email,
        otp: cleanedOtp,
        newPassword,
      })
      if (response.message) {
        showSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.')
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
            {step === 'otp' ? 'Xác Thực OTP' : 'Đặt Lại Mật Khẩu'}
          </h1>
          
          <p className="text-center text-gray-600 mb-6 text-sm md:text-base">
            {step === 'otp' 
              ? `Mã OTP đã được gửi đến email: ${email}`
              : 'Vui lòng nhập mật khẩu mới của bạn'
            }
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    🔒
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (passwordError) {
                        setPasswordError('')
                      }
                    }}
                    className={`w-full pl-10 pr-12 py-2.5 md:py-3 bg-gray-200 rounded-lg border-2 outline-none text-sm md:text-base ${
                      passwordError ? 'border-red-500' : 'border-transparent'
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
                {passwordError && (
                  <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                )}
              </div>

              <div>
                <label className="block text-blue-600 font-semibold mb-2 text-sm md:text-base">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    🔒
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (confirmPasswordError) {
                        setConfirmPasswordError('')
                      }
                    }}
                    className={`w-full pl-10 pr-12 py-2.5 md:py-3 bg-gray-200 rounded-lg border-2 outline-none text-sm md:text-base ${
                      confirmPasswordError ? 'border-red-500' : 'border-transparent'
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
                {confirmPasswordError && (
                  <p className="mt-1 text-sm text-red-500">{confirmPasswordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang đổi mật khẩu...' : 'Đổi Mật Khẩu'}
              </button>
            </form>
          )}

          <p className="text-center text-gray-600 text-sm md:text-base mt-4">
            <Link to="/login" className="text-blue-600 hover:underline">
              Quay lại đăng nhập
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default ResetPassword

