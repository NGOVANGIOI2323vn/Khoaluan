import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const OAuth2Callback = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleOAuth2Callback = async () => {
      try {
        // Lấy parameters từ URL
        const urlParams = new URLSearchParams(window.location.search)
        
        // Kiểm tra error parameters trước (nếu có error, redirect về login với error message)
        const errorParam = urlParams.get('error')
        const messageParam = urlParams.get('message')
        
        if (errorParam) {
          const errorMessage = messageParam 
            ? decodeURIComponent(messageParam) 
            : 'Đăng nhập Google thất bại. Vui lòng thử lại.'
          setError(errorMessage)
          setLoading(false)
          // Redirect về login với error message sau 2 giây
          setTimeout(() => {
            navigate(`/login?error=${errorParam}&message=${encodeURIComponent(errorMessage)}`)
          }, 2000)
          return
        }
        
        // Lấy token từ URL parameter
        const token = urlParams.get('token')

        if (!token) {
          throw new Error('Không tìm thấy token trong URL. Vui lòng đăng nhập lại.')
        }

        // Gọi API để lấy thông tin user từ token
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081'
        const response = await fetch(`${backendUrl}/api/auth/success?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Không thể lấy thông tin đăng nhập')
        }

        const data = await response.json()
        
        if (data && data.data && typeof data.data === 'object') {
          const loginData = data.data as {
            token: string
            username: string
            email: string
            role: string
            userId: number
          }

          if (loginData.token) {
            // Normalize role name (remove ROLE_ prefix if exists)
            const normalizedRole = (loginData.role?.replace('ROLE_', '') || 'USER').toUpperCase()

            localStorage.setItem('token', loginData.token)
            localStorage.setItem('userRole', normalizedRole)
            localStorage.setItem('username', loginData.username)
            localStorage.setItem('userId', loginData.userId.toString())

            // Dispatch custom event to notify Header component
            window.dispatchEvent(new Event('localStorageUpdate'))

            // Redirect based on role
            if (normalizedRole === 'ADMIN') {
              window.location.href = '/admin'
            } else if (normalizedRole === 'OWNER') {
              window.location.href = '/owner'
            } else {
              window.location.href = '/hotels'
            }
          } else {
            throw new Error('Không nhận được token từ server')
          }
        } else {
          throw new Error('Dữ liệu phản hồi không hợp lệ')
        }
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.')
        setLoading(false)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    handleOAuth2Callback()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xử lý đăng nhập Google...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-bold">Lỗi đăng nhập</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">Đang chuyển hướng về trang đăng nhập...</p>
        </div>
      </div>
    </div>
  )
}

export default OAuth2Callback

