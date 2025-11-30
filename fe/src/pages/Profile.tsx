import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { userService, type UserProfile, type UpdateProfileData, type ChangePasswordData } from '../services/userService'
import { useToast } from '../hooks/useToast'
import { authService } from '../services/authService'

const Profile = () => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [updating, setUpdating] = useState(false)
  
  const [profileForm, setProfileForm] = useState<UpdateProfileData>({
    username: '',
    email: '',
    phone: '',
  })
  
  const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
    oldPassword: '',
    newPassword: '',
  })
  
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<{
    username?: string
    email?: string
    phone?: string
    oldPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  const validateEmail = (email: string) => {
    // Email validation: tên@domain.extension
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email.trim())
  }

  const validatePhone = (phone: string) => {
    // Phone validation: 9-10 chữ số (khớp với BE)
    const cleanedPhone = phone.replace(/\D/g, '')
    return /^[0-9]{9,10}$/.test(cleanedPhone)
  }

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await userService.getProfile()
      if (response.data) {
        setProfile(response.data)
        setProfileForm({
          username: response.data.username || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
        })
      } else {
        showError('Không thể tải thông tin tài khoản. Vui lòng thử lại sau.')
      }
    } catch (err: unknown) {
      console.error('Error fetching profile:', err)
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể tải thông tin tài khoản. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors: { username?: string; email?: string; phone?: string } = {}
    
    if (!profileForm.username.trim()) {
      errors.username = 'Tên người dùng là bắt buộc'
    } else if (profileForm.username.trim().length < 3) {
      errors.username = 'Tên người dùng phải có ít nhất 3 ký tự'
    } else if (profileForm.username.trim().length > 50) {
      errors.username = 'Tên người dùng không được quá 50 ký tự'
    }
    
    if (!profileForm.email.trim()) {
      errors.email = 'Email là bắt buộc'
    } else if (!validateEmail(profileForm.email)) {
      errors.email = 'Email không hợp lệ'
    }
    
    if (!profileForm.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc'
    } else if (!validatePhone(profileForm.phone)) {
      const cleanedPhone = profileForm.phone.replace(/\D/g, '')
      if (cleanedPhone.length < 9 || cleanedPhone.length > 10) {
        errors.phone = 'Số điện thoại phải có 9 hoặc 10 chữ số'
      } else {
        errors.phone = 'Số điện thoại chỉ được chứa số (0-9)'
      }
    }
    
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    
    try {
      setUpdating(true)
      // Làm sạch số điện thoại trước khi gửi
      const cleanedPhone = profileForm.phone.replace(/\D/g, '')
      const submitData = {
        ...profileForm,
        phone: cleanedPhone,
        username: profileForm.username.trim(),
        email: profileForm.email.trim(),
      }
      const response = await userService.updateProfile(submitData)
      if (response.data) {
        showSuccess('Cập nhật thông tin thành công!')
        setProfile(response.data)
        // Cập nhật localStorage
        localStorage.setItem('username', response.data.username)
        window.dispatchEvent(new Event('localStorageUpdate'))
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.')
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors: { oldPassword?: string; newPassword?: string; confirmPassword?: string } = {}
    
    if (!passwordForm.oldPassword) {
      errors.oldPassword = 'Mật khẩu cũ là bắt buộc'
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Mật khẩu mới là bắt buộc'
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc'
    } else if (passwordForm.newPassword !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }
    
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    
    try {
      setUpdating(true)
      const response = await userService.changePassword(passwordForm)
      if (response.data) {
        showSuccess('Đổi mật khẩu thành công!')
        setPasswordForm({ oldPassword: '', newPassword: '' })
        setConfirmPassword('')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ và thử lại.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Thông tin cá nhân</h1>
            <p className="text-blue-100">Quản lý thông tin tài khoản của bạn</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                  activeTab === 'password'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Đổi mật khẩu
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'profile' && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleUpdateProfile}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên người dùng
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => {
                      setProfileForm({ ...profileForm, username: e.target.value })
                      if (validationErrors.username) {
                        setValidationErrors({ ...validationErrors, username: undefined })
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.username && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => {
                      setProfileForm({ ...profileForm, email: e.target.value })
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: undefined })
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại (9-10 số)"
                    value={profileForm.phone}
                    onChange={(e) => {
                      // Chỉ cho phép nhập số
                      const value = e.target.value.replace(/\D/g, '')
                      setProfileForm({ ...profileForm, phone: value })
                      if (validationErrors.phone) {
                        setValidationErrors({ ...validationErrors, phone: undefined })
                      }
                    }}
                    maxLength={10}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.phone}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={profile?.verified ? 'text-green-600' : 'text-yellow-600'}>
                    {profile?.verified ? '✓' : '⚠'}
                  </span>
                  <span>
                    {profile?.verified ? 'Tài khoản đã xác thực' : 'Tài khoản chưa xác thực'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </button>
              </motion.form>
            )}

            {activeTab === 'password' && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleChangePassword}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu cũ
                  </label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                      if (validationErrors.oldPassword) {
                        setValidationErrors({ ...validationErrors, oldPassword: undefined })
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.oldPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.oldPassword && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.oldPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      if (validationErrors.newPassword) {
                        setValidationErrors({ ...validationErrors, newPassword: undefined })
                      }
                      if (confirmPassword && validationErrors.confirmPassword) {
                        setValidationErrors({ ...validationErrors, confirmPassword: undefined })
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (validationErrors.confirmPassword) {
                        setValidationErrors({ ...validationErrors, confirmPassword: undefined })
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updating ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                </button>
              </motion.form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile

